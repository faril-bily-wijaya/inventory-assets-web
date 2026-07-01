# Task 5 Brief: Backend - API Routes (Import Endpoints)

## Task Description

Add import API endpoints to `backend/src/routes/devices.routes.ts`.

## Endpoints to Add

### 1. POST /api/devices/import/preview
- Accept multipart/form-data with file and mode
- Validate file using fileValidator
- Parse file using fileParser
- Generate preview using importService
- Return preview stats

### 2. POST /api/devices/import
- Accept multipart/form-data with file and mode
- Validate and parse file
- Execute import with transaction
- Return result stats

### 3. GET /api/devices/import/template
- Generate XLSX template
- Return as downloadable file

## Dependencies

- Task 1 (fileValidator)
- Task 2 (fileParser)
- Task 4 (importService)
- multer (for file upload)

## Work Directory

D:\project Coding\Inventory-assets-program\backend

## Notes

- Use `upload.single('file')` middleware for file upload
- Wrap executeImport in `prisma.$transaction()` with Serializable isolation
- Set timeout to 60000ms for large imports
