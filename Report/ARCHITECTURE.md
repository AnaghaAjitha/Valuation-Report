# Architecture & Technical Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Valuation Report Automation               │
└─────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                     │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │   Home Page      │  │ Upload Page  │  │   Form Page    │  │
│  │ (page.tsx)       │  │(upload/...)  │  │  (form/...)    │  │
│  └──────────────────┘  └──────────────┘  └────────────────┘  │
│           │                  │                    │            │
│           └──────────────────┴────────────────────┘            │
│                              │                                │
│                    ┌─────────▼──────────┐                    │
│                    │  React Components  │                    │
│                    │  State Management  │                    │
│                    │  Client-side Logic │                    │
│                    └─────────┬──────────┘                    │
│                              │                                │
└──────────────────────────────┼────────────────────────────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
        ┌────────▼─────────┐      ┌──────────▼────────┐
        │  /api/upload     │      │  /api/export      │
        │                  │      │                   │
        │ • File parsing   │      │ • Template merge  │
        │ • Field extract  │      │ • Document gen    │
        │ • Store template │      │ • File download   │
        └────────┬─────────┘      └──────────┬────────┘
                 │                           │
        ┌────────▼───────────────────────────▼────────┐
        │           Backend (Node.js)                 │
        ├──────────────────────────────────────────────┤
        │                                              │
        │  Libraries:                                  │
        │  • mammoth - Extract text from .docx        │
        │  • docx - Generate .docx files              │
        │  • fs - File system operations              │
        │                                              │
        └────────┬──────────────────────────────────┬─┘
                 │                                  │
        ┌────────▼──────────┐            ┌─────────▼──────┐
        │  Temp Storage     │            │  Session Data  │
        │                   │            │                │
        │ public/temp/      │            │ SessionStorage │
        │ ├── {id}.docx     │            │ ├── template   │
        │ └── {id}.json     │            │ └── fields     │
        │                   │            │                │
        └───────────────────┘            └────────────────┘

```

## Data Flow

### Upload Flow
```
User selects file
    │
    ▼
Validation (type, size)
    │
    ▼
POST /api/upload
    │
    ├─→ Read file as ArrayBuffer
    │
    ├─→ mammoth.extractRawText()
    │
    ├─→ Extract placeholders with regex: {field_name}
    │
    ├─→ Store .docx file: public/temp/{id}.docx
    │
    ├─→ Store metadata: public/temp/{id}.json
    │
    └─→ Return: templateId, fields, fieldCount
    
Return response to client
    │
    ▼
Store in sessionStorage
    │
    ▼
Redirect to /form?templateId={id}
```

### Form Fill & Export Flow
```
User fills form
    │
    ▼
Click "Generate Report"
    │
    ├─→ Validate all fields filled
    │
    └─→ POST /api/export
        │
        ├─→ Read template: public/temp/{id}.docx
        │
        ├─→ Extract with mammoth
        │
        ├─→ Replace placeholders with data
        │   Example: {property_address} → "123 Main St"
        │
        ├─→ Create new document with docx library
        │
        ├─→ Generate .docx buffer
        │
        └─→ Return as downloadable file
            │
            ▼
        Browser downloads .docx
```

## File Organization

```
e:\Valuation\Report\
│
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── upload/
│   │   │   └── route.ts         # Upload endpoint
│   │   └── export/
│   │       └── route.ts         # Export endpoint
│   ├── upload/
│   │   └── page.tsx             # Upload page component
│   ├── form/
│   │   └── page.tsx             # Form page component
│   ├── globals.css              # Global stylesheet
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
│
├── lib/                         # Utilities (future expansion)
│
├── public/
│   └── temp/                    # Temporary file storage
│       ├── {timestamp1}.docx
│       ├── {timestamp1}.json
│       ├── {timestamp2}.docx
│       └── {timestamp2}.json
│
├── .gitignore
├── .env.example
├── next.config.js               # Next.js config
├── tsconfig.json                # TypeScript config
├── package.json                 # Dependencies
├── README.md                    # Full documentation
├── QUICKSTART.md                # Quick guide
├── SAMPLE_TEMPLATE.txt          # Sample template
└── ARCHITECTURE.md              # This file
```

## Technology Stack

### Frontend
- **Next.js 14** - React framework with SSR
- **React 18** - UI library
- **TypeScript** - Type safety
- **CSS3** - Styling
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Next.js API Routes** - Serverless functions
- **Mammoth.js** - Extract text from Word documents
- **docx library** - Generate Word documents

### Libraries

#### mammoth
```javascript
import mammoth from 'mammoth';

const result = await mammoth.extractRawText({ arrayBuffer });
const text = result.value;  // Extract text content
```

#### docx
```javascript
import { Document, Packer, Paragraph, TextRun } from 'docx';

const doc = new Document({
  sections: [{
    children: [
      new Paragraph({
        children: [new TextRun("Hello World")]
      })
    ]
  }]
});

const buffer = await Packer.toBuffer(doc);
```

## API Specifications

### POST /api/upload

**Purpose**: Extract fields from Word document

**Request**:
```
Headers:
  Content-Type: multipart/form-data

Body:
  file: File (Word document)
