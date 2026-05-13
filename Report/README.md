# Valuation Report Automation

A web application that automates property valuation report generation for land valuers and banks. Upload Word document templates with placeholder fields, fill in data dynamically, and generate completed reports.

## Features

- **Template Upload**: Upload Word documents (.docx, .doc, .docm) with placeholder fields
- **Dynamic Form Generation**: Automatically extract and generate forms from placeholders
- **Document Generation**: Fill placeholders with data and generate completed reports
- **Multi-Bank Support**: Support different formats for different banks
- **Field Extraction**: Automatically detect fields marked with `{field_name}` syntax
- **User-Friendly Interface**: Clean, responsive UI for easy navigation

## Prerequisites

- Node.js 18+ and npm or yarn
- Word documents with placeholder fields in the format: `{field_name}`

## Installation

1. Clone the repository or navigate to the project directory:
   ```bash
   cd e:\Valuation\Report
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file if needed (optional for this basic setup):
   ```bash
   touch .env.local
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## How to Use

### 1. Create a Word Template

1. Open Microsoft Word or compatible software
2. Create your valuation report template
3. Replace variable information with placeholders using curly braces:
   - `{property_address}`
   - `{property_type}`
   - `{valuation_date}`
   - `{valuation_amount}`
   - `{surveyor_name}`
   - Example: "The property located at **{property_address}** has been valued at **{valuation_amount}**"

4. Save the file in Word format (.docx)

### 2. Upload Template

1. Go to the application home page
2. Click "Start with a New Template"
3. Upload your Word document
4. The system will extract all fields automatically

### 3. Fill the Form

1. After upload, you'll be redirected to a form with all extracted fields
2. Fill in all required fields
3. Click "Generate Report" to create the document

### 4. Download Report

1. The completed Word document will be automatically downloaded
2. Open and review the generated report
3. Save or print as needed

## Placeholder Field Syntax

Fields must be enclosed in curly braces and follow these rules:

- **Valid**: `{property_address}`, `{surveyor_name}`, `{valuation_2024}`
- **Invalid**: `{ property_address }` (spaces), `{property-address}` (hyphens at start/end)
- **Case Sensitive**: `{Property_Address}` and `{property_address}` are different

### Naming Conventions

Use descriptive field names with underscores:
- ✓ `{property_address}`
- ✓ `{valuation_amount}`
- ✓ `{surveyor_contact_email}`
- ✗ `{prop}` (too vague)
- ✗ `{a}` (too short)

## Supported File Formats

- `.docx` - Word 2007 and later (Recommended)
- `.doc` - Word 97-2003
- `.docm` - Word with Macros

Maximum file size: 10MB

## Project Structure

```
valuation-report-automation/
├── app/
│   ├── api/
│   │   ├── upload/
│   │   │   └── route.ts          # Upload and extract fields
│   │   └── export/
│   │       └── route.ts           # Generate filled document
│   ├── upload/
│   │   └── page.tsx               # Template upload page
│   ├── form/
│   │   └── page.tsx               # Form filling page
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   └── globals.css                # Global styles
├── lib/                           # Utility functions
├── public/
│   └── temp/                      # Temporary file storage
├── package.json
├── tsconfig.json
└── next.config.js
```

## Technologies Used

- **Frontend**: Next.js 14, React 18, CSS3
- **Backend**: Next.js API Routes, Node.js
- **Document Processing**: 
  - `mammoth` - Extract text from Word documents
  - `docx` - Generate Word documents
- **Language**: TypeScript

## API Endpoints

### POST `/api/upload`

Uploads a Word document and extracts placeholder fields.

**Request**:
```
Content-Type: multipart/form-data
Body: { file: File }
```

**Response**:
```json
{
  "templateId": "1234567890",
  "fieldCount": 5,
  "fields": [
    { "name": "property_address", "type": "text" },
    { "name": "property_description", "type": "textarea" }
  ],
  "fileName": "template.docx"
}
```

### POST `/api/export`

Generates a filled Word document with provided data.

**Request**:
```json
{
  "templateId": "1234567890",
  "data": {
    "property_address": "123 Main Street",
    "property_type": "Residential",
    "valuation_amount": "$250,000"
  }
}
```

**Response**: Binary Word document file

## Limitations & Future Enhancements

### Current Limitations
- Templates stored in temporary directory (doesn't persist after app restart)
- No user authentication
- No database storage

### Planned Features
- Database integration (PostgreSQL/MongoDB) for persistent storage
- User authentication and profile management
- Template versioning and history
- Multiple language support
- Bulk report generation
- Report preview before download
- Template editor UI
- Field validation rules
- Email notification for report completion

## Troubleshooting

### "No placeholder fields found"
- Ensure your placeholders use the format: `{field_name}`
- Check that field names only contain letters, numbers, and underscores
- Make sure there are no spaces inside the braces

### Upload fails with large files
- Maximum file size is 10MB
- Compress images in your template or use a smaller template

### Generated report doesn't look right
- Some complex Word formatting may not be preserved
- Try simplifying the template structure
- Ensure placeholders are in regular text, not in headers/footers

### Application won't start
- Delete `node_modules` folder and run `npm install` again
- Clear `.next` folder: `rm -rf .next`
- Check Node.js version (must be 18+): `node --version`

## Development Notes

- The app uses sessionStorage for template data in the current version
- For production, implement a proper database solution
- Consider adding file size optimization for large templates
- Add validation for field names before form generation

## License

MIT

## Support

For issues or feature requests, please create an issue or contact the development team.
