const express = require('express');
const { query } = require('../config/database');
const { authorizeRoles } = require('../middleware/auth');
const router = express.Router();

// Get all tasks (with filtering)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, assignedTo, studentId } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Role-based filtering
    if (req.user.role !== 'hod' && req.user.role !== 'admin') {
      paramCount++;
      whereClause += ` AND (t.assigned_to = $${paramCount} OR t.created_by = $${paramCount})`;
      params.push(req.user.id);
    }

    if (status) {
      paramCount++;
      whereClause += ` AND t.status = $${paramCount}`;
      params.push(status);
    }

    if (priority) {
      paramCount++;
      whereClause += ` AND t.priority = $${paramCount}`;
      params.push(priority);
    }

    if (assignedTo) {
      paramCount++;
      whereClause += ` AND t.assigned_to = $${paramCount}`;
      params.push(assignedTo);
    }

    if (studentId) {
      paramCount++;
      whereClause += ` AND t.student_id = $${paramCount}`;
      params.push(studentId);
    }

    const tasksQuery = `
      SELECT 
        t.*,
        u1.first_name as assigned_to_first_name,
        u1.last_name as assigned_to_last_name,
        u2.first_name as created_by_first_name,
        u2.last_name as created_by_last_name,
        s.first_name as student_first_name,
        s.last_name as student_last_name,
        s.student_id
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      LEFT JOIN students s ON t.student_id = s.id
      ${whereClause}
      ORDER BY 
        CASE t.priority 
          WHEN 'urgent' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
        END,
        t.due_date ASC NULLS LAST,
        t.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);

    const result = await query(tasksQuery, params);

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM tasks t ${whereClause}`;
    const countResult = await query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    res.json({
      tasks: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get single task by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        t.*,
        u1.first_name as assigned_to_first_name,
        u1.last_name as assigned_to_last_name,
        u2.first_name as created_by_first_name,
        u2.last_name as created_by_last_name,
        s.first_name as student_first_name,
        s.last_name as student_last_name,
        s.student_id
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      LEFT JOIN students s ON t.student_id = s.id
      WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = result.rows[0];

    // Check permissions
    if (req.user.role !== 'hod' && req.user.role !== 'admin') {
      if (task.assigned_to !== req.user.id && task.created_by !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json({ task });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create new task
router.post('/', authorizeRoles('hod', 'admin', 'student_consular', 'admission_officer'), async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      studentId,
      priority = 'medium',
      dueDate,
    } = req.body;

    // Validate required fields
    if (!title || !assignedTo) {
      return res.status(400).json({ error: 'Title and assigned user are required' });
    }

    // Validate assigned user exists
    const userCheck = await query(
      'SELECT id FROM users WHERE id = $1 AND is_active = true',
      [assignedTo]
    );

    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Assigned user not found' });
    }

    // Validate student if provided
    if (studentId) {
      const studentCheck = await query(
        'SELECT id FROM students WHERE id = $1',
        [studentId]
      );

      if (studentCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Student not found' });
      }
    }

    const result = await query(
      `INSERT INTO tasks (title, description, assigned_to, created_by, student_id, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description, assignedTo, req.user.id, studentId, priority, dueDate]
    );

    res.status(201).json({
      message: 'Task created successfully',
      task: result.rows[0],
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      assignedTo,
      priority,
      status,
      dueDate,
    } = req.body;

    // Check if task exists
    const taskCheck = await query(
      'SELECT * FROM tasks WHERE id = $1',
      [id]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = taskCheck.rows[0];

    // Permission checks
    const canEdit = req.user.role === 'hod' || 
                   req.user.role === 'admin' || 
                   task.created_by === req.user.id ||
                   task.assigned_to === req.user.id;

    if (!canEdit) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Build update query
    const updateFields = [];
    const params = [];
    let paramCount = 0;

    if (title) {
      paramCount++;
      updateFields.push(`title = $${paramCount}`);
      params.push(title);
    }
    if (description !== undefined) {
      paramCount++;
      updateFields.push(`description = $${paramCount}`);
      params.push(description);
    }
    if (assignedTo && (req.user.role === 'hod' || req.user.role === 'admin' || task.created_by === req.user.id)) {
      paramCount++;
      updateFields.push(`assigned_to = $${paramCount}`);
      params.push(assignedTo);
    }
    if (priority) {
      paramCount++;
      updateFields.push(`priority = $${paramCount}`);
      params.push(priority);
    }
    if (status) {
      paramCount++;
      updateFields.push(`status = $${paramCount}`);
      params.push(status);
      
      // Set completed_at if status is completed
      if (status === 'completed') {
        paramCount++;
        updateFields.push(`completed_at = $${paramCount}`);
        params.push(new Date());
      } else if (task.status === 'completed') {
        // Clear completed_at if changing from completed
        paramCount++;
        updateFields.push(`completed_at = $${paramCount}`);
        params.push(null);
      }
    }
    if (dueDate !== undefined) {
      paramCount++;
      updateFields.push(`due_date = $${paramCount}`);
      params.push(dueDate);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    paramCount++;
    params.push(id);

    const updateQuery = `
      UPDATE tasks 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, params);

    res.json({
      message: 'Task updated successfully',
      task: result.rows[0],
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', authorizeRoles('hod', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      message: 'Task deleted successfully',
      task: result.rows[0],
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;