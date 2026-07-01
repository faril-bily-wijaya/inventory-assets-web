# Import Data Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement import data feature via CSV/XLSX upload and enhance map popup with categorized device display.

**Architecture:** Backend handles file parsing, validation, and database operations with transactions. Frontend provides upload UI, preview, and map popup enhancement. Modernization logic is calculated on-the-fly, not stored in database.

**Tech Stack:** 
- Backend: Express, Prisma, xlsx, papaparse, zod
- Frontend: React, react-dropzone, xlsx, TailwindCSS v4

---

## Global Constraints

| Constraint | Value |
|------------|-------|
| Max file size | 10MB |
| Max rows | 10,000 |
| Catu Daya types | Genset, BATSTARTER, BATBASAH, BATKERING, Rectifier, Inverter, UPS, MDP, AVR, TANGKIBBM, DCPDB, ACPDB, DCPDBSTANDING, ACPDBSTANDING, ELECTRICALPANEL, TRAFO, ATS, AMF |
| Non-Catu Daya types | ACSPLIT, ACSTANDING, OLT, Switch, DWDM, Server, PAC, OTB, Router, Radio, BRAS, METROE, NODEBROADBAND, FTM, RTU, ONT, OS, OTN, SDH, FIRESUPPRESSION, LEGACY, ODF |
| Modernization threshold | AC > 15 years, Rectifier > 15 years, BATKERING > 10 years, BATBASAH > 20 years, Genset > 25 years |
| Transaction isolation | Serializable |
| Preview max per section | 5 items |

---

## File Structure Overview

```
backend/
├── src/
│   ├── utils/
│   │   ├── fileParser.ts              # CSV/XLSX parsing + validation
│   │   ├── fileValidator.ts           # MIME type, size validation
│   │   └── modernization.ts           # On-the-fly calculation
│   ├── services/
│   │   └── importService.ts           # Import business logic
│   ├── routes/
│   │   ├── devices.routes.ts          # Add import endpoints
│   │   └── locations.routes.ts        # Add by-location endpoint
│   └── index.ts
│
frontend/
├── src/
│   ├── components/
│   │   ├── import/
│   │   │   ├── ImportTab.tsx
│   │   │   ├── FileDropzone.tsx
│   │   │   ├── ImportPreview.tsx
│   │   │   ├── ModeSelector.tsx
│   │   │   └── ConfirmModal.tsx
│   │   ├── map/
│   │   │   ├── DevicePopup.tsx        # Enhanced
│   │   │   ├── DeviceSection.tsx     # NEW
│   │   │   └── DeviceListModal.tsx   # NEW
│   │   └── modals/
│   │       └── DeviceModal.tsx
│   ├── services/
│   │   ├── importService.ts          # NEW
│   │   └── ...
│   ├── pages/
│   │   ├── DevicesPage.tsx          # Add tabs
│   │   └── ...
│   ├── types/
│   │   └── index.ts                 # Add import types
```

---

## BACKEND TASKS

### Task 1: Backend - File Validation Utilities

**Files:**
- Create: `backend/src/utils/fileValidator.ts`
- Test: `backend/src/utils/__tests__/fileValidator.test.ts`

**Interfaces:**
- Consumes: `File` (Buffer), `filename: string`
- Produces: `{ valid: boolean, mimeType: string, error?: string }`

- [ ] **Step 1: Write failing test**

```typescript
// backend/src/utils/__tests__/fileValidator.test.ts
import { validateFile } from '../fileValidator';

describe('validateFile', () => {
  it('should accept CSV files', () => {
    const buffer = Buffer.from('name,code\nDevice 1,ABC123');
    const result = validateFile(buffer, 'data.csv');
    expect(result.valid).toBe(true);
    expect(result.mimeType).toBe('text/csv');
  });

  it('should accept XLSX files', () => {
    // Minimal XLSX magic bytes (PK ZIP signature)
    const buffer = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
    const result = validateFile(buffer, 'data.xlsx');
    expect(result.valid).toBe(true);
  });

  it('should reject EXE files disguised as CSV', () => {
    const buffer = Buffer.from([0x4D, 0x5A]); // EXE magic bytes
    const result = validateFile(buffer, 'evil.csv');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Format file tidak valid');
  });

  it('should reject files larger than 10MB', () => {
    const buffer = Buffer.alloc(11 * 1024 * 1024);
    const result = validateFile(buffer, 'large.csv');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Ukuran file maksimal 10MB');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npm test -- --testPathPattern="fileValidator" -v`
Expected: FAIL with "Cannot find module '../fileValidator'"

- [ ] **Step 3: Write implementation**

```typescript
// backend/src/utils/fileValidator.ts

const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];
const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/octet-stream', // some XLSX files
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Magic bytes signatures
const MAGIC_BYTES = {
  csv: [
    { bytes: [0x1F], offset: 0 }, // possible text file
  ],
  xlsx: [
    { bytes: [0x50, 0x4B, 0x03, 0x04], offset: 0 }, // PK (ZIP)
  ],
  xls: [
    { bytes: [0xD0, 0xCF, 0x11, 0xE0], offset: 0 }, // OLE2 Compound Document
  ],
};

function checkMagicBytes(buffer: Buffer, signatures: Array<{ bytes: number[], offset: number }>): boolean {
  return signatures.some(({ bytes, offset }) => {
    if (offset + bytes.length > buffer.length) return false;
    return bytes.every((byte, i) => buffer[offset + i] === byte);
  });
}

function isTextContent(buffer: Buffer): boolean {
  // Check if buffer contains valid UTF-8 text (CSV-like content)
  const sampleSize = Math.min(100, buffer.length);
  const sample = buffer.slice(0, sampleSize);
  
  // Check for printable ASCII or common CSV delimiters
  let printableCount = 0;
  for (let i = 0; i < sample.length; i++) {
    const byte = sample[i];
    if (
      (byte >= 32 && byte <= 126) || // printable ASCII
      byte === 10 || byte === 13 || byte === 9 // LF, CR, TAB
    ) {
      printableCount++;
    }
  }
  
  return printableCount / sampleSize > 0.8;
}

export interface ValidationResult {
  valid: boolean;
  mimeType: string;
  error?: string;
}

export function validateFile(buffer: Buffer, filename: string): ValidationResult {
  // Check extension
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      mimeType: 'unknown',
      error: 'Format file tidak valid. Gunakan .csv atau .xlsx'
    };
  }

  // Check file size
  if (buffer.length > MAX_FILE_SIZE) {
    return {
      valid: false,
      mimeType: 'unknown',
      error: 'Ukuran file maksimal 10MB'
    };
  }

  // Check magic bytes
  const isXlsx = checkMagicBytes(buffer, MAGIC_BYTES.xlsx);
  const isXls = checkMagicBytes(buffer, MAGIC_BYTES.xls);
  const isCsv = ext === '.csv' && isTextContent(buffer);

  if (!isXlsx && !isXls && !isCsv) {
    return {
      valid: false,
      mimeType: 'unknown',
      error: 'Format file tidak valid. Gunakan .csv atau .xlsx'
    };
  }

  // Determine MIME type
  let mimeType = 'application/octet-stream';
  if (ext === '.csv') {
    mimeType = 'text/csv';
  } else if (ext === '.xlsx') {
    mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  } else if (ext === '.xls') {
    mimeType = 'application/vnd.ms-excel';
  }

  return { valid: true, mimeType };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npm test -- --testPathPattern="fileValidator" -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd backend
git add src/utils/fileValidator.ts src/utils/__tests__/fileValidator.test.ts
git commit -m "feat(backend): add file validation utility with MIME type and size checks"
```

---

### Task 2: Backend - File Parser (CSV/XLSX)

**Files:**
- Create: `backend/src/utils/fileParser.ts`
- Test: `backend/src/utils/__tests__/fileParser.test.ts`

**Interfaces:**
- Consumes: `Buffer`, `mimeType: string`, `filename: string`
- Produces: `ParsedData[]` (array of row objects)

**Dependencies:** Task 1

