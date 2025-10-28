# ElecCourse Frontend

Next.js 14 frontend application for the ElecCourse learning platform with secure video streaming and advanced anti-sharing protection.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.local.example .env.local
# Edit .env.local with your backend API URL

# Start development server
npm run dev
```

The application will be available at http://localhost:3000

## 🏗️ Project Structure

```
frontend/
├── app/                          # Next.js 14 App Router
│   ├── globals.css              # Global styles and design system
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Homepage with demo and features
│   └── course/[videoId]/page.tsx # Video player page
├── components/
│   └── VideoPlayer.tsx          # Main video player component
├── package.json                 # Dependencies and scripts
├── next.config.js              # Next.js configuration
├── .env.local.example          # Environment variables template
└── README.md                   # This file
```

## 🎯 Core Features

### Secure Video Player
- **HLS.js Integration**: Automatic fallback between native HLS (Safari/iOS) and HLS.js (other browsers)
- **Token Management**: Automatic token renewal 2 minutes before expiry
- **Session Management**: Device registration, heartbeat monitoring, and session takeover
- **Fullscreen-Safe Watermarking**: Tiled, moving watermarks that remain visible even in fullscreen

### Anti-Sharing Protection
- **Device Limits**: Maximum 2 devices per user account
- **Session Takeover**: Explicit user confirmation required to end existing sessions
- **Real-time Monitoring**: Heartbeat signals every 60 seconds
- **Watermark Overlay**: Dynamic watermarks with user identification and timestamps

### Professional UI/UX
- **Udemy-Style Design**: Professional, motivating interface focused on learning
- **Mobile-First**: Fully responsive with large tap targets (≥40px)
- **Accessibility**: WCAG AA contrast compliance and keyboard navigation
- **RTL Support**: Full right-to-left layout support for Arabic content

## 🎨 UX & Design Guidelines

### Design Philosophy

**"Professional and easy to use, with motivating colors that help students focus and progress."**

Our design creates an environment that encourages learning and maintains focus throughout the educational journey.

### Design Principles

1. **Professional Excellence**
   - Clean, distraction-free interface
   - Clear information hierarchy
   - Consistent spacing and typography
   - Minimal cognitive load

2. **Ease of Use**
   - Intuitive navigation patterns
   - Large, accessible tap targets (≥40px)
   - Obvious focus states and feedback
   - Progressive disclosure of complexity

3. **Mobile-First Approach**
   - Responsive design that works on all devices
   - Touch-friendly interactions
   - Optimized for various screen sizes
   - Performance-conscious loading

4. **Accessibility & Inclusion**
   - WCAG AA contrast ratios
   - Keyboard navigation support
   - Screen reader compatibility
   - RTL language support

### Color System

Our carefully chosen color palette creates a professional, trustworthy environment that motivates learning:

```css
/* Primary Colors */
--primary-blue: #2563eb;        /* Trust, focus, professionalism */
--support-teal: #0ea5e9;        /* Progress, clarity, engagement */
--support-emerald: #10b981;     /* Success, completion, growth */
--accent-amber: #f59e0b;        /* Achievements, highlights (sparingly) */

