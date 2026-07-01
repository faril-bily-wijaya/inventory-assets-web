# Task 2 Report: Backend - File Parser (CSV/XLSX)

## Status: DONE

## Deliverables

### `backend/src/utils/fileParser.ts`

Created a complete file parser with the following capabilities:

- **CSV parsing** via `papaparse` — header row detected, empty lines skipped, streaming-compatible
- **XLSX parsing** via `xlsx` library — first sheet used, row objects produced via `sheet_to_json`
- **Row limit enforcement** — throws `Error` if rows exceed 10,000 (applies to both CSV and XLSX)
- **Required columns validation** — `code`, `name`, `sites_name`, `jenis`, `tahun_operasi` checked case-insensitively
- **String sanitisation** — all string values trimmed; empty strings become `undefined`
- **tahun_operasi conversion** — parsed as integer; Excel serial dates (integers 60–100,000) are converted to year via UTC epoch math
- **Optional column support** — all 16 optional `ParsedRow` fields are populated from the file
- **Graceful empty-file handling** — returns `{ data: [], errors: [...] }` for empty sheets

**Key design decisions:**
- PapaParse is configured with `skipEmptyLines: true` and `header: true`, so `rows.length` is the data row count (header excluded)
- XLSX is read with `cellDates: false` to prevent the library from auto-converting serial dates to JS `Date` objects (we handle conversion ourselves)
- A case-insensitive header map (`Map<string, string>`) normalises column lookup so `Code`, `CODE`, `code` all map to the canonical key

### `backend/src/utils/__tests__/fileParser.test.ts`

10 tests covering all requirements:

| Test | Result |
|------|--------|
| CSV: parse correctly | PASS |
| CSV: throw for missing required columns | PASS |
| CSV: throw for row limit exceeded | PASS |
| CSV: sanitize string values (trim) | PASS |
| CSV: optional columns (latitude/longitude) | PASS |
| XLSX: parse correctly | PASS |
| XLSX: throw for missing required columns | PASS |
| XLSX: throw for row limit exceeded | PASS |
| XLSX: sanitize string values | PASS |
| Excel serial date → tahun_operasi year (43831 → 2020) | PASS |

**Bugs caught during testing:**
1. `XLSX.utils.sheet_add_csv` does not exist in xlsx 0.18.5 — replaced with `aoa_to_sheet` directly
2. PapaParse with `header: true` excludes the header row from `rows.length`, so the row-limit test needed 10,001 data rows (not 10,001 total lines) to trigger the 10,000 limit

## Test Results

```
Test Files  1 passed (1)
     Tests  10 passed (10)
  Duration  824ms
```

## Files Created

- `D:\project Coding\Inventory-assets-program\backend\src\utils\fileParser.ts`
- `D:\project Coding\Inventory-assets-program\backend\src\utils\__tests__\fileParser.test.ts`
