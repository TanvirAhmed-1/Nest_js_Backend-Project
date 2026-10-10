# 🚀 NestJS + Prisma + JWT Authentication Guide (Step-by-Step)

এই ডকুমেন্টেশনটি অনুসরণ করে আপনি খুব সহজেই শুরু থেকে একটি সম্পূর্ণ **Industry Standard NestJS Backend** প্রজেক্ট তৈরি করতে পারবেন।

---

## 📑 সূচিপত্র (Table of Contents)
1. [প্রজেক্ট সেটআপ (Project Setup)](#১-প্রজেক্ট-সেটআপ)
2. [প্রয়োজনীয় প্যাকেজ ইনস্টলেশন](#২-প্রয়োজনীয়-প্যাকেজ-ইনস্টলেশন)
3. [Prisma এবং Database কনফিগারেশন](#৩-prisma-এবং-database-কনফিগারেশন)
4. [Industry Standard ফোল্ডার স্ট্রাকচার](#৪-industry-standard-ফোল্ডার-স্ট্রাকচার)
5. [Common Utilities (Pipes, Filters, Interceptors, Guards)](#৫-common-utilities)
6. [User ও Auth মডিউল তৈরি (JWT & Passport)](#৬-user-ও-auth-মডিউল-তৈরি)
7. [API টেস্টিং গাইডলাইন](#৭-api-টেস্টিং-গাইডলাইন)

---

## ১. প্রজেক্ট সেটআপ

প্রথমে NestJS CLI ইনস্টল করুন এবং নতুন প্রজেক্ট তৈরি করুন:

```bash
# Nest CLI দিয়ে প্রজেক্ট তৈরি
npx @nestjs/cli new my-nest-project

# প্রজেক্ট ডিরেক্টরিতে যান
cd my-nest-project
```

---

## ২. প্রয়োজনীয় প্যাকেজ ইনস্টলেশন

ভ্যালিডেশন, অথেনটিকেশন, পাসওয়ার্ড হ্যাশিং এবং প্রিজমার জন্য প্যাকেজগুলো ইনস্টল করুন:

```bash
# Core Dependencies
pnpm add @prisma/client bcrypt @nestjs/jwt @nestjs/passport passport passport-jwt class-validator class-transformer

# Dev Dependencies
pnpm add -D prisma @types/bcrypt @types/passport-jwt
```

---

## ৩. Prisma এবং Database কনফিগারেশন

### ৩.১ Prisma ইনিশিয়ালাইজেশন
```bash
npx prisma init
```

### ৩.২ `.env` ফাইলে ডাটাবেস URL সেট করুন
```env
DATABASE_URL="postgres://username:password@host:5432/database?sslmode=require"
JWT_SECRET="supersecretjwtkey_change_in_production"
PORT=3000
```

### ৩.৩ `prisma/schema.prisma` ফাইলে মডেল তৈরি করুন
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Product {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  price       Float
  stock       Int      @default(0)
  imageUrl    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### ৩.৪ ডাটাবেস সিঙ্ক ও ক্লায়েন্ট তৈরি
```bash
npx prisma db push
npx prisma generate
```

---

## ৪. Industry Standard ফোল্ডার স্ট্রাকচার

একটি প্রফেশনাল NestJS প্রজেক্টের আর্কিটেকচার:

```text
src/
├── common/                             # Cross-Cutting Shared Modules
│   ├── decorators/
│   │   ├── get-current-user.decorator.ts # @GetCurrentUser()
│   │   ├── public.decorator.ts           # @Public()
│   │   └── index.ts
│   ├── filters/
│   │   ├── http-exception.filter.ts      # Global Exception Handler
│   │   └── index.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts             # Global / Route Guard
│   │   └── index.ts
│   └── interceptors/
│       ├── transform.interceptor.ts      # Unified Response {success, data}
│       └── index.ts
│
├── prisma/                             # Global Database Service
│   ├── prisma.service.ts
│   └── prisma.module.ts
│
├── auth/                               # Auth Feature Module
│   ├── dto/
│   │   └── login.dto.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── jwt.strategy.ts
│
├── user/                               # User Management Module
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   ├── user.controller.ts
│   ├── user.service.ts
│   └── user.module.ts
│
├── product/                            # Product Module (CRUD Example)
│   ├── dto/
│   ├── product.controller.ts
│   ├── product.service.ts
│   └── product.module.ts
│
├── app.module.ts
└── main.ts                             # Global Setup
```

---

## ৫. Common Utilities

### ৫.১ Global `main.ts` সেটআপ
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/index.js';
import { TransformInterceptor } from './common/interceptors/index.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Prefix (/api)
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors();

  // DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Standard Success and Error Formats
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}/api`);
}
await bootstrap();
```

---

## ৬. User ও Auth মডিউল তৈরি

### ৬.১ DTO ভ্যালিডেশন উদাহরণ (`create-user.dto.ts`)
```typescript
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsNotEmpty()
  password: string;
}
```

### ৬.২ Auth Service (`auth.service.ts`)
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service.js';
import { LoginDto } from './dto/login.dto.js';
import { CreateUserDto } from '../user/dto/create-user.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user, accessToken: token };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid email or password');

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return {
      user: { id: user.id, email: user.email, name: user.name },
      accessToken: token,
    };
  }
}
```

---

## ৭. API টেস্টিং গাইডলাইন

### ১. Register (Public)
- **POST** `http://localhost:3000/api/auth/register`
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Tanvir Hasan"
}
```

### ২. Login (Public)
- **POST** `http://localhost:3000/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### ৩. Protected Routes (Bearer Token Required)
- **Headers:** `Authorization: Bearer <your_jwt_access_token>`
- **GET** `http://localhost:3000/api/auth/profile`
- **GET** `http://localhost:3000/api/users/me`
- **GET** `http://localhost:3000/api/products`

---

## ⚡ প্রয়োজনীয় কমান্ডসমূহ

| কমান্ড | বিবরণ |
| :--- | :--- |
| `pnpm run start:dev` | সার্ভার ডেভেলপমেন্ট মোডে চালানো |
| `pnpm run build` | প্রোডাকশন বিল্ড তৈরি করা |
| `npx prisma db push` | স্কিমা ডাটাবেসে সিঙ্ক করা |
| `npx prisma studio` | ব্রাউজারে ডাটাবেস দেখার GUI ওপেন করা |
| `npx nest g resource <name>` | নতুন CRUD মডিউল তৈরি করা |
