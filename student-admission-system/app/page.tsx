'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Student Admission System
          </h1>
          <p className="text-gray-600 mb-8">
            Comprehensive management system for student admissions and staff workflows
          </p>
          
          <div className="space-y-4">
            <Link 
              href="/auth/login"
              className="w-full btn-primary block text-center"
            >
              Login to System
            </Link>
            
            <div className="text-sm text-gray-500">
              <p>Demo Accounts:</p>
              <div className="mt-2 space-y-1 text-xs">
                <p><strong>Admin:</strong> admin / admin123</p>
                <p><strong>Receptionist:</strong> receptionist1 / admin123</p>
                <p><strong>Consular:</strong> consular1 / admin123</p>
                <p><strong>Officer:</strong> officer1 / admin123</p>
                <p><strong>HoD:</strong> hod1 / admin123</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">System Features</h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>✓ Role-based access control</li>
            <li>✓ Student registration and tracking</li>
            <li>✓ Document management</li>
            <li>✓ University application tracking</li>
            <li>✓ Task management system</li>
            <li>✓ AI-powered recommendations</li>
            <li>✓ Comprehensive reporting</li>
          </ul>
        </div>
      </div>
    </div>
  );
}