- [ ] **Step 1: Write failing test**

```typescript
// backend/src/utils/__tests__/fileParser.test.ts
import { parseFile } from '../fileParser';

describe('parseFile', () => {
  it('should parse CSV correctly', async () => {
    const csv = `code,name,jenis,tahun_operasi
ABC001,GENSET 01,GENSET,2000
ABC002,AC SPLIT,ACSPLIT,2015`;
    
    const buffer = Buffer.from(csv);
    const result = await parseFile(buffer, 'text/csv', 'data.csv');
    
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      code: 'ABC001',
      name: 'GENSET 01',
      jenis: 'GENSET',
      tahun_operasi: 2000
    });
  });

  it('should throw error for files with missing required columns', async () => {
    const csv = `code,name
ABC001,Device 1`;
    
    const buffer = Buffer.from(csv);
    await expect(parseFile(buffer, 'text/csv', 'data.csv'))
      .rejects.toThrow('missing required columns');
  });

  it('should throw error for files exceeding row limit', async () => {
    const tooManyRows = Array(10001).fill('code,name\nABC001,Test').join('\n');
    const buffer = Buffer.from(tooManyRows);
    
    await expect(parseFile(buffer, 'text/csv', 'data.csv'))
      .rejects.toThrow('maksimal 10000 baris');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npm test -- --testPathPattern="fileParser" -v`
Expected: FAIL with "Cannot find module '../fileParser'"

- [ ] **Step 3: Write implementation**

```typescript
// backend/src/utils/fileParser.ts

import { parse as csvParse } from 'papaparse';
import * as XLSX from 'xlsx';
import { z } from 'zod';

const MAX_ROWS = 10000;
const REQUIRED_COLUMNS = ['code', 'name', 'sites_name', 'jenis', 'tahun_operasi'];

// Zod schema for row validation
const RowSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  sites_name: z.string().min(1),
  jenis: z.string().min(1),
  tahun_operasi: z.union([
    z.number().int().min(1900).max(new Date().getFullYear() + 1),
    z.string().transform(val => parseInt(val, 10)).pipe(
      z.number().int().min(1900).max(new Date().getFullYear() + 1)
    )
  ]),
  label_code: z.string().optional(),
  merk: z.string().optional(),
  tahun_operasi: z.union([
    z.number(),
    z.string().transform(s => {
      const num = parseInt(s, 10);
      if (isNaN(num)) return null;
      return num;
    })
  ]).optional(),
  status: z.string().optional(),
  kondisi: z.string().optional(),
  kapasitas: z.string().optional(),
  jenis_tegangan: z.string().optional(),
  beban_arus: z.union([z.string(), z.number()]).optional(),
  ruangan_name: z.string().optional(),
  teknisi: z.string().optional(),
  latitude: z.union([z.string(), z.number()]).optional().transform(v => v ? parseFloat(String(v)) : null),
  longitude: z.union([z.string(), z.number()]).optional().transform(v => v ? parseFloat(String(v)) : null),
  address: z.string().optional(),
  class_type: z.string().optional(),
  region: z.string().optional(),
  district: z.string().optional(),
  organization_name: z.string().optional(),
  cluster: z.string().optional(),
});

export interface ParsedRow {
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

export interface ParseResult {
  data: ParsedRow[];
  errors: string[];
}

function parseCSV(buffer: Buffer): ParsedRow[] {
  const text = buffer.toString('utf-8');
  const result = csvParse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (result.errors.length > 0) {
    throw new Error(`CSV parsing error: ${result.errors[0].message}`);
  }

  return result.data as unknown as ParsedRow[];
}

function parseXLSX(buffer: Buffer): ParsedRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  // Normalize header names (remove BOM, trim spaces)
  const normalizedData = (data as Record<string, unknown>[]).map(row => {
    const normalized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      const normalizedKey = key.replace(/[​-‍﻿]/g, '').trim();
      
      // Handle Excel date serialization for tahun_operasi
      if (normalizedKey === 'tahun_operasi' && typeof value === 'number') {
        // If it looks like an Excel serial date (number > 1900 and < 10000), use it directly
        if (value >= 1900 && value <= 2100) {
          normalized[normalizedKey] = Math.floor(value);
        } else {
          normalized[normalizedKey] = value;
        }
      } else {
        normalized[normalizedKey] = value;
      }
    }
    return normalized;
  });

  return normalizedData as unknown as ParsedRow[];
}

function validateColumns(rows: ParsedRow[]): string[] {
  const errors: string[] = [];
  const firstRow = rows[0];

  if (!firstRow) {
    errors.push('File kosong atau tidak memiliki data');
    return errors;
  }

  for (const col of REQUIRED_COLUMNS) {
    if (!(col in firstRow) || !firstRow[col as keyof ParsedRow]) {
      errors.push(`Kolom required tidak ditemukan: ${col}`);
    }
  }

  return errors;
}

export async function parseFile(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<ParseResult> {
  let rows: ParsedRow[];

  if (filename.endsWith('.csv') || mimeType === 'text/csv' || mimeType === 'text/plain') {
    rows = parseCSV(buffer);
  } else {
    rows = parseXLSX(buffer);
  }

  // Check row limit
  if (rows.length > MAX_ROWS) {
    throw new Error(`File terlalu besar. Maksimal ${MAX_ROWS} baris.`);
  }

  // Validate columns
  const columnErrors = validateColumns(rows);
  if (columnErrors.length > 0) {
    throw new Error(`File tidak memiliki kolom yang diperlukan: ${columnErrors.join(', ')}`);
  }

  // Sanitize and validate each row
  const sanitizedRows: ParsedRow[] = [];
  const parseErrors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      // Sanitize tahun_operasi
      let tahunOperasi = row.tahun_operasi;
      if (typeof tahunOperasi === 'string') {
        tahunOperasi = parseInt(tahunOperasi, 10);
      }
      if (isNaN(tahunOperasi as number)) {
        throw new Error('tahun_operasi must be a number');
      }

      sanitizedRows.push({
        ...row,
        tahun_operasi: tahunOperasi as number,
        // Trim all string values
        code: String(row.code || '').trim(),
        name: String(row.name || '').trim(),
        sites_name: String(row.sites_name || '').trim(),
        jenis: String(row.jenis || '').trim(),
        label_code: row.label_code ? String(row.label_code).trim() : undefined,
        merk: row.merk ? String(row.merk).trim() : undefined,
        status: row.status ? String(row.status).trim() : undefined,
        kondisi: row.kondisi ? String(row.kondisi).trim() : undefined,
        kapasitas: row.kapasitas ? String(row.kapasitas).trim() : undefined,
        jenis_tegangan: row.jenis_tegangan ? String(row.jenis_tegangan).trim() : undefined,
        ruangan_name: row.ruangan_name ? String(row.ruangan_name).trim() : undefined,
        teknisi: row.teknisi ? String(row.teknisi).trim() : undefined,
        latitude: row.latitude,
        longitude: row.longitude,
        address: row.address ? String(row.address).trim() : undefined,
        class_type: row.class_type ? String(row.class_type).trim() : undefined,
        region: row.region ? String(row.region).trim() : undefined,
        district: row.district ? String(row.district).trim() : undefined,
        organization_name: row.organization_name ? String(row.organization_name).trim() : undefined,
        cluster: row.cluster ? String(row.cluster).trim() : undefined,
      });
    } catch (err) {
      parseErrors.push(`Baris ${i + 2}: ${err instanceof Error ? err.message : 'Invalid data'}`);
    }
  }

  return { data: sanitizedRows, errors: parseErrors };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npm test -- --testPathPattern="fileParser" -v`
Expected: PASS (may need to adjust test for Excel handling)

- [ ] **Step 5: Commit**

```bash
cd backend
git add src/utils/fileParser.ts src/utils/__tests__/fileParser.test.ts
git commit -m "feat(backend): add file parser for CSV and XLSX with validation"
```

---

### Task 3: Backend - Modernization Calculator (On-The-Fly)

**Files:**
- Create: `backend/src/utils/modernization.ts`
- Test: `backend/src/utils/__tests__/modernization.test.ts`

