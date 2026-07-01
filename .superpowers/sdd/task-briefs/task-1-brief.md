# Task 1 Brief: Backend - File Validation Utilities

## Task Description

Create `backend/src/utils/fileValidator.ts` with comprehensive file validation:
- Check file extension (.csv, .xlsx, .xls)
- Check file size (max 10MB)
- Validate magic bytes (not just extension)
- Return validation result with mimeType

## Interface

```typescript
interface ValidationResult {
  valid: boolean;
  mimeType: string;
  error?: string;
}

function validateFile(buffer: Buffer, filename: string): ValidationResult
```

## Requirements

1. **Allowed extensions**: `.csv`, `.xlsx`, `.xls`
2. **Max file size**: 10MB (10 * 1024 * 1024 bytes)
3. **Magic bytes validation**:
   - CSV: Check if content is valid text (printable ASCII > 80%)
   - XLSX: PK (ZIP) magic bytes [0x50, 0x4B, 0x03, 0x04]
   - XLS: OLE2 magic bytes [0xD0, 0xCF, 0x11, 0xE0]
4. **Error messages in Indonesian**:
   - "Format file tidak valid. Gunakan .csv atau .xlsx"
   - "Ukuran file maksimal 10MB"

## Test File Location

Create test at: `backend/src/utils/__tests__/fileValidator.test.ts`

## Test Cases

1. Should accept CSV files (valid buffer with text content)
2. Should accept XLSX files (valid ZIP signature)
3. Should reject EXE files disguised as CSV (MZ signature)
4. Should reject files larger than 10MB
5. Should reject files with invalid extensions

## Dependencies

- None (independent task)

## Plan Reference

Global Constraints:
- Max file size: 10MB
- Transaction isolation: Serializable
