# Task 2 Brief: Backend - File Parser (CSV/XLSX)

## Task Description

Create `backend/src/utils/fileParser.ts` for parsing CSV and XLSX files.

## Interface

```typescript
interface ParsedRow {
  code: string;
  name: string;
  sites_name: string;
  jenis: string;
  tahun_operasi: number;
  label_code?: string;
  merk?: string;
  status?: string;
  kondisi?: string;
  kapasitas?: string;
  jenis_tegangan?: string;
  beban_arus?: string | number;
  ruangan_name?: string;
  teknisi?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  class_type?: string;
  region?: string;
  district?: string;
  organization_name?: string;
  cluster?: string;
}

interface ParseResult {
  data: ParsedRow[];
  errors: string[];
}

async function parseFile(buffer: Buffer, mimeType: string, filename: string): Promise<ParseResult>
```

## Requirements

1. **CSV parsing**: Use papaparse library
2. **XLSX parsing**: Use xlsx library
3. **Row limit**: Max 10,000 rows
4. **Required columns**: code, name, sites_name, jenis, tahun_operasi
5. **Sanitization**:
   - Trim all string values
   - Convert tahun_operasi to integer
   - Handle Excel serial dates
6. **Validation**: Error handling for invalid data

## Dependencies

- Task 1 (fileValidator)
- Libraries: papaparse, xlsx

## Test File Location

Create test at: `backend/src/utils/__tests__/fileParser.test.ts`

## Plan Reference

Global Constraints:
- Max rows: 10,000
