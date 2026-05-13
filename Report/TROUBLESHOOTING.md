# Troubleshooting Guide

## Installation & Setup Issues

### 1. npm install fails with package not found

**Error**:
```
npm error 404 Not Found - GET https://registry.npmjs.org/...
```

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

### 2. Node version incompatibility

**Error**:
```
The engine "node" is incompatible with this package
```

**Solution**:
```bash
# Check your Node version
node --version

# Should be 18.0.0 or higher
# If not, update Node.js from https://nodejs.org/
```

---

### 3. Port 3000 already in use

**Error**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution - Option A**: Kill the process using port 3000
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

**Solution - Option B**: Use different port
```bash
npm run dev -- -p 3001
# Access at http://localhost:3001
```

---

## Application Runtime Issues

### 4. "No template data found" error

**Problem**: Uploaded template not recognized when returning to form

**Causes**:
- Browser cache cleared
- Session storage cleared
- Different browser tab

**Solution**:
1. Upload template again
2. Keep same browser tab open
3. Clear browser cache after uploading:
   - Chrome: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete
   - Safari: Cmd+Shift+Delete

---

### 5. "No placeholder fields found" error

**Error**: Upload succeeds but no fields extracted

**Possible Causes**:
- Wrong placeholder format
- Placeholders are in shapes/text boxes (not regular text)
- Special characters preventing regex match

**Check your template**:
```
✓ Correct:    {property_address}
✗ Wrong:      { property_address }  (spaces)
✗ Wrong:      {property-address}    (hyphen)
✗ Wrong:      {123property}         (starts with number)
```

**Solution**:
1. Open template in Word
2. Find and replace: Use Find & Replace to verify format
3. Ensure placeholders are in regular text, not:
   - Headers/footers
   - Text boxes
   - Shapes
   - Comments

4. Try simple test:
   - Create new Word doc
   - Type: "Hello {name} from {company}"
   - Save as .docx
   - Upload to test

---

### 6. Form page not loading / 404 error

**Error**: Redirects to form page but shows error

**Causes**:
- Session storage not persisting
- Template ID mismatch
- Server-side template file deleted

**Solution**:
1. Clear sessionStorage:
   ```javascript
   // Open browser DevTools Console and run:
   sessionStorage.clear();
   ```

2. Upload template again

3. Restart dev server:
   ```bash
   npm run dev
   ```

---

### 7. Generated document is empty or malformed

**Problem**: Downloaded .docx is blank or corrupted

**Causes**:
- Complex formatting not supported
- Large images causing issues
- Unsupported font types

**Solution**:
1. Simplify template:
   - Remove complex formatting
   - Remove images
   - Use standard fonts (Arial, Times New Roman)

2. Test with simple template first

3. Reduce image file sizes

---

## File Upload Issues

### 8. "File size must be less than 10MB"

**Error**: File rejected on upload

**Solution**:
1. Compress template:
   ```bash
   # In Word: File > Reduce File Size > OK
   ```

2. Remove embedded objects:
   - Delete unnecessary images
   - Remove embedded videos
   - Use linked images instead

3. Save as newer format (.docx instead of .doc)

---

### 9. Unsupported file format

**Error**: "Please upload a Word document (.docx, .doc, or .docm)"

**Causes**:
- File is .pdf, .txt, or other format
- File extension is wrong
- Corrupted file

**Solution**:
1. Verify file type: Right-click > Properties > Type
2. Open with Word: File > Open
3. Save as: Word Document (.docx)
4. Try uploading again

---

### 10. Upload appears to hang

**Problem**: Upload progress spins indefinitely

**Solution - Option 1**: Check file size
```bash
# File size must be < 10MB
# Check: Right-click file > Properties > Size
```

**Solution - Option 2**: Check internet connection
```bash
# Try uploading smaller file first
# Verify network connection
```

**Solution - Option 3**: Browser issue
```bash
# Clear browser cache
# Try different browser
# Try incognito/private mode
```

---

## Form Filling Issues

### 11. Form fields not showing

**Problem**: Form page loads but no input fields visible

**Causes**:
- JavaScript disabled
- Browser compatibility issue
- Fields extraction failed

**Solution**:
1. Enable JavaScript:
   - Chrome: Settings > Privacy and Security > Site Settings > JavaScript > Allowed
   - Firefox: about:config > javascript.enabled > true

2. Try different browser

3. Upload template again

---

