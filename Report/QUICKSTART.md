# Quick Start Guide

## ✅ Application Setup Complete!

Your Valuation Report Automation application is now ready to use.

## 🚀 Getting Started

### 1. Development Server is Running

The application is already running at: **http://localhost:3000**

Open your browser and navigate to this URL.

### 2. First Steps

1. **Home Page** - Familiarize yourself with the interface
2. **Create a Template** - Prepare a Word document with placeholder fields
3. **Upload Template** - Click "Start with a New Template"
4. **Fill Form** - Complete all fields
5. **Generate Report** - Download your filled document

## 📝 Creating Your First Template

### Template Format

Create a Word document with your valuation report template. Use **{field_name}** format for placeholders:

```
PROPERTY VALUATION REPORT

Property Address: {property_address}
Property Type: {property_type}
Valuation Date: {valuation_date}
Total Area (sqft): {total_area}
Market Value: {market_value}

Surveyor Name: {surveyor_name}
```

### Field Naming Rules

- ✓ Valid: `{property_address}`, `{surveyor_name}`, `{valuation_2024}`
- ✗ Invalid: `{ property_address }` (spaces), `{property-address}` (invalid chars)
- Case-sensitive: `{Address}` ≠ `{address}`

## 💡 Example Workflow

### Step 1: Create Template
```
Save this as: my_bank_template.docx

---

VALUATION REPORT

Date: {report_date}
Bank: {bank_name}
Loan Amount: {loan_amount}

Property Details:
Address: {property_address}
Type: {property_type}
Area: {total_area} sqft

Market Value: {market_value}

Surveyor: {surveyor_name}
License: {surveyor_license}
```

### Step 2: Upload Template
1. Go to http://localhost:3000/upload
2. Click the upload box
3. Select your Word document

### Step 3: Fill Form
You'll see form fields for:
- report_date
- bank_name
- loan_amount
- property_address
- property_type
- total_area
- market_value
- surveyor_name
- surveyor_license

Fill in all fields and click "Generate Report"

### Step 4: Download
Your completed report downloads as a Word document!

## 📁 Project Structure

```
e:\Valuation\Report\
├── app/
│   ├── page.tsx               # Home page
│   ├── layout.tsx             # Root layout
│   ├── globals.css            # Styles
│   ├── upload/
│   │   └── page.tsx           # Upload page
│   ├── form/
│   │   └── page.tsx           # Form page
│   └── api/
│       ├── upload/route.ts    # Upload API
│       └── export/route.ts    # Export API
├── public/
│   └── temp/                  # Stored templates
├── package.json
├── tsconfig.json
└── next.config.js
```

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm lint
```

## ✨ Features

✓ **Multiple Templates** - Upload different templates for different banks
✓ **Auto Field Extraction** - Automatically finds all placeholders
✓ **Dynamic Forms** - Forms generated based on template fields
✓ **Easy Download** - One-click report generation
✓ **Responsive Design** - Works on desktop and tablet
✓ **No Database Required** - Works out of the box

## 🐛 Troubleshooting

### Application won't start
```bash
# Clear build cache
rm -r .next

# Reinstall dependencies
rm -r node_modules
npm install

# Try again
npm run dev
```

### "No fields found" error
- Check placeholders use format: `{field_name}`
- No spaces inside braces
- Field names must start with letter or underscore
- Only letters, numbers, underscores allowed

### Template upload fails
- File must be in Word format (.docx, .doc, .docm)
- Maximum size: 10MB
- Ensure you have read permissions

## 📚 Advanced Usage

### Template Variables (Examples)

For a bank valuation template:
- `{bank_name}` - Bank name
- `{branch_code}` - Branch code
- `{loan_amount}` - Loan amount
- `{property_address}` - Property address
- `{surveyor_name}` - Surveyor name
- `{valuation_date}` - Valuation date

For a real estate appraisal:
- `{property_type}` - Type (Residential, Commercial, etc.)
- `{total_area}` - Total area
- `{land_area}` - Land area
- `{market_value}` - Market value
- `{client_name}` - Client name
- `{appraiser_license}` - License number

## 🔄 Workflow Tips

1. **Create Multiple Templates** - One for each bank's format
2. **Reuse Templates** - Upload same template, fill different data
3. **Organize Fields** - Use descriptive field names
4. **Consistent Naming** - Use same field names across templates
5. **Backup Templates** - Keep original Word files for reference

## 🚀 Next Steps

1. **Customize Templates** - Create templates for your specific use cases
2. **Test Upload** - Try uploading a test template
3. **Generate Reports** - Create your first valuation report
4. **Optimize** - Fine-tune templates based on feedback

## ❓ FAQ

**Q: Can I edit templates in the app?**
A: Currently, edit templates in Word and re-upload. Database integration for in-app editing coming soon.

**Q: Are templates saved after app restart?**
A: No, templates are temporary. For production, database integration is needed.

**Q: Can I use same field multiple times?**
A: Yes! Use `{field_name}` anywhere in the template.

**Q: What about complex formatting?**
A: Basic formatting preserved. Complex formatting may need manual adjustment.

**Q: Can I upload image-heavy templates?**
A: Yes, but keep under 10MB. Optimize image sizes.

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review README.md for detailed documentation
3. Check SAMPLE_TEMPLATE.txt for template examples

## 🎯 Your First Task

1. **Open Word** and create a simple valuation template
2. **Add placeholders** like `{property_address}` and `{valuation_amount}`
3. **Save as** .docx file
4. **Go to** http://localhost:3000/upload
5. **Upload** your template
6. **Fill the form** with test data
7. **Generate** your first report!

Good luck! 🎉
