# Task 1 Report: Backend - File Validation Utilities

## Status: DONE

## Files Created

1. **`backend/src/utils/fileValidator.ts`** — Core validation logic
2. **`backend/src/utils/__tests__/fileValidator.test.ts`** — Test suite (15 tests)
3. **`backend/vitest.config.ts`** — Vitest configuration

## Files Modified

- **`backend/package.json`** — Added `test` and `test:watch` npm scripts; added `vitest` and `@vitest/coverage-v8` devDependencies

## Implementation Summary

`validateFile(buffer: Buffer, filename: string): ValidationResult` performs three validation layers:

1. **Extension check** — Only `.csv`, `.xlsx`, `.xls` pass; returns Indonesian error otherwise.
2. **Size check** — Rejects buffers larger than 10MB (10 * 1024 * 1024 bytes) with Indonesian error.
3. **Magic bytes check**:
   - `.xlsx` → must start with `PK\x03\x04` (ZIP signature)
   - `.xls`  → must start with `\xD0\xCF\x11\xE0` (OLE2 Compound Document)
   - `.csv`  → must have >80% printable ASCII (tabs, LF, CR, 0x20–0x7e); rejects binary disguised as CSV

## Test Results

```
Test Files  1 passed (1)
      Tests  15 passed (15)
   Duration  602ms
```

All required test cases pass, plus additional coverage:
- CSV accepted with valid text
- CSV accepted with uppercase extension
- EXE (MZ) rejected when renamed to `.csv`
- Binary content rejected when renamed to `.csv`
- XLSX accepted with ZIP signature
- Non-ZIP content rejected with `.xlsx` extension
- MZ EXE rejected with `.xlsx` extension
- XLS accepted with OLE2 signature
- Text content rejected with `.xls` extension
- Files larger than 10MB rejected
- Files at exactly 10MB boundary accepted
- Files just under 10MB accepted
- Disallowed extensions (`.txt`, no extension, `.json`) rejected

## No Concerns
