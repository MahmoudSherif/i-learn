import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ElecCourse - Professional Learning Platform',
  description: 'Secure, professional online learning platform with advanced video streaming protection',
  keywords: ['online learning', 'education', 'video courses', 'professional development'],
  authors: [{ name: 'ElecCourse Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'ElecCourse - Professional Learning Platform',
    description: 'Secure, professional online learning platform with advanced video streaming protection',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ElecCourse - Professional Learning Platform',
    description: 'Secure, professional online learning platform with advanced video streaming protection',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  )
}