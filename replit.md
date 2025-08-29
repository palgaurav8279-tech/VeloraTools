# Velora - AI Tools Discovery Platform

## Overview

Velora is a modern, full-stack web application that serves as a comprehensive hub for discovering, comparing, and managing AI tools. The platform features a futuristic design aesthetic and provides users with the ability to explore various AI tools across different categories, submit new tools for community review, and maintain personal toolkits of favorite AI solutions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using React with TypeScript, featuring a modern component-based architecture. The UI leverages shadcn/ui components with Radix UI primitives for consistent, accessible design patterns. The application uses Wouter for client-side routing and TanStack Query for state management and API interactions. Styling is handled through Tailwind CSS with a custom dark theme configuration and CSS variables for theming consistency.

### Backend Architecture
The server is built with Express.js and TypeScript, following a modular route-based structure. The application uses a file-based storage system with JSON files instead of a traditional database, storing data in separate files for users, tools, submissions, and newsletter subscriptions. Authentication is implemented using JWT tokens with support for both email/password and Google OAuth strategies via Passport.js. The backend includes email functionality through Nodemailer for OTP verification and admin notifications.

### Authentication System
The application implements a multi-layered authentication approach:
- Traditional email/password authentication with bcrypt for password hashing
- OTP-based login system for passwordless authentication
- Google OAuth integration for social login
- JWT-based session management with client-side token storage
- Role-based access control with admin privileges for content moderation

### Data Storage Strategy
Rather than using a traditional database, the application employs a file-based storage system:
- JSON files serve as data stores for different entity types
- File operations handle CRUD functionality through a custom storage interface
- Data persistence is managed through the filesystem with structured JSON schemas
- This approach simplifies deployment and reduces infrastructure dependencies

### Content Management System
The platform includes a comprehensive content management workflow:
- Community-driven tool submissions with structured validation
- Admin approval system for quality control
- Tool categorization and tagging for improved discoverability
- Rating and usage tracking for popularity metrics
- Newsletter subscription management for user engagement

### UI/UX Design Philosophy
The frontend emphasizes a futuristic, modern aesthetic:
- Dark theme as the primary color scheme with purple/blue accents
- Responsive design patterns for mobile and desktop compatibility
- Motion and animations through Framer Motion for enhanced user experience
- Component reusability through shadcn/ui design system
- Accessible design patterns following WCAG guidelines

## External Dependencies

### Core Framework Dependencies
- **React & TypeScript**: Primary frontend framework with type safety
- **Express.js**: Backend web framework for API development
- **Vite**: Build tool and development server for frontend assets

### UI Component Libraries
- **Radix UI**: Primitive components for accessible UI patterns
- **shadcn/ui**: Pre-built component library built on Radix primitives
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Framer Motion**: Animation library for interactive UI elements

### Authentication & Security
- **Passport.js**: Authentication middleware with Google OAuth strategy
- **bcrypt**: Password hashing for secure credential storage
- **jsonwebtoken**: JWT token generation and verification
- **Nodemailer**: Email service integration for notifications and OTP delivery

### State Management & Data Fetching
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation for type-safe data handling

### Development & Build Tools
- **TypeScript**: Type checking and development tooling
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer for browser compatibility

### External Services Integration
- **Google OAuth**: Social authentication provider
- **Email Service**: SMTP integration through Nodemailer for transactional emails
- **Replit Platform**: Development environment with specific Replit integrations