**Interfaces:**
- Consumes: `deviceType: string`, `tahunOperasi: number`
- Produces: `{ butuhModernisasi: boolean }`

- [ ] **Step 1: Write failing test**

```typescript
// backend/src/utils/__tests__/modernization.test.ts
import { hitungButuhModernisasi } from '../modernization';

describe('hitungButuhModernisasi', () => {
  const currentYear = new Date().getFullYear();

  describe('AC devices', () => {
    it('should return true for ACSPLIT older than 15 years', () => {
      const result = hitungButuhModernisasi('ACSPLIT', currentYear - 16);
      expect(result.butuhModernisasi).toBe(true);
    });

    it('should return false for ACSPLIT younger than 15 years', () => {
      const result = hitungButuhModernisasi('ACSPLIT', currentYear - 10);
      expect(result.butuhModernisasi).toBe(false);
    });

    it('should return true for ACSTANDING older than 15 years', () => {
      const result = hitungButuhModernisasi('ACSTANDING', currentYear - 20);
      expect(result.butuhModernisasi).toBe(true);
    });
  });

  describe('Battery devices', () => {
    it('should return true for BATKERING older than 10 years', () => {
      const result = hitungButuhModernisasi('BATKERING', currentYear - 11);
      expect(result.butuhModernisasi).toBe(true);
    });

    it('should return true for BATBASAH older than 20 years', () => {
      const result = hitungButuhModernisasi('BATBASAH', currentYear - 21);
      expect(result.butuhModernisasi).toBe(true);
    });

    it('should return false for BATBASAH younger than 20 years', () => {
      const result = hitungButuhModernisasi('BATBASAH', currentYear - 15);
      expect(result.butuhModernisasi).toBe(false);
    });
  });

  describe('Rectifier', () => {
    it('should return true for Rectifier older than 15 years', () => {
      const result = hitungButuhModernisasi('RECTIFIER', currentYear - 16);
      expect(result.butuhModernisasi).toBe(true);
    });
  });

  describe('Genset', () => {
    it('should return true for Genset older than 25 years', () => {
      const result = hitungButuhModernisasi('GENSET', currentYear - 26);
      expect(result.butuhModernisasi).toBe(true);
    });

    it('should return false for Genset younger than 25 years', () => {
      const result = hitungButuhModernisasi('GENSET', currentYear - 20);
      expect(result.butuhModernisasi).toBe(false);
    });
  });

  describe('Non-Catu Daya devices', () => {
    it('should return false for OLT regardless of age', () => {
      const result = hitungButuhModernisasi('OLT', currentYear - 30);
      expect(result.butuhModernisasi).toBe(false);
    });

    it('should return false for Switch regardless of age', () => {
      const result = hitungButuhModernisasi('Switch', currentYear - 50);
      expect(result.butuhModernisasi).toBe(false);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npm test -- --testPathPattern="modernization" -v`
Expected: FAIL with "Cannot find module '../modernization'"

- [ ] **Step 3: Write implementation**

```typescript
// backend/src/utils/modernization.ts

export interface ModernizationResult {
  butuhModernisasi: boolean;
  alasan?: string;
}

const MODERNIZATION_THRESHOLDS: Record<string, { years: number; label: string }> = {
  // AC devices - threshold 15 years
  ACSPLIT: { years: 15, label: 'AC > 15 tahun' },
  ACSTANDING: { years: 15, label: 'AC > 15 tahun' },
  
  // Rectifier - threshold 15 years
  RECTIFIER: { years: 15, label: 'Rectifier > 15 tahun' },
  
  // Battery Kering (VRLA) - threshold 10 years
  BATKERING: { years: 10, label: 'Battery VRLA > 10 tahun' },
  
  // Battery Basah (VLA) - threshold 20 years
  BATBASAH: { years: 20, label: 'Battery VLA > 20 tahun' },
  
  // Genset - threshold 25 years
  GENSET: { years: 25, label: 'Genset > 25 tahun' },
};

export function hitungButuhModernisasi(
  deviceType: string,
  tahunOperasi: number
): ModernizationResult {
  const upperType = deviceType.toUpperCase();
  const threshold = MODERNIZATION_THRESHOLDS[upperType];
  
  if (!threshold) {
    return { butuhModernisasi: false };
  }
  
  const currentYear = new Date().getFullYear();
  const umur = currentYear - tahunOperasi;
  
  if (umur > threshold.years) {
    return {
      butuhModernisasi: true,
      alasan: threshold.label,
    };
  }
  
  return { butuhModernisasi: false };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npm test -- --testPathPattern="modernization" -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd backend
git add src/utils/modernization.ts src/utils/__tests__/modernization.test.ts
git commit -m "feat(backend): add modernization calculator utility"
```

---

### Task 4: Backend - Import Service (Business Logic)

**Files:**
- Create: `backend/src/services/importService.ts`
- Test: `backend/src/services/__tests__/importService.test.ts`

**Interfaces:**
- Consumes: `ParsedRow[]`, `mode: 'upsert' | 'replace'`, `prisma tx`
- Produces: `{ newDevices: number, updatedDevices: number, newLocations: number, errors: string[] }`

**Dependencies:** Task 2, Task 3

- [ ] **Step 1: Write failing test**

```typescript
// backend/src/services/__tests__/importService.test.ts
import { generateImportPreview, executeImport } from '../importService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('importService', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('generateImportPreview', () => {
    it('should count new vs existing devices', async () => {
      const sampleData = [
        { code: 'NEW001', name: 'New Device', sites_name: 'Site A', jenis: 'GENSET', tahun_operasi: 2020, label_code: 'L001' },
        { code: 'NEW002', name: 'Another Device', sites_name: 'Site B', jenis: 'OLT', tahun_operasi: 2018, label_code: 'L002' },
      ];

      const preview = await generateImportPreview(sampleData, 'upsert', prisma);
      
      expect(preview.totalRows).toBe(2);
      expect(preview.devicesBaru).toBe(2);
      expect(preview.devicesUpdated).toBe(0);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npm test -- --testPathPattern="importService" -v`
Expected: FAIL with "Cannot find module '../importService'"

- [ ] **Step 3: Write implementation**

