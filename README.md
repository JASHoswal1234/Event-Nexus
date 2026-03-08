# EventNexus 🎉

> The complete platform for event management - streamline your events with EventNexus

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://event-nexus-psi.vercel.app)
[![Backend API](https://img.shields.io/badge/API-live-blue)](https://event-nexus-pscn.onrender.com)

EventNexus is a modern, full-stack event management platform that enables seamless event creation, registration, and team collaboration. Built with React, Node.js, and MongoDB, it offers a beautiful, responsive interface for both event organizers and participants.

## ✨ Features

### For Event Organizers (Admin)
- 📊 **Dashboard Analytics** - Real-time statistics on events, registrations, and teams
- 📅 **Event Management** - Create, edit, and manage events with ease
- 👥 **User Management** - Manage participants and their registrations
- 🏆 **Team Management** - Oversee team formations and collaborations
- 📢 **Announcements** - Broadcast important updates to participants
- ⚙️ **Settings** - Customize platform preferences

### For Participants
- 🔍 **Browse Events** - Discover exciting events with beautiful card layouts
- ✅ **Quick Registration** - One-click event registration
- 👤 **Profile Management** - Manage personal information and social links
- 🤝 **Team Formation** - Find teammates and collaborate
- 📱 **Mobile Responsive** - Perfect experience on all devices

### Technical Highlights
- 🎨 **Modern UI/UX** - Clean, intuitive interface with smooth animations
- 📱 **Fully Responsive** - Mobile-first design that works on all screen sizes
- 🔐 **Secure Authentication** - JWT-based authentication with role-based access
- ⚡ **Fast Performance** - Optimized for speed and efficiency
- 🌐 **RESTful API** - Well-structured backend API
- 🎯 **Interactive Components** - Glowing effects, hover animations, and more

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons
- **Vite** - Lightning-fast build tool

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Secure authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Clone the Repository
```bash
git clone https://github.com/yourusername/event-nexus.git
cd event-nexus
```

### Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Update .env with your configuration:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# JWT_EXPIRE=7d
# PORT=5000
# NODE_ENV=development
# CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Start the server
npm start
```

### Frontend Setup
```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Update .env with your configuration:
# VITE_API_BASE_URL=http://localhost:5000/api

# Start the development server
npm run dev
```

## 🌐 Deployment

### Frontend (Vercel)
1. Push your code to GitHub
2. Import project in Vercel
3. Set root directory to `frontend`
4. Add environment variable: `VITE_API_BASE_URL=your_backend_url/api`
5. Deploy

### Backend (Render)
1. Push your code to GitHub
2. Create new Web Service in Render
3. Set root directory to `backend`
4. Add environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRE`
   - `NODE_ENV=production`
   - `CORS_ORIGIN=your_frontend_url`
5. Deploy

## 📸 Screenshots

### Landing Page
Beautiful hero section with animated shader effects and feature showcase.

### Admin Dashboard
Comprehensive dashboard with statistics, recent events, and quick actions.

### Event Browsing
Grid layout with event cards featuring images, details, and registration buttons.

### Mobile Experience
Fully responsive design with hamburger menus and touch-optimized interfaces.

## 🎯 Key Features Explained

### Authentication System
- Secure JWT-based authentication
- Role-based access control (Admin/Participant)
- Protected routes with automatic redirects
- Persistent sessions with localStorage

### Event Management
- Create events with title, description, date, location, and capacity
- Online/Offline mode selection
- Event registration tracking
- Event editing and deletion

### Responsive Design
- Mobile-first approach
- Breakpoints: Mobile (< 768px), Tablet (768px-1024px), Desktop (> 1024px)
- Touch-friendly buttons (44x44px minimum)
- Adaptive layouts and navigation

### UI Components
- Interactive hover buttons with expanding backgrounds
- Glowing card effects that follow mouse cursor
- Animated sidebar with collapse/expand on hover
- Smooth page transitions and loading states

## 🛠️ Development

### Project Structure
```
event-nexus/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Custom middlewares
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # React context
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Page components
│   │   ├── router/      # Routing configuration
│   │   ├── services/    # API services
│   │   └── main.jsx     # Entry point
│   └── index.html
└── README.md
```

### Available Scripts

#### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
```

#### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- Design inspiration from modern event management platforms
- UI components adapted from various open-source libraries
- Icons from Lucide React
- Animations powered by Framer Motion

---

Made with ❤️ 