/* Neutral Palette */
--neutral-50: #f8fafc;          /* Backgrounds */
--neutral-100: #f1f5f9;         /* Light backgrounds */
--neutral-200: #e2e8f0;         /* Borders */
--neutral-300: #cbd5e1;         /* Dividers */
--neutral-400: #94a3b8;         /* Placeholder text */
--neutral-500: #64748b;         /* Secondary text */
--neutral-600: #475569;         /* Primary text (light backgrounds) */
--neutral-700: #334155;         /* Primary text */
--neutral-800: #1e293b;         /* Headings */
--neutral-900: #0f172a;         /* High contrast text */
```

### Typography

**Primary Font**: Inter (clean, modern, highly legible)
**Arabic Support**: Cairo or Noto Kufi Arabic for RTL content
**Base Size**: 16px minimum with 1.5-1.7 line height
**Scale**: Modular scale for consistent hierarchy

```css
/* Typography Scale */
.text-xs { font-size: 0.75rem; }     /* 12px - Small labels */
.text-sm { font-size: 0.875rem; }    /* 14px - Secondary text */
.text-base { font-size: 1rem; }      /* 16px - Body text */
.text-lg { font-size: 1.125rem; }    /* 18px - Emphasized text */
.text-xl { font-size: 1.25rem; }     /* 20px - Small headings */
.text-2xl { font-size: 1.5rem; }     /* 24px - Section headings */
.text-3xl { font-size: 1.875rem; }   /* 30px - Page headings */
.text-4xl { font-size: 2.25rem; }    /* 36px - Hero headings */
```

### Layout Patterns

#### Player Page Layout
```
┌─────────────────────────────────────┐
│ Sticky Header (Course + Progress)   │
├─────────────────────┬───────────────┤
│                     │               │
│   Video Player      │   Course      │
│   (3/4 width)       │   Navigation  │
│                     │   (1/4 width) │
│                     │               │
├─────────────────────┤               │
│   Course Materials  │   Resources   │
│   & Notes           │   & Progress  │
└─────────────────────┴───────────────┘
```

#### Responsive Behavior
- **Desktop (≥1024px)**: Side-by-side layout with sticky navigation
- **Tablet (768px-1023px)**: Stacked layout with collapsible sidebar
- **Mobile (<768px)**: Full-width player with swipeable content tabs

### Motion & Animation

**Philosophy**: Gentle, purposeful motion that enhances usability without distraction.

```css
/* Standard Transitions */
transition: all 0.2s ease;          /* UI state changes */
transition: opacity 0.3s ease;      /* Fade in/out */
transition: transform 0.2s ease;    /* Hover effects */

/* Respect User Preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Component Patterns

#### Buttons
```tsx
// Primary actions
<button className="btn btn-primary">Continue Learning</button>

// Secondary actions  
<button className="btn btn-secondary">View Resources</button>

// Success states
<button className="btn btn-success">Mark Complete</button>

// Warning actions
<button className="btn btn-warning">End Session</button>
```

#### Loading States
```tsx
// Inline loading
<div className="loading" /> 

// Content loading
<div className="text-center">
  <div className="loading mb-4" />
  <p>Loading course content...</p>
</div>
```

### RTL (Right-to-Left) Support

Full RTL support for Arabic and other RTL languages:

```css
/* RTL Font Stack */
[dir="rtl"] {
  font-family: 'Cairo', 'Inter', system-ui, sans-serif;
}

/* RTL-Aware Properties */
margin-inline-start: 1rem;    /* Instead of margin-left */
padding-inline-end: 1rem;     /* Instead of padding-right */
border-inline-start: 1px;     /* Instead of border-left */
```

#### RTL Layout Considerations
- **Navigation**: Menu items flow right-to-left
- **Icons**: Directional icons (arrows, etc.) are mirrored
- **Text Alignment**: Natural right-alignment for Arabic text
- **Progress Bars**: Fill direction respects reading direction

### Accessibility Standards

#### WCAG AA Compliance
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus Indicators**: Clear, visible focus states for all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Semantic HTML with proper ARIA labels

#### Inclusive Design Features
- **Large Touch Targets**: Minimum 44px for mobile interactions
- **Clear Error Messages**: Descriptive, actionable error feedback
- **Loading Indicators**: Clear feedback for all async operations
- **Alternative Text**: Comprehensive alt text for images and icons

## 🔧 Configuration

### Environment Variables

```bash
# Required: Backend API URL
NEXT_PUBLIC_API_BASE=http://localhost:3001

