const express = require('express');
const { query } = require('../config/database');
const { authorizeRoles } = require('../middleware/auth');
const router = express.Router();

// Generate unique student ID and tracking number
const generateStudentId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `STU${year}${random}`;
};

const generateTrackingNumber = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `TRK${timestamp}${random}`.toUpperCase();
};

// Get all students (with filtering and pagination)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, assignedTo } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereClause += ` AND s.current_status = $${paramCount}`;
      params.push(status);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (s.first_name ILIKE $${paramCount} OR s.last_name ILIKE $${paramCount} OR s.student_id ILIKE $${paramCount} OR s.tracking_number ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (assignedTo) {
      paramCount++;
      whereClause += ` AND (s.assigned_consular_id = $${paramCount} OR s.assigned_officer_id = $${paramCount})`;
      params.push(assignedTo);
    }

    // Role-based filtering
    if (req.user.role === 'student_consular') {
      paramCount++;
      whereClause += ` AND s.assigned_consular_id = $${paramCount}`;
      params.push(req.user.id);
    } else if (req.user.role === 'admission_officer') {
      paramCount++;
      whereClause += ` AND s.assigned_officer_id = $${paramCount}`;
      params.push(req.user.id);
    } else if (req.user.role === 'receptionist') {
      paramCount++;
      whereClause += ` AND s.created_by = $${paramCount}`;
      params.push(req.user.id);
    }

    const studentsQuery = `
      SELECT 
        s.*,
        u1.first_name as consular_first_name,
        u1.last_name as consular_last_name,
        u2.first_name as officer_first_name,
        u2.last_name as officer_last_name,
        u3.first_name as created_by_first_name,
        u3.last_name as created_by_last_name
      FROM students s
      LEFT JOIN users u1 ON s.assigned_consular_id = u1.id
      LEFT JOIN users u2 ON s.assigned_officer_id = u2.id
      LEFT JOIN users u3 ON s.created_by = u3.id
      ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);

    const result = await query(studentsQuery, params);

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM students s ${whereClause}`;
    const countResult = await query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    res.json({
      students: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get single student by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        s.*,
        u1.first_name as consular_first_name,
        u1.last_name as consular_last_name,
        u2.first_name as officer_first_name,
        u2.last_name as officer_last_name,
        u3.first_name as created_by_first_name,
        u3.last_name as created_by_last_name
      FROM students s
      LEFT JOIN users u1 ON s.assigned_consular_id = u1.id
      LEFT JOIN users u2 ON s.assigned_officer_id = u2.id
      LEFT JOIN users u3 ON s.created_by = u3.id
      WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = result.rows[0];

    // Check permissions
    if (req.user.role === 'student_consular' && student.assigned_consular_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user.role === 'admission_officer' && student.assigned_officer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user.role === 'receptionist' && student.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ student });

  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// Create new student (Receptionist only)
router.post('/', authorizeRoles('receptionist', 'hod', 'admin'), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      nationality,
      intendedProgram,
      countryPreference,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !intendedProgram || !countryPreference) {
      return res.status(400).json({ 
        error: 'First name, last name, intended program, and country preference are required' 
      });
    }

    const studentId = generateStudentId();
    const trackingNumber = generateTrackingNumber();

    const result = await query(
      `INSERT INTO students (
        student_id, tracking_number, first_name, last_name, email, phone,
        date_of_birth, nationality, intended_program, country_preference, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        studentId, trackingNumber, firstName, lastName, email, phone,
        dateOfBirth, nationality, intendedProgram, countryPreference, req.user.id
      ]
    );

    res.status(201).json({
      message: 'Student created successfully',
      student: result.rows[0],
    });

  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      nationality,
      intendedProgram,
      countryPreference,
      currentStatus,
      assignedConsularId,
      assignedOfficerId,
    } = req.body;

    // Check if student exists and user has permission
    const studentCheck = await query(
      'SELECT * FROM students WHERE id = $1',
      [id]
    );

    if (studentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = studentCheck.rows[0];

    // Permission checks
    if (req.user.role === 'receptionist' && student.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user.role === 'student_consular' && student.assigned_consular_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user.role === 'admission_officer' && student.assigned_officer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Build update query dynamically
    const updateFields = [];
    const params = [];
    let paramCount = 0;

    if (firstName) {
      paramCount++;
      updateFields.push(`first_name = $${paramCount}`);
      params.push(firstName);
    }
    if (lastName) {
      paramCount++;
      updateFields.push(`last_name = $${paramCount}`);
      params.push(lastName);
    }
    if (email !== undefined) {
      paramCount++;
      updateFields.push(`email = $${paramCount}`);
      params.push(email);
    }
    if (phone !== undefined) {
      paramCount++;
      updateFields.push(`phone = $${paramCount}`);
      params.push(phone);
    }
    if (dateOfBirth) {
      paramCount++;
      updateFields.push(`date_of_birth = $${paramCount}`);
      params.push(dateOfBirth);
    }
    if (nationality) {
      paramCount++;
      updateFields.push(`nationality = $${paramCount}`);
      params.push(nationality);
    }
    if (intendedProgram) {
      paramCount++;
      updateFields.push(`intended_program = $${paramCount}`);
      params.push(intendedProgram);
    }
    if (countryPreference) {
      paramCount++;
      updateFields.push(`country_preference = $${paramCount}`);
      params.push(countryPreference);
    }

    // Only HoD and Admin can change assignments and status
    if (['hod', 'admin'].includes(req.user.role)) {
      if (currentStatus) {
        paramCount++;
        updateFields.push(`current_status = $${paramCount}`);
        params.push(currentStatus);
      }
      if (assignedConsularId !== undefined) {
        paramCount++;
        updateFields.push(`assigned_consular_id = $${paramCount}`);
        params.push(assignedConsularId);
      }
      if (assignedOfficerId !== undefined) {
        paramCount++;
        updateFields.push(`assigned_officer_id = $${paramCount}`);
        params.push(assignedOfficerId);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    paramCount++;
    params.push(id);

    const updateQuery = `
      UPDATE students 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, params);

    res.json({
      message: 'Student updated successfully',
      student: result.rows[0],
    });

  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// Delete student (HoD and Admin only)
router.delete('/:id', authorizeRoles('hod', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM students WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      message: 'Student deleted successfully',
      student: result.rows[0],
    });

  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

module.exports = router;