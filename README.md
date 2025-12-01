# 🌱 Sprouting Academy Backend

NestJS backend API สำหรับระบบ Sprouting Academy พร้อม Supabase Authentication

## ✨ Features

- 🔐 **Authentication** - Passwordless Authentication with Supabase OTP (Email-based)
- 👥 **User Management** - User profiles with role-based access control (ADMIN, INSTRUCTOR, STUDENT)
- 📚 **Course Management** - จัดการคอร์สเรียน
- 💳 **Payment Integration** - Omise, QR Payment, Bank Transfer
- 🎫 **Enrollment System** - ระบบลงทะเบียนเรียน
- 🏷️ **Discount Codes** - ระบบโค้ดส่วนลด
- 📊 **PostgreSQL Database** - ใช้ Prisma ORM กับ Supabase
- 📖 **Swagger Documentation** - API documentation อัตโนมัติ
- 🛡️ **Security** - Rate limiting, Helmet, Input validation
- 🪵 **Logging** - Winston logger

## 🚀 Quick Start

### Prerequisites

- Node.js >= 24.0.0
- npm >= 10.0.0
- Supabase Account ([สมัครฟรี](https://supabase.com))

### Installation

1. Clone repository:

```bash
git clone <repository-url>
cd sprouting-academy-back
```

2. Install dependencies:

```bash
npm install
```

3. Setup environment variables:

```bash
cp .env.example .env
# แก้ไขค่าใน .env (ดู docs/ENVIRONMENT_VARIABLES.md)
```

4. Setup Supabase และ Database:

```bash
# ดูคำแนะนำใน docs/AUTH_SETUP.md
# Run SQL migration บน Supabase SQL Editor
```

5. Generate Prisma Client:

```bash
npm run db:generate
```

6. Start development server:

```bash
npm run start:dev
```

7. เข้าดู API Documentation:

```
http://localhost:3000/api
```

## 📚 Documentation

- [🔐 Authentication Setup](docs/AUTH_SETUP.md) - คู่มือการตั้งค่า Supabase Auth
- [🔧 Environment Variables](docs/ENVIRONMENT_VARIABLES.md) - ตัวอย่าง environment variables

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/))
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [Supabase Auth](https://supabase.com/auth)
- **Payment**: [Omise](https://www.omise.co/)
- **Documentation**: [Swagger](https://swagger.io/)
- **Logger**: [Winston](https://github.com/winstonjs/winston)
- **Validation**: [class-validator](https://github.com/typestack/class-validator)

## 📦 Available Scripts

```bash
# Development
npm run start:dev         # Start with hot-reload
npm run start             # Start

# Build
npm run build             # Build for production
npm run build:prod        # Build with webpack

# Production
npm run start:prod        # Start production server

# Code Quality
npm run lint              # Lint and fix
npm run lint:check        # Lint check only
npm run format            # Format code
npm run format:check      # Format check only
npm run typecheck         # TypeScript type check

# Testing
npm run test              # Run tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage

# Database
npm run db:generate       # Generate Prisma Client
npm run db:push           # Push schema to database
npm run db:migrate        # Run migrations
npm run db:studio         # Open Prisma Studio

# Docker
npm run docker:up         # Start Docker containers
npm run docker:down       # Stop Docker containers
npm run docker:logs       # View Docker logs
```

## 🏗️ Project Structure

```
src/
├── common/              # Common utilities (base controller, decorators, etc.)
├── constants/           # Application constants
├── domains/             # Domain modules (business logic)
│   ├── auth/           # 🔐 Authentication domain
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repositories/
│   │   ├── guards/
│   │   └── decorators/
│   ├── example/        # Example domain
│   ├── payment/        # 💳 Payment domain
│   └── system/         # 🏥 System health checks
├── enums/              # TypeScript enums
├── modules/            # Infrastructure modules
│   ├── config/        # Configuration module
│   ├── logger/        # Logger module
│   ├── supabase/      # 🔥 Supabase module
│   └── throttler/     # Rate limiting
├── shared/            # Shared services (Prisma, etc.)
├── utils/             # Utility functions
├── validation/        # Custom validators
├── app.module.ts      # Root module
└── main.ts            # Application entry point
```

## 🔐 Authentication

### Available Endpoints

| Method | Endpoint                 | Auth | Description                           |
| ------ | ------------------------ | ---- | ------------------------------------- |
| POST   | `/auth/sign-in-with-otp` | ❌   | Send OTP to email (Sign in / Sign up) |
| POST   | `/auth/verify-otp`       | ❌   | Verify OTP and login                  |
| POST   | `/auth/resend-otp`       | ❌   | Resend OTP to email                   |
| POST   | `/auth/sign-out`         | ✅   | Sign out user                         |
| GET    | `/auth/me`               | ✅   | Get current user                      |
| POST   | `/auth/refresh`          | ❌   | Refresh access token                  |

### Using Guards & Decorators

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/domains/auth/guards/auth.guard';
import { RolesGuard } from '@/domains/auth/guards/roles.guard';
import { Public } from '@/domains/auth/decorators/public.decorator';
import { Roles } from '@/domains/auth/decorators/roles.decorator';
import { CurrentUser } from '@/domains/auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('courses')
@UseGuards(AuthGuard, RolesGuard)
export class CoursesController {
  @Public() // Public route
  @Get()
  findAll() {
    return 'All courses';
  }

  @Get('my-courses') // Authenticated users only
  findMyCourses(@CurrentUser() user: AuthUserOutput) {
    return `Courses for ${user.fullName}`;
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR) // Admin & Instructor only
  createCourse() {
    return 'Create course';
  }
}
```

ดูรายละเอียดเพิ่มเติมใน [docs/AUTH_SETUP.md](docs/AUTH_SETUP.md)

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚢 Deployment

### Environment Variables

ตั้งค่า environment variables ดังต่อไปนี้:

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `JWT_SECRET`
- ดูเพิ่มเติมใน [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md)

### Build

```bash
npm run build
npm run start:prod
```

## 📝 License

UNLICENSED

## 👥 Team

Sprouting Tech Academy Team
