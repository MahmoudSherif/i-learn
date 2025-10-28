# ElecCourse - Udemy-Style Learning Platform

A professional, secure learning platform with advanced video streaming protection via Bunny Stream CDN.

## 🎯 Overview

ElecCourse is a modern online learning platform designed to deliver premium educational content with enterprise-grade security. Built with a focus on preventing content piracy through advanced anti-sharing mechanisms while maintaining an excellent user experience.

### Key Features

- **Secure Video Streaming**: Bunny Stream integration with path-based token authentication
- **Anti-Sharing Protection**: Device limits, session management, IP binding, and heartbeat monitoring
- **Professional UI**: Udemy-inspired design with motivating colors and intuitive navigation
- **Fullscreen Watermarking**: Tiled, moving watermarks that remain visible even in fullscreen mode
- **Real-time Session Management**: Automatic token renewal and session takeover controls
- **Mobile-First Design**: Fully responsive with RTL support for Arabic content

## 🏗️ Architecture

```
ElecCourse/
├── backend/          # Node.js + Express API
│   ├── server.js     # Main server with Bunny Stream integration
│   ├── package.json  # Dependencies and scripts
│   ├── .env.example  # Environment configuration template
│   └── README.md     # Backend setup and API documentation
├── frontend/         # Next.js 14 App Router application
│   ├── app/          # App Router pages
│   ├── components/   # React components including VideoPlayer
│   ├── package.json  # Frontend dependencies
│   ├── next.config.js
│   ├── .env.local.example
│   └── README.md     # Frontend setup and deployment guide
└── README.md         # This file
```

## 🔒 Security Model

### Anti-Sharing Mechanisms

1. **Device Registration**: Maximum 2 devices per user account
2. **Concurrent Sessions**: Only 1 active session per user at a time
3. **Controlled Takeover**: Explicit user confirmation required to end existing sessions
4. **Session Cooldown**: 5-minute cooldown between device/IP switches
5. **Daily Limits**: Maximum 20 session starts per user per day
6. **Heartbeat Monitoring**: Sessions expire without regular heartbeat signals
7. **IP Binding**: Optional IP address binding for enhanced security
8. **Watermarking**: Persistent, moving watermarks with user identification

### Token Security

- **Path-based Authentication**: Bunny Stream CDN tokens authorize entire video directories
- **Time-limited Access**: 15-minute default token TTL with automatic renewal
- **Geographic Restrictions**: Optional country-based access control
- **Bandwidth Limiting**: Configurable speed limits per session

## 🎨 UX & Design Guidelines

### Design Principles

**Professional and Motivating**: Our design creates an environment that helps students focus and progress through their learning journey.

- **Professional**: Clean, distraction-free interface with clear information hierarchy
- **Easy to Use**: Intuitive navigation with large tap targets (≥40px) and obvious focus states
- **Mobile-First**: Fully responsive design that works beautifully on all devices
- **Accessible**: WCAG AA contrast compliance with full RTL support for Arabic

### Color Palette

- **Primary Blue**: `#2563EB` - Trust, professionalism, focus
- **Support Teal**: `#0EA5E9` - Progress, clarity, engagement
- **Support Emerald**: `#10B981` - Success, completion, growth
- **Accent Amber**: `#F59E0B` - Highlights, achievements (used sparingly)
- **Neutrals**: Slate/Stone grays for text and backgrounds

### Typography

- **Primary**: Inter or system sans-serif fonts
- **Arabic Support**: Cairo or Noto Kufi Arabic for RTL content
- **Base Size**: ≥16px with 1.5–1.7 line height for optimal readability
- **Hierarchy**: Clear typographic scale for headings, body text, and UI elements

### Layout Philosophy

**Player-Centric Experience**:
- Sticky header with course progress and navigation
- Prominent video player with fullscreen-safe watermarking
- Side/bottom panels for course materials, notes, and navigation
- Clear "Resume" and "Mark Complete" actions

**Responsive Behavior**:
- Desktop: Side-by-side player and content panels
- Tablet: Stacked layout with collapsible sidebar
- Mobile: Full-width player with swipeable content tabs

### Motion & Interaction

- **Gentle Animations**: Respect `prefers-reduced-motion` settings
- **Smooth Transitions**: 200-300ms easing for state changes
- **Loading States**: Clear feedback for all async operations
- **Error Handling**: Friendly, actionable error messages

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Bunny Stream account with CDN Token Authentication enabled
- (Optional) Render account for backend deployment
- (Optional) Vercel account for frontend deployment

### Local Development

1. **Clone and setup backend**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your Bunny Stream credentials
   npm install
   npm start
   ```

2. **Setup frontend** (in a new terminal):
   ```bash
   cd frontend
   cp .env.local.example .env.local
   # Edit .env.local with your backend URL
   npm install
   npm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Bunny Stream Setup

1. Go to Stream → Your Library → Settings → Security
2. Enable **CDN token authentication (Advanced)**
3. Copy the token key to your backend `.env`
4. Enable **Block direct URL file access**
5. Add allowed domains: `localhost` (dev) and your production domain

## 📖 Learning Experience

### For Students

- **Seamless Playback**: Automatic token renewal ensures uninterrupted learning
- **Progress Tracking**: Visual progress indicators and resume functionality
- **Multi-Device Support**: Learn on any device with automatic session management
- **Offline-Ready**: Download materials and sync progress when reconnected

### For Instructors

- **Content Protection**: Advanced anti-sharing prevents unauthorized distribution
- **Analytics**: Detailed viewing statistics and engagement metrics
- **Quality Control**: Adaptive bitrate streaming ensures optimal viewing experience
- **Global Reach**: CDN delivery with optional geographic restrictions

## 🔧 Production Deployment

### Backend (Render)

1. Connect your GitHub repository to Render
2. Choose Frankfurt region for optimal performance
3. Set environment variables in Render dashboard
4. Deploy with automatic builds on push

### Frontend (Vercel)

1. Import project from GitHub to Vercel
2. Set `NEXT_PUBLIC_API_BASE` to your backend URL
3. Add production domain to Bunny Stream allowed domains
4. Deploy with automatic preview deployments

## 📊 Monitoring & Analytics

- **Session Analytics**: Track user engagement and completion rates
- **Security Monitoring**: Alert on suspicious sharing patterns
- **Performance Metrics**: CDN delivery performance and error rates
- **User Feedback**: Integrated feedback collection and support system

## 🤝 Contributing

This is a production-ready template. Customize it for your specific needs:

- Add user authentication and course management
- Integrate payment processing for paid courses
- Implement advanced analytics and reporting
- Add social features like discussions and peer interaction

## 📄 License

Private/Commercial - Customize licensing terms for your specific use case.

---

**Built for educators who demand security and students who deserve excellence.**