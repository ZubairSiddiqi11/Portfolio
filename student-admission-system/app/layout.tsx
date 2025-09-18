import './globals.css'

export const metadata = {
  title: 'Student Admission & Staff Management System',
  description: 'Comprehensive system for managing student admissions and staff workflows',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        {children}
      </body>
    </html>
  )
}