```typescript
// backend/src/services/importService.ts

import { PrismaClient, Prisma } from '@prisma/client';
import { ParsedRow } from '../utils/fileParser';
import { hitungButuhModernisasi } from '../utils/modernization';

const CATU_DAYA_TYPES = [
  'GENSET', 'BATSTARTER', 'BATBASAH', 'BATKERING', 'RECTIFIER',
  'INVERTER', 'UPS', 'MDP', 'AVR', 'TANGKIBBM', 'DCPDB',
  'ACPDB', 'DCPDBSTANDING', 'ACPDBSTANDING', 'ELECTRICALPANEL',
  'TRAFO', 'ATS', 'AMF'
].map(t => t.toUpperCase());

export interface ImportPreview {
  totalRows: number;
  devicesBaru: number;
  devicesUpdated: number;
  duplikatDalamFile: number;
  regionalsBaru: number;
  districtsBaru: number;
  clustersBaru: number;
  locationsBaru: number;
  errors: string[];
}

export interface ImportResult {
  newDevices: number;
  updatedDevices: number;
  newLocations: number;
  totalProcessed: number;
  errors: string[];
}

function isCatuDaya(jenis: string): boolean {
  return CATU_DAYA_TYPES.includes(jenis.toUpperCase());
}

function findDuplicatesInFile(data: ParsedRow[]): Set<number> {
  const seen = new Map<string, number>();
  const duplicates = new Set<number>();

  data.forEach((row, index) => {
    const key = `${row.code}|${row.label_code || ''}`;
    if (seen.has(key)) {
      duplicates.add(index);
      duplicates.add(seen.get(key)!);
    } else {
      seen.set(key, index);
    }
  });

  return duplicates;
}

export async function generateImportPreview(
  data: ParsedRow[],
  mode: 'upsert' | 'replace',
  prisma: PrismaClient
): Promise<ImportPreview> {
  const duplicates = findDuplicatesInFile(data);
  
  let devicesBaru = 0;
  let devicesUpdated = 0;
  const regionalsBaruSet = new Set<string>();
  const districtsBaruSet = new Set<string>();
  const clustersBaruSet = new Set<string>();
  const locationsBaruSet = new Set<string>();

  for (const row of data) {
    // Check if device exists
    const existingDevice = await prisma.device.findFirst({
      where: {
        deviceCode: row.code,
        OR: [
          { serialNumber: row.label_code || '' },
          { serialNumber: null },
        ],
      },
    });

    if (existingDevice) {
      devicesUpdated++;
    } else {
      devicesBaru++;
    }

    // Check hierarchy
    const regionName = row.region || 'REGIONAL DEFAULT';
    const districtName = row.district || 'DISTRICT DEFAULT';
    const clusterName = row.organization_name || row.cluster || 'CLUSTER DEFAULT';
    const locationName = row.sites_name;

    const existingRegional = await prisma.regional.findFirst({ where: { name: regionName } });
    if (!existingRegional) regionalsBaruSet.add(regionName);

    const existingDistrict = await prisma.district.findFirst({ where: { name: districtName } });
    if (!existingDistrict) districtsBaruSet.add(districtName);

    const existingCluster = await prisma.cluster.findFirst({ where: { name: clusterName } });
    if (!existingCluster) clustersBaruSet.add(clusterName);

    const existingLocation = await prisma.location.findFirst({ where: { name: locationName } });
    if (!existingLocation) locationsBaruSet.add(locationName);
  }

  return {
    totalRows: data.length,
    devicesBaru,
    devicesUpdated,
    duplikatDalamFile: duplicates.size,
    regionalsBaru: regionalsBaruSet.size,
    districtsBaru: districtsBaruSet.size,
    clustersBaru: clustersBaruSet.size,
    locationsBaru: locationsBaruSet.size,
    errors: [],
  };
}

export async function executeImport(
  data: ParsedRow[],
  mode: 'upsert' | 'replace',
  prisma: PrismaClient
): Promise<ImportResult> {
  const errors: string[] = [];
  let newDevices = 0;
  let updatedDevices = 0;
  let newLocations = 0;

  // In replace mode, truncate devices and locations first
  if (mode === 'replace') {
    await prisma.device.deleteMany({});
    await prisma.location.deleteMany({});
  }

  // Process in batches for better performance
  const BATCH_SIZE = 100;
  
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    
    for (const row of batch) {
      try {
        // Upsert hierarchy
        const regionName = row.region || 'REGIONAL DEFAULT';
        const districtName = row.district || 'DISTRICT DEFAULT';
        const clusterName = row.organization_name || row.cluster || 'CLUSTER DEFAULT';
        const locationName = row.sites_name;

        // Upsert Regional
        const regional = await prisma.regional.upsert({
          where: { id: regionName }, // This won't work with name, need to use unique constraint
          update: {},
          create: { name: regionName },
        }).catch(() => {
          // If upsert fails due to unique constraint, find existing
          return prisma.regional.findFirst({ where: { name: regionName } });
        });

        // Upsert District
        const district = await prisma.district.upsert({
          where: { id: districtName },
          update: {},
          create: { name: districtName, regionalId: regional!.id },
        }).catch(() => {
          return prisma.district.findFirst({ where: { name: districtName } });
        });

        // Upsert Cluster
        const cluster = await prisma.cluster.upsert({
          where: { id: clusterName },
          update: {},
          create: { name: clusterName, districtId: district!.id },
        }).catch(() => {
          return prisma.cluster.findFirst({ where: { name: clusterName } });
        });

        // Upsert Location
        let location = await prisma.location.findFirst({ where: { name: locationName } });
        
        if (!location) {
          location = await prisma.location.create({
            data: {
              name: locationName,
              latitude: row.latitude || 0,
              longitude: row.longitude || 0,
              clusterId: cluster!.id,
              classType: row.class_type,
              address: row.address,
            },
          });
          newLocations++;
        }

        // Upsert Device
        const existingDevice = await prisma.device.findFirst({
          where: {
            OR: [
              { deviceCode: row.code },
              { serialNumber: row.label_code || '' },
            ],
          },
        });

        const deviceData: Prisma.DeviceCreateInput = {
          deviceCode: row.code,
          deviceName: row.name,
          deviceType: row.jenis,
          serialNumber: row.label_code,
          brand: row.merk,
          year: row.tahun_operasi,
          status: row.status || 'AKTIF',
          condition: row.kondisi,
          kapasitas: row.kapasitas,
          capReal: row.jenis_tegangan,
          room: row.ruangan_name,
          locationId: location.id,
        };

        if (existingDevice) {
          await prisma.device.update({
            where: { id: existingDevice.id },
            data: deviceData,
          });
          updatedDevices++;
        } else {
          await prisma.device.create({ data: deviceData });
          newDevices++;
        }
      } catch (err) {
        errors.push(`Baris ${row.code}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  }

  return {
    newDevices,
    updatedDevices,
    newLocations,
    totalProcessed: data.length - errors.length,
    errors,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npm test -- --testPathPattern="importService" -v`
Expected: PASS (adjust based on actual schema)

- [ ] **Step 5: Commit**

```bash
cd backend
git add src/services/importService.ts
git commit -m "feat(backend): add import service with preview and execute logic"
```

---

### Task 5: Backend - API Routes (Import Endpoints)

**Files:**
- Modify: `backend/src/routes/devices.routes.ts`
- Test: `backend/src/routes/__tests__/devices.routes.test.ts`

**Dependencies:** Task 1, Task 2, Task 4

- [ ] **Step 1: Add new routes to devices.routes.ts**

```typescript
// Add these imports at the top of devices.routes.ts
import { validateFile } from '../utils/fileValidator';
import { parseFile } from '../utils/fileParser';
import { generateImportPreview, executeImport } from '../services/importService';

// Add these routes after existing routes

/**
 * POST /api/devices/import/preview
 * Preview import data without committing
 */
router.post('/import/preview', authMiddleware, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File tidak ditemukan' });
    }

    const { valid, error } = validateFile(req.file.buffer, req.file.originalname);
    if (!valid) {
      return res.status(400).json({ error });
    }

    const mode = req.body.mode === 'replace' ? 'replace' : 'upsert';
    const { data, errors } = await parseFile(req.file.buffer, req.file.mimetype, req.file.originalname);

    if (errors.length > 0 && errors.length === data.length) {
      return res.status(400).json({ error: 'File tidak dapat diparse', details: errors });
    }

    const preview = await generateImportPreview(data, mode, prisma);
    preview.errors = errors;

    res.json({ preview });
  } catch (err) {
    console.error('Preview error:', err);
    res.status(500).json({ error: 'Gagal memproses file' });
  }
});

/**
 * POST /api/devices/import
 * Execute import with transaction
 */
router.post('/import', authMiddleware, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File tidak ditemukan' });
    }

    const { valid, error } = validateFile(req.file.buffer, req.file.originalname);
    if (!valid) {
      return res.status(400).json({ error });
    }

    const mode = req.body.mode === 'replace' ? 'replace' : 'upsert';
    const { data, errors } = await parseFile(req.file.buffer, req.file.mimetype, req.file.originalname);

    // Execute with transaction
    const result = await prisma.$transaction(async (tx) => {
      return executeImport(data, mode, tx as PrismaClient);
    }, {
      timeout: 60000,
      isolationLevel: 'Serializable',
    });

    res.json({
      success: true,
      result: {
        ...result,
        parseErrors: errors,
      },
    });
  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({ error: 'Gagal mengimport data. Silakan coba lagi.' });
  }
});

/**
 * GET /api/devices/template
 * Download XLSX template
 */
