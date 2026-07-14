# Task Brief: Backend - Soft Delete + Cache Invalidation

## Task
Modify `backend/src/routes/locations.routes.ts` to implement soft delete and cache invalidation for locations.

## Requirements

### Step 1: Edit DELETE endpoint for soft delete
File: `backend/src/routes/locations.routes.ts` lines 301-312

Change hard delete to soft delete by setting `deleted_at` field:

```typescript
// DELETE /api/locations/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.locations.update({
      where: { id: req.params.id },
      data: { deleted_at: new Date() }, // Soft delete
    })
    invalidateLocationsCache()
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting location:', error)
    throw error
  }
})
```

### Step 2: Add invalidateLocationsCache() after POST endpoint success
After line 259 (`res.status(201).json({ location })`), add:
```typescript
invalidateLocationsCache()
```

### Step 3: Add invalidateLocationsCache() after PUT endpoint success
After line 292 (`res.json({ location })`), add:
```typescript
invalidateLocationsCache()
```

### Step 4: Commit
```bash
git add backend/src/routes/locations.routes.ts
git commit -m "fix(locations): add soft delete and cache invalidation"
```

## Interfaces
- Uses existing: `invalidateLocationsCache()` (already defined at line 34-37)
- Prisma client: `prisma` (already imported)

## Report Contract
Write report to: `docs/superpowers/plans/task-1-report.md`
Report: status, commits, test_summary, concerns