```

**Response (200 OK)**:
```json
{
  "templateId": "1715524400000",
  "fieldCount": 8,
  "fileName": "bank_template.docx",
  "fields": [
    { "name": "property_address", "type": "text" },
    { "name": "property_type", "type": "text" },
    { "name": "property_description", "type": "textarea" },
    ...
  ]
}
```

**Error Responses**:
- 400: No file provided
- 400: Invalid file type
- 400: No fields found in document
- 413: File too large (>10MB)
- 500: Processing error

### POST /api/export

**Purpose**: Generate filled Word document

**Request**:
```json
{
  "templateId": "1715524400000",
  "data": {
    "property_address": "123 Main Street",
    "property_type": "Residential",
    "property_description": "Beautiful 3-bedroom house...",
    "surveyor_name": "John Smith",
    ...
  }
}
```

**Response (200 OK)**:
```
Binary: Word document (.docx)
Headers:
  Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
  Content-Disposition: attachment; filename="valuation_report_1715524400000.docx"
```

**Error Responses**:
- 400: Missing templateId or data
- 404: Template not found
- 500: Generation error

## Field Extraction Algorithm

```javascript
const FIELD_REGEX = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;

1. Extract text from .docx using mammoth
2. Use regex to find all {field_name} patterns
3. Create Set to remove duplicates
4. Convert to array for response

Regex breakdown:
  \{ - Literal opening brace
  ( - Start capture group
    [a-zA-Z_] - First char: letter or underscore
    [a-zA-Z0-9_]* - Following chars: letters, numbers, underscores
  ) - End capture group
  \} - Literal closing brace

Valid fields:
  {property_address}  ✓
  {_internal_field}   ✓
  {field123}          ✓

Invalid fields:
  {123field}          ✗ (starts with number)
  {property-address}  ✗ (hyphen not allowed)
  {property address}  ✗ (space not allowed)
  { field_name }      ✗ (spaces around braces)
```

## Placeholder Replacement

```javascript
function replacePlaceholders(htmlContent, data) {
  let result = htmlContent;
  
  for (const [key, value] of Object.entries(data)) {
    // Create regex for each field: /\{field_name\}/g
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    
    // Replace all occurrences with the value
    result = result.replace(regex, value || '');
  }
  
  return result;
}

Example:
  Input HTML: "Property at {property_address} valued at {market_value}"
  
  data = {
    property_address: "123 Main St",
    market_value: "$250,000"
  }
  
  Output: "Property at 123 Main St valued at $250,000"
```

## State Management

### Client-side (React)

**Upload Page**:
- `loading` - File upload in progress
- `error` - Error messages
- `success` - Success messages

**Form Page**:
- `fields` - Array of form fields
- `formData` - Object with field values
- `loading` - Page loading state
- `exporting` - Document generation in progress
- `error` - Error messages

### Server-side (Session/Temp Storage)

```javascript
// Store template data in sessionStorage
sessionStorage.setItem(
  `template_${templateId}`,
  JSON.stringify(fields)
);

// Store on filesystem temporarily
public/temp/{templateId}.docx  // Original template
public/temp/{templateId}.json  // Metadata
```

## Performance Considerations

### File Processing
- **Mammoth**: Fast text extraction, handles large files
- **DOCX generation**: Creates documents in memory before download
- **Regex extraction**: O(n) complexity, scales well

### Limitations
- Max file size: 10MB (configurable)
- Max response size: 50MB (for large documents)
- Temporary storage: Cleared between restarts (use DB for persistence)

### Optimization Tips
1. Compress images in templates
2. Keep templates under 5MB
3. Implement pagination for large reports
4. Add caching for frequently used templates
5. Use database instead of file system for production

## Security Considerations

### Current Implementation
- File type validation (.docx, .doc, .docm)
- File size limits (10MB)
- Input sanitization for field names

### Production Recommendations
- Add authentication/authorization
- Validate all user inputs
- Implement rate limiting
- Add HTTPS
- Store files in cloud storage (S3, etc.)
- Implement audit logging
- Add CORS restrictions
- Sanitize field content for XSS

## Future Enhancements

```
Phase 1: Core functionality ✓
├─ Template upload
├─ Field extraction
├─ Form generation
└─ Report export

Phase 2: User management
├─ Authentication
├─ User profiles
├─ Template library
└─ Report history

Phase 3: Advanced features
├─ Database integration (PostgreSQL)
├─ Bulk report generation
├─ Template versioning
├─ Report scheduling
└─ Email notifications

Phase 4: Optimization
├─ Cloud storage (S3)
├─ Image compression
├─ Caching layer (Redis)
├─ Background jobs (Bull)
└─ Performance monitoring
```

## Troubleshooting Guide

### Build Issues

**Problem**: `npm install` fails
```bash
# Solution: Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Problem**: TypeScript errors
```bash
# Solution: Generate type definitions
npm run build
```

### Runtime Issues

**Problem**: "Template not found"
- Check if `public/temp/{templateId}.docx` exists
- Verify template ID is correct
- Check file permissions

**Problem**: "No fields found"
- Verify placeholder format: {field_name}
- No spaces: {field_name} not { field_name }
- Valid chars: letters, numbers, underscores only
- First char must be letter or underscore

**Problem**: Slow document generation
- Check file size (keep under 10MB)
- Reduce image count/size
- Monitor system resources

## Deployment

### Local Development
```bash
npm run dev          # Run dev server with hot reload
```

### Build for Production
```bash
npm run build        # Create optimized build
npm start            # Run production server
```

### Docker (Example)
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

### Environment Variables
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.example.com
DATABASE_URL=postgresql://...
```

---

This architecture supports scaling from single-user testing to production deployment.
