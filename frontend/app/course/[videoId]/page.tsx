'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import VideoPlayer from '../../components/VideoPlayer'

export default function CoursePage() {
  const params = useParams()
  const videoId = params.videoId as string

  // Mock user data - in a real app, this would come from authentication
  const userId = 'user_' + Math.random().toString(36).substr(2, 9)
  const email = 'student@example.com'

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span className="text-lg font-bold text-neutral-800">ElecCourse</span>
              </Link>
              <div className="hidden md:block">
                <nav className="flex items-center space-x-1 text-sm text-neutral-500">
                  <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                  <span className="mx-2">/</span>
                  <span className="text-neutral-700">Course Player</span>
                  <span className="mx-2">/</span>
                  <span className="text-neutral-900 font-medium">{videoId}</span>
                </nav>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 text-sm">
                <div className="flex items-center space-x-2 text-neutral-600">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Session Active</span>
                </div>
              </div>
              <button className="btn btn-secondary text-sm">
                Course Menu
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Video Player - Takes up 3/4 on large screens */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              {/* Course Header */}
              <div className="p-4 md:p-6 border-b border-neutral-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-neutral-900 mb-2">
                      Secure Video Streaming Demo
                    </h1>
                    <p className="text-neutral-600">
                      Video ID: <span className="font-mono text-sm bg-neutral-100 px-2 py-1 rounded">{videoId}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-neutral-500">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Player */}
              <div className="relative">
                <VideoPlayer 
                  videoId={videoId} 
                  userId={userId} 
                  email={email} 
                />
              </div>

              {/* Player Controls Info */}
              <div className="p-4 md:p-6 bg-neutral-50 border-t border-neutral-200">
                <h3 className="font-semibold text-neutral-900 mb-3">Player Features</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm text-neutral-600">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Fullscreen-safe watermarking</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Automatic token renewal</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Session heartbeat monitoring</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Device registration & limits</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Session takeover controls</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Real-time session management</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Takes up 1/4 on large screens */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Course Navigation */}
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <h3 className="font-semibold text-neutral-900 mb-4">Course Navigation</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-medium">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">Current Video</p>
                        <p className="text-sm text-neutral-500">Demo Lesson</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg opacity-60">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-neutral-200 text-neutral-500 rounded-lg flex items-center justify-center text-sm font-medium">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-neutral-700">Next Lesson</p>
                        <p className="text-sm text-neutral-500">Coming Soon</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg opacity-60">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-neutral-200 text-neutral-500 rounded-lg flex items-center justify-center text-sm font-medium">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-neutral-700">Advanced Topics</p>
                        <p className="text-sm text-neutral-500">Coming Soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Resources */}
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <h3 className="font-semibold text-neutral-900 mb-4">Course Resources</h3>
                <div className="space-y-3">
                  <a href="#" className="flex items-center space-x-3 p-3 hover:bg-neutral-50 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-neutral-700">Course Notes</span>
                  </a>
                  <a href="#" className="flex items-center space-x-3 p-3 hover:bg-neutral-50 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-neutral-700">Download Materials</span>
                  </a>
                  <a href="#" className="flex items-center space-x-3 p-3 hover:bg-neutral-50 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-neutral-700">FAQ & Support</span>
                  </a>
                </div>
              </div>

              {/* Progress Tracking */}
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <h3 className="font-semibold text-neutral-900 mb-4">Your Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-neutral-600 mb-2">
                      <span>Course Completion</span>
                      <span>33%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '33%' }}></div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-neutral-200">
                    <button className="w-full btn btn-success text-sm">
                      Mark as Complete
                    </button>
                    <button className="w-full btn btn-secondary text-sm mt-2">
                      Resume Later
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}