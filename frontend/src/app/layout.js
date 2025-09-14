import './globals.css'

export const metadata = {
  title: 'EasyCart - Modern E-commerce',
  description: 'A modern e-commerce platform built with Next.js and Go',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}