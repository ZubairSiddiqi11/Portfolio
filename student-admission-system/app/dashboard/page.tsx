'use client';

import { useState, useEffect } from 'react';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  pendingTasks: number;
  completedTasks: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    pendingTasks: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Simulate loading stats (replace with actual API calls)
    setTimeout(() => {
      setStats({
        totalStudents: 142,
        activeStudents: 98,
        pendingTasks: 24,
        completedTasks: 156,
      });
      setLoading(false);
    }, 1000);
  }, []);

  const getRoleSpecificContent = () => {
    switch (user?.role) {
      case 'receptionist':
        return {
          title: 'Receptionist Dashboard',
          description: 'Register new students and manage initial documentation.',
          quickActions: [
            { name: 'Register New Student', href: '/dashboard/students/new', color: 'bg-green-500' },
            { name: 'View My Students', href: '/dashboard/students', color: 'bg-blue-500' },
          ],
        };
      case 'student_consular':
        return {
          title: 'Student Consular Dashboard',
          description: 'Review student profiles and provide university recommendations.',
          quickActions: [
            { name: 'Review Students', href: '/dashboard/students', color: 'bg-blue-500' },
            { name: 'AI Suggestions', href: '/dashboard/suggestions', color: 'bg-purple-500' },
            { name: 'My Tasks', href: '/dashboard/tasks', color: 'bg-orange-500' },
          ],
        };
      case 'admission_officer':
        return {
          title: 'Admission Officer Dashboard',
          description: 'Manage university applications and track admission outcomes.',
          quickActions: [
            { name: 'Review Applications', href: '/dashboard/applications', color: 'bg-blue-500' },
            { name: 'Upload Documents', href: '/dashboard/documents', color: 'bg-green-500' },
            { name: 'My Tasks', href: '/dashboard/tasks', color: 'bg-orange-500' },
          ],
        };
      case 'hod':
        return {
          title: 'Head of Department Dashboard',
          description: 'Monitor all operations, manage staff, and generate reports.',
          quickActions: [
            { name: 'View All Students', href: '/dashboard/students', color: 'bg-blue-500' },
            { name: 'Manage Tasks', href: '/dashboard/tasks', color: 'bg-orange-500' },
            { name: 'Staff Management', href: '/dashboard/staff', color: 'bg-purple-500' },
            { name: 'Generate Reports', href: '/dashboard/reports', color: 'bg-green-500' },
          ],
        };
      case 'admin':
        return {
          title: 'System Admin Dashboard',
          description: 'Full system access and administration capabilities.',
          quickActions: [
            { name: 'User Management', href: '/dashboard/users', color: 'bg-red-500' },
            { name: 'System Settings', href: '/dashboard/settings', color: 'bg-gray-500' },
            { name: 'Audit Logs', href: '/dashboard/audit', color: 'bg-indigo-500' },
            { name: 'Reports', href: '/dashboard/reports', color: 'bg-green-500' },
          ],
        };
      default:
        return {
          title: 'Dashboard',
          description: 'Welcome to the Student Admission Management System.',
          quickActions: [],
        };
    }
  };

  const roleContent = getRoleSpecificContent();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{roleContent.title}</h1>
        <p className="mt-2 text-gray-600">{roleContent.description}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="dashboard-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Students</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Active Students</h3>
              <p className="text-2xl font-bold text-green-600">{stats.activeStudents}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">⏳</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Pending Tasks</h3>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingTasks}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✨</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Completed Tasks</h3>
              <p className="text-2xl font-bold text-purple-600">{stats.completedTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roleContent.quickActions.map((action) => (
            <a
              key={action.name}
              href={action.href}
              className={`${action.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity duration-200 text-center font-medium`}
            >
              {action.name}
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span className="text-gray-600">Student John Doe registered for Computer Science program</span>
            <span className="ml-auto text-gray-400">2 hours ago</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-gray-600">Task "Review Documents" completed for Student ID: STU20240123</span>
            <span className="ml-auto text-gray-400">4 hours ago</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
            <span className="text-gray-600">New application submitted to University of Toronto</span>
            <span className="ml-auto text-gray-400">6 hours ago</span>
          </div>
          <div className="text-center pt-4">
            <a href="/dashboard/activity" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
              View all activity →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}