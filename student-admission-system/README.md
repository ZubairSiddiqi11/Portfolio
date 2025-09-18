# Student Admission & Staff Management System

A comprehensive full-stack web application for managing student admissions and staff workflows with role-based access control, AI-powered suggestions, and advanced task management.

## 🚀 Features

### Core Functionality
- **Role-Based Access Control (RBAC)** - 5 distinct user roles with specific permissions
- **Student Registration & Tracking** - Complete student lifecycle management
- **Document Management** - Secure file upload and verification system
- **University Application Tracking** - End-to-end application status monitoring
- **Task Management** - Comprehensive task assignment and tracking
- **AI-Powered Recommendations** - OpenAI integration for university/country suggestions
- **Real-time Notifications** - Email and in-app notification system
- **Comprehensive Reporting** - Analytics and performance metrics
- **Audit Trail** - Complete action logging for compliance

### User Roles

#### 1. **Receptionist**
- Register new students with basic information
- Upload initial documents (Passport/ID, Academic Transcripts)
- Auto-generate Student ID and Tracking Number
- View students they registered

#### 2. **Student Consular**
- Review student profiles assigned to them
- Upload additional documents (SOP, IELTS, Recommendation Letters)
- Access AI-powered university/country suggestions
- Forward profiles to Admission Officers
- Manage assigned tasks

#### 3. **Admission Officer**
- Review complete student documentation
- Submit applications to universities
- Track application status (Pending → Submitted → In Review → Offer Received)
- Upload offer/rejection letters
- Update student status
- Manage assigned tasks

#### 4. **Head of Department (HoD)**
- Monitor all student cases with filtering capabilities
- Create and assign tasks to staff
- Reassign tasks and students
- Access comprehensive reports
- View complete audit logs
- Staff performance monitoring

#### 5. **System Admin**
- Complete system administration
- User management and role assignment
- System configuration
- Technical management
- Security settings

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - Modern React patterns

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development
- **JWT** - JSON Web Token authentication

### Database
- **PostgreSQL** - Relational database
- **pg** - PostgreSQL client for Node.js

### External Services
- **OpenAI API** - AI-powered university suggestions
- **Nodemailer** - Email notifications
- **Multer** - File upload handling

### Security & Performance
- **Helmet** - Security headers
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection
- **Morgan** - HTTP request logging
- **Compression** - Response compression

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn
- Git

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd student-admission-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb student_admission_db

# Run database schema
psql -d student_admission_db -f database/schema.sql
```

### 4. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configurations
nano .env
```

Required environment variables:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_admission_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# OpenAI Configuration (optional)
OPENAI_API_KEY=your_openai_api_key_here

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 5. Start the Application

#### Development Mode
```bash
# Start backend server
npm run server

# In another terminal, start frontend
npm run dev

# Or start both concurrently
npm run server:dev
```

#### Production Mode
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🔧 Default Login Credentials

The system comes with pre-configured demo accounts:

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| Admin | admin | admin123 | System Administrator |
| HoD | hod1 | admin123 | Head of Department |
| Admission Officer | officer1 | admin123 | Admission Officer |
| Student Consular | consular1 | admin123 | Student Consular |
| Receptionist | receptionist1 | admin123 | Receptionist |

## 📊 Database Schema

### Core Tables
- **users** - System users with role-based access
- **students** - Student profiles and tracking
- **documents** - File management and verification
- **applications** - University application tracking
- **tasks** - Task management system
- **comments** - Communication threads
- **notifications** - Notification system
- **audit_logs** - Complete audit trail
- **university_suggestions** - AI recommendation cache

### Key Relationships
- Students can be assigned to multiple staff members
- Tasks can be linked to specific students
- Documents are versioned and tracked
- All actions are logged for audit purposes

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication with secure token handling
- Role-based access control (RBAC) with granular permissions
- Password hashing using bcrypt with configurable rounds
- Optional 2FA for HoD and Admin roles

### Data Protection
- SQL injection prevention through parameterized queries
- XSS protection with input sanitization
- CSRF protection for state-changing operations
- Secure file upload with type validation
- Rate limiting to prevent abuse

### Audit & Compliance
- Comprehensive audit logging of all actions
- IP address and user agent tracking
- Data change tracking with before/after states
- Secure document storage with access controls

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/login - User login
POST /api/auth/register - Create new user (admin only)
GET /api/auth/profile - Get current user profile
```

### Student Management
```
GET /api/students - List students (with filtering)
GET /api/students/:id - Get single student
POST /api/students - Create new student (receptionist+)
PUT /api/students/:id - Update student
DELETE /api/students/:id - Delete student (HoD/admin only)
```

### Task Management
```
GET /api/tasks - List tasks (with filtering)
GET /api/tasks/:id - Get single task
POST /api/tasks - Create new task
PUT /api/tasks/:id - Update task
DELETE /api/tasks/:id - Delete task (HoD/admin only)
```

### Additional Endpoints
- `/api/documents` - Document management
- `/api/applications` - University applications
- `/api/notifications` - Notification system
- `/api/users` - User management

## 🚦 Development Guidelines

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Jest for unit testing

### Git Workflow
- Feature branches for new development
- Pull requests for code review
- Automated testing on commits
- Semantic commit messages

### Performance Optimization
- Database indexing for query performance
- Response compression for faster loading
- Caching strategies for frequent queries
- Lazy loading for large datasets

## 📈 Monitoring & Analytics

### Performance Metrics
- Response time monitoring
- Database query performance
- User activity tracking
- System resource usage

### Business Intelligence
- Student registration trends
- Staff productivity metrics
- University acceptance rates
- Task completion analytics

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Reset database connection
npm run db:reset
```

#### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in .env file
PORT=5001
```

#### File Upload Issues
```bash
# Check uploads directory permissions
chmod 755 uploads/
chown -R $USER:$USER uploads/
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

**Student Admission & Staff Management System** - Streamlining educational administration through technology.