# Optional: Development settings
NODE_ENV=development
```

### Next.js Configuration

Key configuration in `next.config.js`:
- **App Router**: Enabled for Next.js 14
- **TypeScript**: Strict mode enabled
- **CORS Headers**: Configured for development
- **Build Optimization**: Production-ready settings

## 🎮 VideoPlayer Component

The core `VideoPlayer` component provides:

### Props Interface
```typescript
interface VideoPlayerProps {
  videoId: string;    // Bunny Stream video ID
  userId: string;     // Unique user identifier  
  email: string;      // User email for watermarking
}
```

### Key Features

#### HLS Video Playback
- **Native HLS**: Safari and iOS devices use native HLS support
- **HLS.js**: Other browsers use HLS.js library loaded from CDN
- **Adaptive Streaming**: Automatic quality adjustment based on bandwidth

#### Session Management
- **Device Registration**: Persistent device ID stored in localStorage
- **Token Renewal**: Automatic renewal 2 minutes before expiry
- **Heartbeat Monitoring**: Regular heartbeat signals to maintain session
- **Session Takeover**: User confirmation required for device switches

#### Watermarking System
- **Canvas-Based Generation**: Dynamic watermark creation using HTML5 Canvas
- **Tiled Overlay**: Repeating watermark pattern across entire video
- **Moving Animation**: Gentle drift animation with angle variation
- **Fullscreen Safe**: Watermarks remain visible even in fullscreen mode
- **Real-time Updates**: Timestamp updates every 10 seconds

#### Player Controls
- **Custom Controls**: Beautiful, accessible video controls
- **Keyboard Support**: Space for play/pause, arrow keys for seeking
- **Touch Gestures**: Mobile-optimized touch interactions
- **Auto-hide**: Controls fade out during playback

### Usage Example

```tsx
import VideoPlayer from '@/components/VideoPlayer'

export default function CoursePage() {
  return (
    <VideoPlayer 
      videoId="your-bunny-video-id"
      userId="user123"
      email="student@example.com"
    />
  )
}
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   ```bash
   # Push to GitHub
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Configure build settings (auto-detected)

3. **Environment Variables**
   ```bash
   NEXT_PUBLIC_API_BASE=https://your-backend-url.onrender.com
   ```

4. **Domain Configuration**
   - Add your custom domain in Vercel dashboard
   - Update Bunny Stream "Allowed domains" with your domain

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 🔍 Development Tools

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production  
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Development Server Features

- **Hot Reload**: Automatic refresh on file changes
- **Error Overlay**: Detailed error information in development
- **TypeScript**: Full TypeScript support with type checking
- **ESLint**: Code quality and consistency checking

## 🐛 Troubleshooting

### Common Issues

**Video won't play**
- Check backend API is running and accessible
- Verify NEXT_PUBLIC_API_BASE is set correctly
- Ensure Bunny Stream credentials are configured
- Check browser console for HLS.js errors

**Watermark not showing**
- Verify Canvas API is supported in browser
- Check console for watermark generation errors
- Ensure session data is being received from backend

**Session takeover not working**
- Check backend session management configuration
- Verify REQUIRE_HARD_TAKEOVER setting
- Test with multiple browser tabs/devices

**Mobile issues**
- Ensure viewport meta tag is present in layout
- Check touch event handlers are working
- Verify responsive CSS is loading correctly

### Debug Mode

Enable debug logging in development:

```typescript
// In VideoPlayer.tsx, add logging
console.log('Session data:', { sessionId, deviceId, watermarkData })
console.log('HLS events:', event, data)
```

## 📱 Mobile Optimization

### Touch Interactions
- **Large Tap Targets**: All buttons ≥44px for easy tapping
- **Gesture Support**: Swipe gestures for seeking (planned)
- **Pinch to Zoom**: Disabled on video to prevent accidental zooming

### Performance
- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component with lazy loading
- **Bundle Size**: Optimized build with tree shaking

### iOS Safari Considerations
- **Native HLS**: Uses built-in HLS support for better performance
- **Fullscreen API**: Proper fullscreen handling on iOS
- **PWA Support**: Configured for "Add to Home Screen" functionality

## 🔐 Security Considerations

### Client-Side Security
- **No Sensitive Data**: No API keys or secrets in frontend code
- **Token Handling**: Secure token storage and automatic cleanup
- **XSS Protection**: Sanitized user inputs and secure HTML rendering

### Content Protection
- **Watermarking**: Persistent watermarks that can't be easily removed
- **Session Monitoring**: Real-time session validation
- **Device Tracking**: Secure device fingerprinting

## 📊 Analytics & Monitoring

### Built-in Tracking
- **Video Events**: Play, pause, seek, completion tracking
- **Session Events**: Start, end, takeover events
- **Error Tracking**: Automatic error logging and reporting

### Integration Ready
- **Google Analytics**: Easy integration with gtag
- **Custom Analytics**: Event-based tracking system
- **Performance Monitoring**: Web Vitals and performance metrics

---

**Ready to build the future of secure online learning!**

For backend setup and API documentation, see `../backend/README.md`.