# CounselFlow Ukraine - Legal Management System

A comprehensive legal management platform built for Ukrainian legal professionals, featuring case management, risk assessment, contract management, and compliance tracking.

## 🏗️ Architecture

This is a **monorepo** containing multiple applications and shared packages:

```
├── apps/
│   ├── backend/          # NestJS API server
│   └── frontend/         # React web application
├── packages/
│   ├── types/           # Shared TypeScript types
│   ├── ui/              # Shared UI components
│   └── config/          # Shared configuration
├── tools/
│   └── scripts/         # Build and utility scripts
└── docs/                # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Endawoke47/CounselFlow-Ukraine.git
   cd CounselFlow-Ukraine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.template .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Run PostgreSQL with Docker
   docker run -d \
    --name counselflow-postgres \
    -e POSTGRES_USER=root \
    -e POSTGRES_PASSWORD=root \
    -e POSTGRES_DB=counselflow_ukraine \
    -v $PWD/postgresData:/var/lib/postgresql/data \
    -p 5432:5432 \
    postgres:17.2
   
   # Run migrations
   npm run migration:run
   ```

5. **Start development servers**
   ```bash
   # Start backend (NestJS API)
   npm run start:dev
   
   # Start frontend (React app) - in another terminal
   npm run frontend:dev
   ```

## 📦 Applications

### Backend API (`apps/backend/`)

**Technology Stack:**
- NestJS framework
- TypeORM for database management
- PostgreSQL database
- JWT authentication
- Auth0 integration

**Key Features:**
- User management and authentication
- Matter and case management
- Risk assessment and tracking
- Contract lifecycle management
- Dispute resolution workflow
- Company and entity management
- Document upload and management

### Frontend Web App (`apps/frontend/`)

**Technology Stack:**
- React 18 with TypeScript
- TanStack Router for routing
- Vite for build tooling
- Tailwind CSS for styling
- Tanstack Query for data fetching

**Key Features:**
- Dashboard with KPIs and analytics
- Matter management interface
- Risk assessment tools with heatmap visualization
- Contract management dashboard
- Dispute tracking and resolution
- Company secretarial functions
- User and access management

## 🔧 Development Commands

```bash
# Database
npm run migration:create --name=migration_name  # Create new migration
npm run migration:run                           # Run pending migrations

# Development
npm run start:dev                              # Start backend in development mode

# Build & Production
npm run build                                  # Build all packages
npm run start:prod                            # Start production server
```

## 🔒 Security Features

- **Authentication**: JWT-based authentication with Auth0 integration
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: GDPR-compliant data handling
- **Secure File Upload**: File type validation
- **Input Validation**: Comprehensive request validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**CounselFlow Ukraine** - Empowering Ukrainian legal professionals with modern technology.
