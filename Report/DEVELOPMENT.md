# Development Guide

For developers looking to extend or modify the application.

## Project Structure Review

```
app/
├── api/
│   ├── upload/route.ts          # POST /api/upload
│   └── export/route.ts          # POST /api/export
├── upload/
│   └── page.tsx                 # Upload page component
├── form/
│   └── page.tsx                 # Form page component
├── page.tsx                     # Home page
├── layout.tsx                   # Root layout (app wrapper)
└── globals.css                  # Global styles

lib/                             # Add utilities here
public/temp/                     # Temporary file storage

Configuration files:
├── tsconfig.json               # TypeScript config
├── next.config.js              # Next.js config
├── package.json                # Dependencies
```

## Setting Up Development Environment

### Prerequisites
- Node.js 18+
- npm or yarn
- Code editor (VS Code recommended)
- Git for version control

### Installation
```bash
cd e:\Valuation\Report
npm install
npm run dev
```

### Recommended VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Thunder Client (or Postman) for API testing
- Word Document Generator (for testing .docx)

---

## Code Style & Conventions

### TypeScript
- Use explicit types for functions and variables
- Avoid `any` type
- Define interfaces for complex objects

```typescript
// ✓ Good
interface FormField {
  name: string;
  type: 'text' | 'textarea';
}

// ✗ Avoid
interface FormField {
  name: any;
  type: any;
}
```

### React Components
- Use functional components with hooks
- Keep components focused and single-responsibility
- Extract logic into custom hooks when appropriate

```typescript
// ✓ Good
export default function UploadPage() {
  const [loading, setLoading] = useState(false);
  
  const handleUpload = async (file: File) => {
    // upload logic
  };
  
  return (...)
}

// ✗ Avoid class components (unless necessary)
```

### File Naming
- Pages: `page.tsx`
- API routes: `route.ts`
- Components: `ComponentName.tsx` (PascalCase)
- Utilities: `utilityName.ts` (camelCase)

### Formatting
```bash
# Format code with Prettier
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

---

## Adding New Features

### Example: Add Database Integration

1. **Install packages**:
```bash
npm install prisma @prisma/client
npm install -D prisma
```

2. **Initialize Prisma**:
```bash
npx prisma init
```

3. **Update `.env.local`**:
```
DATABASE_URL="postgresql://user:password@localhost:5432/valuation_db"
```

4. **Create schema** (`prisma/schema.prisma`):
```prisma
model Template {
  id        String    @id @default(cuid())
  name      String
  fields    Field[]
  createdAt DateTime  @default(now())
}

model Field {
  id         String   @id @default(cuid())
  name       String
  type       String
  template   Template @relation(fields: [templateId], references: [id])
  templateId String
}
```

5. **Use in API**:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  // Save to database
  const template = await prisma.template.create({
    data: {
      name: 'My Template',
      fields: { /* ... */ }
    }
  });
}
```

---

### Example: Add User Authentication

1. **Install auth library**:
```bash
npm install next-auth
```

2. **Create `app/api/auth/[...nextauth]/route.ts`**:
```typescript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Authenticate user
        if (credentials?.email === 'user@example.com') {
          return { id: '1', email: credentials.email };
        }
        return null;
      }
    })
  ]
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

3. **Protect routes** (`app/form/page.tsx`):
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function FormPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  // Component code...
}
```

---

### Example: Add Email Notifications

1. **Install email library**:
```bash
npm install nodemailer
npm install -D @types/nodemailer
```

2. **Create utility** (`lib/email.ts`):
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

export async function sendReportEmail(to: string, report: Buffer) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Your Valuation Report is Ready',
    html: '<p>Your report is attached.</p>',
    attachments: [
      {
        filename: `valuation_report_${Date.now()}.docx`,
        content: report
      }
    ]
  });
}
```

3. **Use in export API** (`app/api/export/route.ts`):
```typescript
import { sendReportEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  // ... existing code ...
  
  await sendReportEmail(userEmail, resultBuffer);
  
  return response;
}
```

---

## Testing

### Unit Testing with Jest

1. **Install Jest**:
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D jest-environment-jsdom
```

