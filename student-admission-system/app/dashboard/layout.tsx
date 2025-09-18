'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      console.error('Invalid user data');
      router.push('/auth/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    ];

    switch (user?.role) {
      case 'receptionist':
        return [
          ...baseItems,
          { name: 'Register Student', href: '/dashboard/students/new', icon: '➕' },
          { name: 'My Students', href: '/dashboard/students', icon: '👥' },
        ];
      case 'student_consular':
        return [
          ...baseItems,
          { name: 'Students', href: '/dashboard/students', icon: '👥' },
          { name: 'AI Suggestions', href: '/dashboard/suggestions', icon: '🤖' },
          { name: 'Tasks', href: '/dashboard/tasks', icon: '📋' },
        ];
      case 'admission_officer':
        return [
          ...baseItems,
          { name: 'Students', href: '/dashboard/students', icon: '👥' },
          { name: 'Applications', href: '/dashboard/applications', icon: '📄' },
          { name: 'Tasks', href: '/dashboard/tasks', icon: '📋' },
        ];
      case 'hod':
      case 'admin':
        return [
          ...baseItems,
          { name: 'Students', href: '/dashboard/students', icon: '👥' },
          { name: 'Tasks', href: '/dashboard/tasks', icon: '📋' },
          { name: 'Staff', href: '/dashboard/staff', icon: '👨‍💼' },
          { name: 'Reports', href: '/dashboard/reports', icon: '📈' },
          { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
        ];
      default:
        return baseItems;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">SAMS</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <nav className="mt-6 px-6">
          <div className="space-y-2">
            {getNavigationItems().map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-sm text-gray-500 truncate capitalize">
                {user.role.replace('_', ' ')}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-3 text-gray-400 hover:text-gray-600"
              title="Logout"
            >
              🚪
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                ☰
              </button>
              <h2 className="ml-4 lg:ml-0 text-xl font-semibold text-gray-900">
                Student Admission & Staff Management System
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.first_name}!
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}