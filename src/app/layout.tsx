import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kumu Coaching - Admin Panel',
  description: 'Admin panel for Kumu Coaching platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}