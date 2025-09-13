# Kumu Coaching Admin Panel

A modern Next.js admin panel for managing the Kumu Coaching platform.

## Features

- **Landing Page**: Beautiful one-page website showcasing the coaching platform
- **Admin Authentication**: Secure login with role-based access control
- **User Management**: View and manage all platform users
- **Subscription Management**: Monitor subscriptions and revenue
- **Real-time Statistics**: Dashboard with key metrics and analytics
- **Responsive Design**: Works perfectly on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Running Kumu Coaching backend API

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd kumu-admin
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3001](http://localhost:3001)

## Admin Access

### Default Admin Credentials
- **Email**: `admin@kumucoaching.com`
- **Password**: `Admin123!@#`

⚠️ **Important**: Change the admin password after first login!

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin pages
│   │   ├── login/         # Admin login page
│   │   └── dashboard/     # Admin dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable components
├── lib/                   # Utility functions
└── types/                 # TypeScript type definitions
```

## API Integration

The admin panel integrates with the Kumu Coaching backend API:

### Admin Endpoints Used:
- `GET /admin/users` - Get all users
- `GET /admin/subscriptions` - Get all subscriptions  
- `GET /admin/stats` - Get subscription statistics
- `POST /auth/login` - Admin authentication

### Authentication:
- JWT token-based authentication
- Role-based access control (admin only)
- Automatic token validation and refresh

## Features Overview

### Landing Page
- Hero section with compelling messaging
- Feature highlights
- Pricing plans display
- Admin login link in header and footer

### Admin Dashboard
- **Statistics Cards**: Key metrics at a glance
- **User Management**: 
  - View all users with pagination
  - Search and filter functionality
  - User status and role management
  - Email verification status
- **Subscription Management**:
  - View all subscriptions
  - Track revenue and plan performance
  - Monitor subscription status
- **Responsive Tables**: Sortable and searchable data tables

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **TypeScript**: Full type safety

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## Security Considerations

- Admin access is restricted to users with `admin` role
- JWT tokens are stored in localStorage (consider httpOnly cookies for production)
- All API calls include proper authentication headers
- Input validation on both frontend and backend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For support or questions:
- Check the API documentation at `/api/docs`
- Review the backend logs
- Contact the development team

## License

This project is part of the Kumu Coaching platform.