2. **Create `jest.config.js`**:
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
```

3. **Create `jest.setup.js`**:
```javascript
import '@testing-library/jest-dom'
```

4. **Example test** (`__tests__/api.test.ts`):
```typescript
describe('Field Extraction', () => {
  it('should extract fields from text', () => {
    const text = 'Hello {name} from {company}';
    const regex = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
    const matches = Array.from(text.matchAll(regex)).map(m => m[1]);
    
    expect(matches).toEqual(['name', 'company']);
  });
});
```

5. **Run tests**:
```bash
npm run test
```

---

## API Testing

### Using Thunder Client (VS Code Extension)

1. **Install Thunder Client** extension
2. **Create requests**:

```
POST http://localhost:3000/api/upload
Content-Type: multipart/form-data

Body:
  file: [select Word document]
```

```
POST http://localhost:3000/api/export
Content-Type: application/json

{
  "templateId": "1715524400000",
  "data": {
    "property_address": "123 Main St",
    "valuation_amount": "$250,000"
  }
}
```

---

## Performance Optimization

### 1. Image Optimization

```typescript
import Image from 'next/image';

// Use Next.js Image component
<Image
  src="/image.png"
  alt="Description"
  width={600}
  height={400}
  priority
/>
```

### 2. Code Splitting

```typescript
import dynamic from 'next/dynamic';

const FormComponent = dynamic(() => import('@/components/Form'), {
  loading: () => <p>Loading...</p>,
  ssr: false
});
```

### 3. Caching

```typescript
// Cache API responses
export const revalidate = 3600; // Revalidate every hour

export async function GET(request: NextRequest) {
  // API code
}
```

---

## Deployment Options

### 1. Vercel (Recommended for Next.js)

```bash
npm install -g vercel

# Login and deploy
vercel
```

### 2. Docker

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

```bash
docker build -t valuation-app .
docker run -p 3000:3000 valuation-app
```

### 3. Traditional Server (Linux/Ubuntu)

```bash
# Install Node
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
nvm install 18

# Clone and setup
git clone <repo>
cd valuation-report
npm install
npm run build

# Use PM2 for process management
npm install -g pm2
pm2 start "npm start" --name "valuation-app"
pm2 save
```

---

## Debugging

### Browser DevTools

1. **Open DevTools**: F12
2. **Console tab**: View JavaScript errors
3. **Network tab**: Check API requests/responses
4. **Application tab**: View localStorage/sessionStorage

### VS Code Debugging

1. **Create `.vscode/launch.json`**:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

2. **Set breakpoints** by clicking line numbers
3. **Start debugging**: F5

### Logging

```typescript
// Structured logging
export function log(level: 'info' | 'error' | 'warn', message: string, data?: any) {
  console.log(`[${new Date().toISOString()}] ${level.toUpperCase()}: ${message}`, data);
}

// Usage
log('info', 'Upload started', { fileName: file.name });
log('error', 'Upload failed', { error: err.message });
```

---

## Common Tasks

### Add a New API Endpoint

1. Create file: `app/api/[feature]/route.ts`
2. Define handler: `GET`, `POST`, `PUT`, `DELETE`
3. Return `NextResponse`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Process request
  
  return NextResponse.json({ success: true });
}
```

### Add a New Page

1. Create directory: `app/[page-name]/`
2. Create file: `app/[page-name]/page.tsx`
3. Export default component

```typescript
export default function NewPage() {
  return <h1>New Page</h1>;
}
```

### Add Styles

1. Global styles: `app/globals.css`
2. Component styles: Create `ComponentName.module.css`

```typescript
// Use CSS modules
import styles from './Upload.module.css';

export default function Upload() {
  return <div className={styles.container}>...</div>;
}
```

---

## Git Workflow

### Initial Setup
```bash
git init
git add .
git commit -m "Initial commit: Valuation report automation app"
git branch -M main
git remote add origin <repository-url>
git push -u origin main
```

### Regular Development
```bash
# Create feature branch
git checkout -b feature/add-database

# Make changes
git add .
git commit -m "Add database integration"

# Push to remote
git push origin feature/add-database

# Create pull request and merge
```

---

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **TypeScript Docs**: https://www.typescriptlang.org/docs/
- **Node.js Docs**: https://nodejs.org/docs/
- **Mammoth.js**: https://github.com/mwilkinson/mammoth.js
- **docx Library**: https://github.com/dolanmiu/docx

---

## Maintenance

### Update Dependencies
```bash
npm outdated          # Check for updates
npm update           # Update all packages
npm audit            # Check for vulnerabilities
npm audit fix        # Fix vulnerabilities
```

### Clean Up
```bash
npm prune            # Remove unused packages
npm cache clean      # Clear npm cache
rm -rf .next         # Clear build cache
rm -rf node_modules  # Full reinstall needed after this
```

---

Happy coding! 🚀
