# Task 11 Brief: Integration Testing

## Task Description

Create integration tests for the complete import pipeline.

## Backend Integration Test

### File: backend/src/__tests__/integration/import.test.ts

Test the complete file processing pipeline:
1. Validate file (fileValidator)
2. Parse file (fileParser)
3. Calculate modernization (modernization utility)

### Test Cases

```typescript
describe('Import Integration', () => {
  describe('File Processing Pipeline', () => {
    it('should validate, parse, and calculate modernization for CSV', async () => {
      // Create CSV buffer
      // Validate → should pass
      // Parse → should return data
      // Check modernization for GENSET → should need modernization (> 25 years)
      // Check modernization for OLT → should not need modernization
    });

    it('should validate, parse, and calculate modernization for XLSX', async () => {
      // Create XLSX buffer
      // Same checks as CSV
    });
  });
});
```

## Requirements

1. Test complete pipeline end-to-end
2. Test both CSV and XLSX formats
3. Test modernization calculation with various device types
4. Test error scenarios

## Dependencies

- Task 1 (fileValidator)
- Task 2 (fileParser)
- Task 3 (modernization)

## Work Directory

D:\project Coding\Inventory-assets-program\backend

## Notes

- This tests the utility layer integration
- Does not require actual database connection
- Mock PrismaClient if needed for service tests