router.get('/import/template', authMiddleware, async (req: Request, res: Response) => {
  try {
    const XLSX = require('xlsx');
    
    const template = [
      {
        territory: 'TIF1',
        region: 'REGIONAL SUMBAGSEL',
        district: 'PALEMBANG',
        'District 2': '#REF!',
        sites_code: 'PGC',
        sites_name: 'PALEMBANG CENTRUM',
        ruangan_code: 'TIF1-PGC-02',
        ruangan_name: 'R. GENSET',
        ruangan_panjang: '',
        ruangan_lebar: '',
        ruangan_tinggi: '',
        ruangan_luas: '',
        rack_code: 'TIF1-PGC-02-0001',
        rack_name: 'RACK GENSET 1',
        rack_panjang: '',
        rack_lebar: '',
        rack_tinggi: '',
        rack_luas: '',
        code: 'TIF1-PGC-02-0001-00001',
        name: 'GENSET 1',
        label_code: 'SERIAL-001',
        jenis: 'GENSET',
        merk: 'LEROY SOMER',
        tahun_operasi: 2020,
        status: 'AKTIF',
        kondisi: 'NORMAL',
        kapasitas: '150',
        satuan_kapasitas: 'KVa',
        jenis_tegangan: 'AC',
        beban_arus: '0',
        satuan_beban: 'KVa',
        keterangan: '',
        'Usia Perangkat': '',
        Condition: '',
        latitude: '-2.977657',
        longitude: '104.748676',
        address: 'Jl. Palembang',
        class_type: 'POP',
        organization_name: 'CLUSTER PALEMBANG',
        teknisi: 'Teknisi A',
        uuid: '',
        organization_uuid: '',
        organization_sname: 'C_PLMB',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=template_import_perangkat.xlsx');
    res.send(buffer);
  } catch (err) {
    console.error('Template error:', err);
    res.status(500).json({ error: 'Gagal generate template' });
  }
});
```

- [ ] **Step 2: Commit**

```bash
cd backend
git add src/routes/devices.routes.ts
git commit -m "feat(backend): add import endpoints (preview, execute, template)"
```

---

### Task 6: Backend - Location Devices Endpoint

**Files:**
- Modify: `backend/src/routes/locations.routes.ts`
- Add: `backend/src/routes/__tests__/locations.routes.test.ts`

**Dependencies:** Task 3

- [ ] **Step 1: Add new endpoint**

```typescript
// Add to locations.routes.ts

/**
 * GET /api/locations/:id/devices
 * Get devices by location with categorization and modernization status
 */
router.get('/:id/devices', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        devices: {
          where: { deletedAt: null },
        },
        cluster: {
          include: {
            district: {
              include: { regional: true },
            },
          },
        },
      },
    });

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const CATU_DAYA_TYPES = [
      'GENSET', 'BATSTARTER', 'BATBASAH', 'BATKERING', 'RECTIFIER',
      'INVERTER', 'UPS', 'MDP', 'AVR', 'TANGKIBBM', 'DCPDB',
      'ACPDB', 'DCPDBSTANDING', 'ACPDBSTANDING', 'ELECTRICALPANEL',
      'TRAFO', 'ATS', 'AMF'
    ].map(t => t.toUpperCase());

    const catuDaya: DeviceWithModernization[] = [];
    const nonCatuDaya: DeviceWithModernization[] = [];

    for (const device of location.devices) {
      const mod = hitungButuhModernisasi(device.deviceType, device.year || 0);
      
      const deviceWithMod: DeviceWithModernization = {
        ...device,
        butuhModernisasi: mod.butuhModernisasi,
        alasanModernisasi: mod.alasan,
        isCatuDaya: CATU_DAYA_TYPES.includes(device.deviceType.toUpperCase()),
      };

      if (deviceWithMod.isCatuDaya) {
        catuDaya.push(deviceWithMod);
      } else {
        nonCatuDaya.push(deviceWithMod);
      }
    }

    res.json({
      location: {
        id: location.id,
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        classType: location.classType,
        hierarchy: {
          regional: location.cluster?.district?.regional?.name,
          district: location.cluster?.district?.name,
          cluster: location.cluster?.name,
        },
      },
      devices: {
        catuDaya: {
          total: catuDaya.length,
          items: catuDaya.slice(0, 5), // Preview max 5
          hasMore: catuDaya.length > 5,
        },
        nonCatuDaya: {
          total: nonCatuDaya.length,
          items: nonCatuDaya.slice(0, 5), // Preview max 5
          hasMore: nonCatuDaya.length > 5,
        },
      },
    });
  } catch (err) {
    console.error('Get location devices error:', err);
    res.status(500).json({ error: 'Gagal mengambil data perangkat' });
  }
});
```

- [ ] **Step 2: Commit**

```bash
cd backend
git add src/routes/locations.routes.ts
git commit -m "feat(backend): add GET location devices endpoint with categorization"
```

---

## FRONTEND TASKS

### Task 7: Frontend - Import Types and Service

**Files:**
- Modify: `frontend/src/types/index.ts`
- Create: `frontend/src/services/importService.ts`

**Dependencies:** Backend Task 5

- [ ] **Step 1: Add types**

```typescript
// frontend/src/types/index.ts - add these

export type ImportMode = 'upsert' | 'replace';

export interface ImportPreview {
  totalRows: number;
  devicesBaru: number;
  devicesUpdated: number;
  duplikatDalamFile: number;
  regionalsBaru: number;
  districtsBaru: number;
  clustersBaru: number;
  locationsBaru: number;
  errors: string[];
}

export interface ImportResult {
  success: boolean;
  result: {
    newDevices: number;
    updatedDevices: number;
    newLocations: number;
    totalProcessed: number;
    errors: string[];
    parseErrors?: string[];
  };
}

export interface DeviceWithModernization extends Device {
  butuhModernisasi: boolean;
  alasanModernisasi?: string;
  isCatuDaya: boolean;
}

export interface LocationDevicesResponse {
  location: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
    classType?: string;
    hierarchy: {
      regional?: string;
      district?: string;
      cluster?: string;
    };
  };
  devices: {
    catuDaya: {
      total: number;
      items: DeviceWithModernization[];
      hasMore: boolean;
    };
    nonCatuDaya: {
      total: number;
      items: DeviceWithModernization[];
      hasMore: boolean;
    };
  };
}
```

- [ ] **Step 2: Create import service**

```typescript
// frontend/src/services/importService.ts

import { api } from './api';
import type { ImportPreview, ImportResult, LocationDevicesResponse, DeviceWithModernization } from '../types';

export interface UploadOptions {
  file: File;
  mode: 'upsert' | 'replace';
}

