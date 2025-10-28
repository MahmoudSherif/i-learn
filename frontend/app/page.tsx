'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  const [videoId, setVideoId] = useState('YOUR_VIDEO_ID_HERE')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <h1 className="text-2xl font-bold text-neutral-800">ElecCourse</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#features" className="text-neutral-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#security" className="text-neutral-600 hover:text-blue-600 transition-colors">Security</a>
              <a href="#demo" className="text-neutral-600 hover:text-blue-600 transition-colors">Demo</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
            Professional Learning
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
              Made Secure
            </span>
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Experience premium educational content with enterprise-grade security. 
            Our advanced anti-sharing technology ensures content protection while 
            maintaining an exceptional learning experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#demo" className="btn btn-primary text-lg px-8 py-4">
              Try Demo Player
            </a>
            <a href="#features" className="btn btn-secondary text-lg px-8 py-4">
              Learn More
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <section id="features" className="mb-16">
          <h2 className="text-3xl font-bold text-center text-neutral-900 mb-12">
            Built for Modern Learning
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Secure Video Streaming</h3>
              <p className="text-neutral-600">
                Bunny CDN integration with path-based token authentication and real-time watermarking
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Anti-Sharing Protection</h3>
              <p className="text-neutral-600">
                Device limits, session management, and heartbeat monitoring prevent unauthorized sharing
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Mobile-First Design</h3>
              <p className="text-neutral-600">
                Fully responsive with RTL support, large tap targets, and accessibility compliance
              </p>
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section id="security" className="mb-16 bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-neutral-200">
          <h2 className="text-3xl font-bold text-center text-neutral-900 mb-8">
            Enterprise-Grade Security
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Content Protection</h3>
              <ul className="space-y-3 text-neutral-600">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Fullscreen-safe watermarking with user identification
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Time-limited tokens with automatic renewal
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Geographic restrictions and bandwidth limiting
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Access Control</h3>
              <ul className="space-y-3 text-neutral-600">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Device registration with maximum limits
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Session takeover with explicit confirmation
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Cooldown periods and daily usage limits
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">
            Try the Demo Player
          </h2>
          <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            Experience our secure video player with real-time watermarking and session management.
            Enter your Bunny Stream video ID below to get started.
          </p>
          
          <div className="max-w-md mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
                placeholder="Enter Video ID"
                className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Link
                href={`/course/${videoId}`}
                className="btn btn-primary px-6 py-3 whitespace-nowrap"
              >
                Launch Player
              </Link>
            </div>
            <p className="text-sm text-neutral-500 mt-2">
              Replace with your actual Bunny Stream video ID
            </p>
          </div>

          <div className="bg-neutral-100 rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">Demo Features</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-neutral-600">
              <div className="text-left">
                <p>✓ Fullscreen-safe watermarking</p>
                <p>✓ Automatic token renewal</p>
                <p>✓ Session heartbeat monitoring</p>
              </div>
              <div className="text-left">
                <p>✓ Device registration & limits</p>
                <p>✓ Session takeover controls</p>
                <p>✓ Real-time session management</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <h3 className="text-xl font-bold">ElecCourse</h3>
            </div>
            <p className="text-neutral-400 mb-6 max-w-md mx-auto">
              Professional learning platform with enterprise-grade security
            </p>
            <div className="flex justify-center space-x-6 text-sm text-neutral-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
            <div className="mt-6 pt-6 border-t border-neutral-800 text-sm text-neutral-500">
              <p>&copy; 2024 ElecCourse. Built for educators who demand security.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}