### 12. "All fields are required" validation error

**Problem**: Can't submit form even with filled fields

**Possible Causes**:
- Hidden HTML5 validation issues
- Browser autocomplete interference

**Solution**:
1. Verify all fields have values (no empty spaces)
2. Try clearing form with "Clear Form" button
3. Re-fill all fields
4. Submit again

---

### 13. Generated document has wrong data

**Problem**: Downloaded report shows incorrect values

**Causes**:
- Form data entered incorrectly
- Placeholder mismatch
- Browser cache showing old data

**Solution**:
1. Check form data before submitting:
   - Review each field value
   - Verify spelling/formatting

2. Clear form and re-enter carefully

3. Check original template placeholders match form fields

---

## Browser Compatibility Issues

### 14. Application doesn't work in Internet Explorer

**Problem**: App won't load in IE 11

**Solution**: This is expected
- Application requires modern browser
- Supported browsers:
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+

**Fix**: Use modern browser

---

### 15. Mobile browser not working properly

**Problem**: App doesn't work well on phone/tablet

**Expected Behavior**: 
- App is optimized for desktop
- Mobile support is limited

**Workaround**:
1. Use desktop/laptop
2. For mobile: Can view uploaded reports

---

## Performance Issues

### 16. Application is slow

**Optimization steps**:

```bash
# 1. Clear Next.js cache
rm -rf .next

# 2. Rebuild
npm run build

# 3. Restart dev server
npm run dev
```

**Check system resources**:
- Available RAM: 4GB minimum
- Disk space: 500MB free
- CPU: Monitor in Task Manager

---

### 17. Document generation takes too long

**Reasons**:
- Large template file (>5MB)
- System resource constraints
- Large number of fields

**Solution**:
1. Reduce template file size
2. Remove images/complex formatting
3. Limit fields per template
4. Increase system RAM/swap

---

## Advanced Troubleshooting

### 18. Check application logs

**For debugging**:

1. **Browser Console**:
   - Press F12
   - Go to Console tab
   - Look for red errors

2. **Terminal Output**:
   - Look at npm dev output
   - Note any error messages
   - Red lines indicate issues

3. **Capture error**:
   ```
   Take screenshot of error
   Note exact error message
   Try to reproduce
   ```

---

### 19. Reset application completely

**Nuclear option - clears everything**:

```bash
# Stop dev server: Ctrl+C

# Clear Next.js build
rm -rf .next

# Clear dependencies
rm -rf node_modules
rm package-lock.json

# Clear temp files
rm -rf public/temp/*

# Clear browser cache (Chrome):
# Settings > Privacy > Clear browsing data > All time

# Reinstall
npm install

# Start again
npm run dev
```

---

### 20. Collect diagnostic information

**For support/debugging**:

```bash
# Node version
node --version

# npm version
npm --version

# Installed packages
npm list --depth=0

# System info (Windows)
systeminfo

# Check port usage
netstat -ano | findstr :3000
```

---

## Common Workarounds

### Upload fails repeatedly
```bash
# Try using different Word version
# Save template with Compatibility Mode:
# File > Save As > Other Formats > Word 97-2003
```

### Form won't generate correctly
```bash
# Use simpler field names
# Instead of: {property_valuation_amount_in_usd}
# Use: {valuation_amount}
```

### Downloaded file is corrupted
```bash
# Try different browser
# Try incognito/private mode
# Check antivirus isn't blocking download
```

---

## Getting Help

### Before asking for help, try:
1. ✓ Read error message carefully
2. ✓ Check this troubleshooting guide
3. ✓ Restart dev server
4. ✓ Clear browser cache
5. ✓ Try different browser
6. ✓ Check system resources

### When asking for help, provide:
- Exact error message
- Steps to reproduce
- Browser and version
- Node.js version
- System OS and version
- Screenshot of error

---

## Still Having Issues?

### Check these resources:
1. **README.md** - Full documentation
2. **QUICKSTART.md** - Getting started guide
3. **ARCHITECTURE.md** - Technical details
4. **Browser DevTools** - F12 > Console for errors

### Verify setup:
```bash
# Test if running
curl http://localhost:3000

# Should return HTML (not an error)
```

### Fresh installation:
```bash
# If all else fails, start fresh
cd parent-directory
rm -rf Report
# Clone/download project again
npm install
npm run dev
```

---

**Last Resort**: Reinstall everything and start from scratch. It works! 🎯