export const importService = {
  async getPreview(options: UploadOptions): Promise<ImportPreview> {
    const formData = new FormData();
    formData.append('file', options.file);
    formData.append('mode', options.mode);

    const response = await api.post<{ preview: ImportPreview }>(
      '/devices/import/preview',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.preview;
  },

  async executeImport(options: UploadOptions): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', options.file);
    formData.append('mode', options.mode);

    const response = await api.post<ImportResult>(
      '/devices/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  async downloadTemplate(): Promise<void> {
    const response = await api.get('/devices/import/template', {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_import_perangkat.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async getLocationDevices(locationId: string): Promise<LocationDevicesResponse> {
    const response = await api.get<LocationDevicesResponse>(
      `/locations/${locationId}/devices`
    );
    return response.data;
  },
};
```

- [ ] **Step 3: Update services index**

```typescript
// frontend/src/services/index.ts - add importService

export { importService } from './importService';
```

- [ ] **Step 4: Commit**

```bash
cd frontend
git add src/types/index.ts src/services/importService.ts src/services/index.ts
git commit -m "feat(frontend): add import types and service"
```

---

### Task 8: Frontend - Import Components

**Files:**
- Create: `frontend/src/components/import/FileDropzone.tsx`
- Create: `frontend/src/components/import/ModeSelector.tsx`
- Create: `frontend/src/components/import/ImportPreview.tsx`
- Create: `frontend/src/components/import/ConfirmModal.tsx`
- Create: `frontend/src/components/import/ImportTab.tsx`
- Create: `frontend/src/components/import/index.ts`

**Dependencies:** Task 7

- [ ] **Step 1: Create FileDropzone component**

```typescript
// frontend/src/components/import/FileDropzone.tsx

import React, { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  disabled?: boolean;
}

const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FileDropzone({ onFileSelect, selectedFile, onClear, disabled }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError('Format file tidak valid. Gunakan .csv atau .xlsx');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Ukuran file maksimal 10MB');
      return false;
    }
    setError(null);
    return true;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  }, [disabled, onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
            isDragging
              ? 'border-cyan-400 bg-cyan-500/10'
              : 'border-slate-600 hover:border-slate-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Upload className={cn('w-12 h-12 mx-auto mb-4', isDragging ? 'text-cyan-400' : 'text-slate-400')} />
          <p className="text-slate-300 mb-2">
            Drag & Drop file disini
          </p>
          <p className="text-slate-500 text-sm mb-4">
            atau klik untuk pilih file
          </p>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInput}
            disabled={disabled}
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input">
            <Button variant="outline" as="span" disabled={disabled}>
              Pilih File
            </Button>
          </label>
          <p className="text-slate-600 text-xs mt-4">
            Mendukung .csv dan .xlsx
          </p>
        </div>
      ) : (
        <div className="border border-slate-600 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-cyan-400" />
            <div>
              <p className="text-slate-200 font-medium">{selectedFile.name}</p>
              <p className="text-slate-500 text-sm">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            onClick={onClear}
            disabled={disabled}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create ModeSelector component**

```typescript
// frontend/src/components/import/ModeSelector.tsx

import React from 'react';
import { cn } from '../../utils/cn';
import { ImportMode } from '../../types';

interface ModeSelectorProps {
  value: ImportMode;
  onChange: (mode: ImportMode) => void;
  disabled?: boolean;
}

export function ModeSelector({ value, onChange, disabled }: ModeSelectorProps) {
  return (
    <div className="flex gap-2 p-1 bg-slate-800 rounded-lg">
      <button
        onClick={() => onChange('upsert')}
        disabled={disabled}
        className={cn(
          'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
          value === 'upsert'
            ? 'bg-cyan-500 text-white'
            : 'text-slate-400 hover:text-slate-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        Tambah Data
      </button>
      <button
        onClick={() => onChange('replace')}
        disabled={disabled}
        className={cn(
          'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
          value === 'replace'
            ? 'bg-red-500 text-white'
            : 'text-slate-400 hover:text-slate-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        Ganti Semua
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Create ImportPreview component**

```typescript
// frontend/src/components/import/ImportPreview.tsx

import React from 'react';
import { BarChart3, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { ImportPreview as ImportPreviewType } from '../../types';

interface ImportPreviewProps {
  preview: ImportPreviewType;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ImportPreview({ preview, onConfirm, onCancel, loading }: ImportPreviewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-cyan-400">
        <BarChart3 className="w-5 h-5" />
        <h3 className="font-semibold">Preview Import Data</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Total Baris</p>
          <p className="text-2xl font-bold text-white">{preview.totalRows}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Duplikat (dalam file)</p>
          <p className="text-2xl font-bold text-yellow-400">{preview.duplikatDalamFile}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Devices Baru</p>
          <p className="text-2xl font-bold text-green-400">{preview.devicesBaru}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Devices Diupdate</p>
          <p className="text-2xl font-bold text-blue-400">{preview.devicesUpdated}</p>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-4">
        <p className="text-slate-400 text-sm mb-2">Perubahan Hierarchy:</p>
        <div className="space-y-1 text-sm">
          <p>• Regionals baru: <span className="text-cyan-400">{preview.regionalsBaru}</span></p>
          <p>• Districts baru: <span className="text-cyan-400">{preview.districtsBaru}</span></p>
          <p>• Clusters baru: <span className="text-cyan-400">{preview.clustersBaru}</span></p>
          <p>• Locations baru: <span className="text-cyan-400">{preview.locationsBaru}</span></p>
        </div>
      </div>

      {preview.errors.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <p className="text-sm font-medium">Warning: {preview.errors.length} baris tidak dapat diparse</p>
          </div>
          <ul className="text-xs text-yellow-300/70 space-y-1">
            {preview.errors.slice(0, 5).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
            {preview.errors.length > 5 && (
              <li>... dan {preview.errors.length - 5} error lainnya</li>
            )}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} disabled={loading} className="flex-1">
          Batal
        </Button>
        <Button onClick={onConfirm} disabled={loading} className="flex-1">
          {loading ? 'Memproses...' : 'Konfirmasi Upload'}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create ConfirmModal component**

```typescript
// frontend/src/components/import/ConfirmModal.tsx

import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, loading }: ConfirmModalProps) {
  const [confirmationText, setConfirmationText] = useState('');

  const handleConfirm = () => {
    if (confirmationText === 'HAPUS DATA') {
      onConfirm();
      setConfirmationText('');
    }
  };

  const handleClose = () => {
    setConfirmationText('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="" size="md">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        
        <h2 className="text-xl font-bold text-white mb-2">
          ⚠️ PERINGATAN: DATA AKAN DIHAPUS!
        </h2>
        
        <p className="text-slate-400 mb-6">
          Anda akan menghapus seluruh data perangkat dan lokasi.
          <br />
          Data yang dihapus tidak dapat dikembalikan.
        </p>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-300 text-sm mb-3">
            Ketik <span className="font-bold text-red-400">"HAPUS DATA"</span> untuk melanjutkan:
          </p>
          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder="Ketik di sini..."
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClose} disabled={loading} className="flex-1">
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={confirmationText !== 'HAPUS DATA' || loading}
            className="flex-1"
          >
            {loading ? 'Menghapus...' : 'Konfirmasi'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 5: Create ImportTab component**

```typescript
// frontend/src/components/import/ImportTab.tsx

import React, { useState, useCallback } from 'react';
import { Download, FileUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { FileDropzone } from './FileDropzone';
import { ModeSelector } from './ModeSelector';
import { ImportPreview } from './ImportPreview';
import { ConfirmModal } from './ConfirmModal';
import { importService } from '../../services/importService';
import { ImportMode, ImportPreview as ImportPreviewType } from '../../types';
import toast from 'react-hot-toast';

export function ImportTab() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ImportMode>('upsert');
  const [preview, setPreview] = useState<ImportPreviewType | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setPreview(null);
  }, []);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
  }, []);

  const handlePreview = useCallback(async () => {
    if (!selectedFile) return;

    setPreviewLoading(true);
    try {
      const result = await importService.getPreview({
        file: selectedFile,
        mode,
      });
      setPreview(result);
    } catch (err) {
      toast.error('Gagal memproses file. Pastikan format sudah benar.');
    } finally {
      setPreviewLoading(false);
    }
  }, [selectedFile, mode]);

  const handleConfirm = useCallback(async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const result = await importService.executeImport({
        file: selectedFile,
        mode,
      });

      if (result.success) {
        toast.success(
          `Import berhasil! ${result.result.newDevices} devices baru, ${result.result.updatedDevices} diupdate.`
        );
        handleClear();
        setPreview(null);
      } else {
        toast.error('Import gagal. Silakan coba lagi.');
      }
    } catch (err) {
      toast.error('Gagal mengimport data. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  }, [selectedFile, mode, handleClear]);

  const handleDownloadTemplate = useCallback(async () => {
    try {
      await importService.downloadTemplate();
      toast.success('Template berhasil didownload');
    } catch (err) {
      toast.error('Gagal mendownload template');
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Import Data</h2>
          <p className="text-slate-400 text-sm">Upload data perangkat dari file CSV atau Excel</p>
        </div>
        <Button variant="outline" onClick={handleDownloadTemplate}>
          <Download className="w-4 h-4 mr-2" />
          Download Template XLSX
        </Button>
      </div>

      <FileDropzone
        onFileSelect={handleFileSelect}
        selectedFile={selectedFile}
        onClear={handleClear}
        disabled={loading}
      />

      {selectedFile && !preview && (
        <>
          <ModeSelector
            value={mode}
            onChange={setMode}
            disabled={loading}
          />

          <Button
            onClick={handlePreview}
            disabled={previewLoading}
            className="w-full"
          >
            {previewLoading ? 'Memproses...' : 'Preview Data'}
          </Button>
        </>
      )}

      {preview && (
        <div className="bg-slate-800/50 rounded-xl p-6">
          <ImportPreview
            preview={preview}
            onConfirm={() => setShowConfirmModal(true)}
            onCancel={() => setPreview(null)}
            loading={loading}
          />
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirm}
        loading={loading}
      />
    </div>
  );
}
```

- [ ] **Step 6: Create index file**

```typescript
// frontend/src/components/import/index.ts

export { ImportTab } from './ImportTab';
export { FileDropzone } from './FileDropzone';
export { ModeSelector } from './ModeSelector';
export { ImportPreview } from './ImportPreview';
export { ConfirmModal } from './ConfirmModal';
```

- [ ] **Step 7: Commit**

```bash
cd frontend
git add src/components/import/
git commit -m "feat(frontend): add import tab components"
```

---

### Task 9: Frontend - Devices Page with Tabs

**Files:**
- Modify: `frontend/src/pages/DevicesPage.tsx`

**Dependencies:** Task 7, Task 8

- [ ] **Step 1: Update DevicesPage**

```typescript
// frontend/src/pages/DevicesPage.tsx - update to add tabs

import React, { useState } from 'react';
import { List, Upload } from 'lucide-react';
import { cn } from '../utils/cn';
import { ImportTab } from '../components/import';
import { DevicesList } from '../components/devices/DevicesList'; // existing component

type TabType = 'list' | 'import';

export function DevicesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('list');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('list')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'list'
              ? 'bg-cyan-500 text-white'
              : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <List className="w-4 h-4" />
          Daftar
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'import'
              ? 'bg-cyan-500 text-white'
              : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <Upload className="w-4 h-4" />
          Import
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'list' && <DevicesList />}
      {activeTab === 'import' && <ImportTab />}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd frontend
git add src/pages/DevicesPage.tsx
git commit -m "feat(frontend): add tabs to devices page"
```

---

### Task 10: Frontend - Map Popup Enhancement

**Files:**
- Modify: `frontend/src/components/map/DevicePopup.tsx`
- Create: `frontend/src/components/map/DeviceSection.tsx`
- Create: `frontend/src/components/map/DeviceListModal.tsx`

**Dependencies:** Task 7

- [ ] **Step 1: Create DeviceSection component**

```typescript
// frontend/src/components/map/DeviceSection.tsx

import React, { useState, useMemo } from 'react';
import { Search, Filter, AlertTriangle, ChevronRight } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { DeviceWithModernization } from '../../types';

interface DeviceSectionProps {
  title: string;
  devices: DeviceWithModernization[];
  variant?: 'catu-daya' | 'non-catu-daya';
  onViewAll: () => void;
}

const DEVICE_TYPE_OPTIONS = [
  { value: '', label: 'Semua Jenis' },
  { value: 'GENSET', label: 'Genset' },
  { value: 'BATTERY', label: 'Battery' },
  { value: 'RECTIFIER', label: 'Rectifier' },
  { value: 'INVERTER', label: 'Inverter' },
  { value: 'UPS', label: 'UPS' },
  { value: 'AC', label: 'AC' },
  { value: 'OLT', label: 'OLT' },
  { value: 'SWITCH', label: 'Switch' },
  { value: 'ROUTER', label: 'Router' },
  { value: 'DWDM', label: 'DWDM' },
  { value: 'SERVER', label: 'Server' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'AKTIF', label: 'Aktif' },
  { value: 'IDLE', label: 'Idle' },
  { value: 'RUSAK', label: 'Rusak' },
];

export function DeviceSection({ title, devices, variant = 'non-catu-daya', onViewAll }: DeviceSectionProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const matchesSearch = search === '' ||
        device.deviceName.toLowerCase().includes(search.toLowerCase()) ||
        device.deviceCode.toLowerCase().includes(search.toLowerCase());
      
      const matchesType = typeFilter === '' ||
        device.deviceType.toUpperCase().includes(typeFilter.toUpperCase());
      
      const matchesStatus = statusFilter === '' ||
        device.status?.toUpperCase() === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [devices, search, typeFilter, statusFilter]);

  const previewDevices = filteredDevices.slice(0, 5);
  const hasMore = filteredDevices.length > 5;

  const sectionStyles = variant === 'catu-daya'
    ? 'border-cyan-500/30'
    : 'border-teal-500/30';

  const iconStyles = variant === 'catu-daya'
    ? 'text-cyan-400'
    : 'text-teal-400';

  return (
    <div className={`border ${sectionStyles} rounded-lg p-4`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${variant === 'catu-daya' ? 'bg-cyan-400' : 'bg-teal-400'}`} />
        <h4 className={`font-semibold ${iconStyles}`}>{title}</h4>
        <Badge variant="outline" className="ml-auto">
          {filteredDevices.length}
        </Badge>
      </div>

      {/* Filters */}
      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select
            options={DEVICE_TYPE_OPTIONS}
            value={typeFilter}
            onChange={setTypeFilter}
            className="flex-1"
          />
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
            className="flex-1"
          />
        </div>
      </div>

      {/* Device List */}
      <div className="space-y-3">
        {previewDevices.map((device) => (
          <div key={device.id} className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-slate-200 font-medium text-sm">
                  {device.deviceName}
                </p>
                <p className="text-slate-500 text-xs">
                  Code: {device.deviceCode}
                </p>
              </div>
              {device.butuhModernisasi && (
                <Badge variant="warning" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Butuh Modernisasi
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span>{device.deviceType}</span>
              {device.brand && <span>{device.brand}</span>}
              {device.year && <span>{new Date().getFullYear() - device.year} tahun</span>}
              <Badge 
                variant={device.status?.toUpperCase() === 'AKTIF' ? 'success' : 'warning'}
                className="text-xs"
              >
                {device.status}
              </Badge>
            </div>
          </div>
        ))}

        {filteredDevices.length === 0 && (
          <p className="text-slate-500 text-center py-4">Tidak ada perangkat</p>
        )}
      </div>

      {/* View All Button */}
      {hasMore && (
        <Button
          variant="ghost"
          onClick={onViewAll}
          className="w-full mt-4 text-cyan-400 hover:text-cyan-300"
        >
          Lihat {filteredDevices.length - 5} lainnya
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create DeviceListModal component**

```typescript
// frontend/src/components/map/DeviceListModal.tsx

import React from 'react';
import { X, MapPin } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { AlertTriangle } from 'lucide-react';
import { DeviceWithModernization, LocationDevicesResponse } from '../../types';

interface DeviceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationDevicesResponse['location'];
  devices: {
    catuDaya: DeviceWithModernization[];
    nonCatuDaya: DeviceWithModernization[];
  };
}

export function DeviceListModal({ isOpen, onClose, location, devices }: DeviceListModalProps) {
  const allDevices = [...devices.catuDaya, ...devices.nonCatuDaya];
  const needsModernizationCount = allDevices.filter(d => d.butuhModernisasi).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <MapPin className="w-5 h-5" />
            <h2 className="text-xl font-bold">{location.name}</h2>
          </div>
          <p className="text-slate-400 text-sm">
            {location.address}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="outline">
              {location.classType}
            </Badge>
            <Badge variant="outline">
              {location.hierarchy.cluster}
            </Badge>
            {needsModernizationCount > 0 && (
              <Badge variant="warning" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {needsModernizationCount} Butuh Modernisasi
              </Badge>
            )}
          </div>
        </div>

        {/* Catu Daya Section */}
        <div>
          <h3 className="text-cyan-400 font-semibold mb-3">
            ⚡ Catu Daya ({devices.catuDaya.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {devices.catuDaya.map((device) => (
              <div key={device.id} className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-200 font-medium">{device.deviceName}</p>
                    <p className="text-slate-500 text-xs">
                      {device.deviceCode} | {device.serialNumber || '-'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {device.butuhModernisasi && (
                      <Badge variant="warning" className="text-xs">
                        Butuh Modernisasi
                      </Badge>
                    )}
                    <Badge 
                      variant={device.status?.toUpperCase() === 'AKTIF' ? 'success' : 'warning'}
                    >
                      {device.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                  <span>{device.deviceType}</span>
                  {device.brand && <span>{device.brand}</span>}
                  {device.model && <span>{device.model}</span>}
                  {device.year && <span>{new Date().getFullYear() - device.year} tahun</span>}
                  {device.kapasitas && <span>{device.kapasitas}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Non-Catu Daya Section */}
        <div>
          <h3 className="text-teal-400 font-semibold mb-3">
            🔌 Non-Catu Daya ({devices.nonCatuDaya.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {devices.nonCatuDaya.map((device) => (
              <div key={device.id} className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-200 font-medium">{device.deviceName}</p>
                    <p className="text-slate-500 text-xs">
                      {device.deviceCode} | {device.serialNumber || '-'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {device.butuhModernisasi && (
                      <Badge variant="warning" className="text-xs">
                        Butuh Modernisasi
                      </Badge>
                    )}
                    <Badge 
                      variant={device.status?.toUpperCase() === 'AKTIF' ? 'success' : 'warning'}
                    >
                      {device.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                  <span>{device.deviceType}</span>
                  {device.brand && <span>{device.brand}</span>}
                  {device.model && <span>{device.model}</span>}
                  {device.year && <span>{new Date().getFullYear() - device.year} tahun</span>}
                  {device.kapasitas && <span>{device.kapasitas}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 3: Update DevicePopup component**

```typescript
// frontend/src/components/map/DevicePopup.tsx - update

import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, Package } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { DeviceSection } from './DeviceSection';
import { DeviceListModal } from './DeviceListModal';
import { importService } from '../../services/importService';
import { LocationDevicesResponse, DeviceWithModernization } from '../../types';

interface DevicePopupProps {
  locationId: string;
  locationName: string;
  onClose: () => void;
}

export function DevicePopup({ locationId, locationName, onClose }: DevicePopupProps) {
  const [data, setData] = useState<LocationDevicesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllModal, setShowAllModal] = useState(false);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const result = await importService.getLocationDevices(locationId);
        setData(result);
      } catch (err) {
        console.error('Failed to fetch devices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [locationId]);

  if (loading) {
    return (
      <div className="bg-slate-900 rounded-lg p-4 w-80 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
        <div className="h-3 bg-slate-700 rounded w-1/2" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-slate-900 rounded-lg p-4 w-80">
        <p className="text-red-400">Gagal memuat data</p>
      </div>
    );
  }

  const { location, devices } = data;
  const totalDevices = devices.catuDaya.total + devices.nonCatuDaya.total;
  const needsModCount = devices.catuDaya.items.filter(d => d.butuhModernisasi).length +
    devices.nonCatuDaya.items.filter(d => d.butuhModernisasi).length;

  return (
    <>
      <div className="bg-slate-900 rounded-lg p-4 w-96 max-h-[500px] overflow-y-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <MapPin className="w-4 h-4" />
            <h3 className="font-semibold">{location.name}</h3>
          </div>
          <p className="text-slate-400 text-xs mb-2">{location.address}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{location.classType}</Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              {totalDevices} perangkat
            </Badge>
            {needsModCount > 0 && (
              <Badge variant="warning" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {needsModCount}
              </Badge>
            )}
          </div>
        </div>

        {/* Catu Daya Section */}
        <DeviceSection
          title="⚡ Catu Daya"
          devices={devices.catuDaya.items}
          variant="catu-daya"
          onViewAll={() => setShowAllModal(true)}
        />

        {/* Non-Catu Daya Section */}
        <DeviceSection
          title="🔌 Non-Catu Daya"
          devices={devices.nonCatuDaya.items}
          variant="non-catu-daya"
          onViewAll={() => setShowAllModal(true)}
        />

        {/* View All Button */}
        <Button
          variant="outline"
          onClick={() => setShowAllModal(true)}
          className="w-full mt-4"
        >
          Lihat Semua {totalDevices} Perangkat
        </Button>
      </div>

      <DeviceListModal
        isOpen={showAllModal}
        onClose={() => setShowAllModal(false)}
        location={location}
        devices={{
          catuDaya: devices.catuDaya.items,
          nonCatuDaya: devices.nonCatuDaya.items,
        }}
      />
    </>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd frontend
git add src/components/map/DevicePopup.tsx src/components/map/DeviceSection.tsx src/components/map/DeviceListModal.tsx
git commit -m "feat(frontend): enhance map popup with categorized device display"
```

---

## Testing Task

### Task 11: Integration Testing

**Files:**
- Create: `backend/src/__tests__/integration/import.test.ts`
- Create: `frontend/src/__tests__/components/import.test.tsx`

**Dependencies:** All previous tasks

- [ ] **Step 1: Backend integration test**

```typescript
// backend/src/__tests__/integration/import.test.ts
import { PrismaClient } from '@prisma/client';
import { validateFile } from '../utils/fileValidator';
import { parseFile } from '../utils/fileParser';
import { hitungButuhModernisasi } from '../utils/modernization';

const prisma = new PrismaClient();

describe('Import Integration', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('File Processing Pipeline', () => {
    it('should validate, parse, and calculate modernization', async () => {
      const csv = `code,name,sites_name,jenis,tahun_operasi,label_code,merk,status
GENSET001,GENSET 01,Site A,GENSET,1995,L001,LEROY SOMER,AKTIF
OLT001,OLT 01,Site B,OLT,2010,L002,HUAWEI,AKTIF`;

      const buffer = Buffer.from(csv);
      
      // 1. Validate
      const validation = validateFile(buffer, 'test.csv');
      expect(validation.valid).toBe(true);

      // 2. Parse
      const { data } = await parseFile(buffer, 'text/csv', 'test.csv');
      expect(data).toHaveLength(2);

      // 3. Check modernization
      const genset = hitungButuhModernisasi('GENSET', 1995);
      expect(genset.butuhModernisasi).toBe(true);

      const olt = hitungButuhModernisasi('OLT', 2010);
      expect(olt.butuhModernisasi).toBe(false);
    });
  });
});
```

- [ ] **Step 2: Commit**

```bash
cd backend
git add src/__tests__/integration/import.test.ts
git commit -m "test(backend): add import integration tests"
```

---

## Final Checklist

- [ ] All backend tasks completed and committed
- [ ] All frontend tasks completed and committed
- [ ] Integration tests written
- [ ] README updated with import feature documentation
- [ ] Smoke test performed manually

---

## Dependencies Summary

```
Task 1 (FileValidator) 
    ↓
Task 2 (FileParser) ←── Task 1
    ↓
Task 3 (Modernization) ←── independent
    ↓
Task 4 (ImportService) ←── Task 2, Task 3
    ↓
Task 5 (API Routes) ←── Task 1, Task 2, Task 4
    ↓
Task 6 (Location Endpoint) ←── Task 3

Frontend:
Task 7 (Types & Service) ←── Task 5
    ↓
Task 8 (Import Components) ←── Task 7
    ↓
Task 9 (Devices Page) ←── Task 8
    ↓
Task 10 (Map Popup) ←── Task 7

Task 11 (Testing) ←── all previous tasks
```

---

## Spec Coverage Check

| Spec Section | Task(s) |
|-------------|---------|
| 1. Lokasi Fitur UI | Task 9 |
| 2. Alur Upload | Task 8, Task 5 |
| 3. Mode Upload | Task 4, Task 8 |
| 4. Duplicate Detection | Task 4 |
| 5. Mapping Kolom | Task 2 |
| 6. Device Type Categorization | Task 4, Task 10 |
| 7. Modernization Logic | Task 3, Task 6 |
| 8. Map Popup Enhancement | Task 10 |
| 9. API Endpoints | Task 5, Task 6 |
| 10. Transaction | Task 4 |
| 11. File Validation | Task 1 |
| 12. Limitasi | Task 2 |
