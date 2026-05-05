# Matrix org chart + drag-to-reclassify

## Context

Today the org chart renders department clusters with seniority hidden in vertical sort order. The user said "there is no clear hierarchy" — accurate, because the dominant visual axis is department, and seniority is just a sort order with no labels. For a sales tool, "who's a Founder vs IC" matters more than "who reports to whom" (data we don't have anyway).

This redesigns the chart as a true matrix: tier rows × department columns. Salespeople can scan one row to see "all Heads across functions" or one column for "everyone in Engineering, top to bottom." Drag-to-reclassify lets users override the LLM's auto-classification when it's wrong.

## Layout

In `src/components/company/org-chart.tsx`, rewrite `buildLayout()`:

- **Rows**: `Founders → Heads → Leads → ICs → Interns`. Tiers with zero people are hidden (no empty rows).
- **Columns**: departments ordered by total headcount desc. `Unclassified` pinned last.
- **Cells**: `(tier, dept)`. Each cell stacks its cards vertically.
- **Row height** = `max(cell heights in that row)` so rows stay as real horizontal bands.
- **Column width** stays at 264px. **Row label rail**: 90px wide on the left. **Column labels**: top header.
- Empty cells render as faint grid lines (gives the matrix its structure).
- All cards: same `CARD_HEIGHT = 130`, same `CARD_GAP = 14` as today.

## Drag-to-reclassify

- React Flow: `nodesDraggable={true}` for person nodes only.
- On `onNodeDragStop`: read drop position, find which `(tier, dept)` cell contains it, snap the card to that cell.
- If unchanged or outside any cell → no-op snap-back.
- Real change: optimistic local update + `PATCH /api/people/[id]` with `{ department, seniority }`. On error, revert and toast.

## API

**New**: `src/app/api/people/[id]/route.ts` with `PATCH`.

- Auth via `getSupabaseAndUser`.
- Body schema (zod): `{ department?: string, seniority?: 'founder'|'head'|'lead'|'ic'|'intern' }`.
- Updates `people` row, returns `{ id, department, seniority }`.

## Files

```
src/components/company/org-chart.tsx          (rewrite layout, add drag)
src/components/company/embedded-org-chart.tsx (wire onDataChanged after drag)
src/app/companies/[id]/page.tsx               (same)
src/app/api/people/[id]/route.ts              (new — PATCH)
```

## YAGNI'd

- Drawer dropdowns for dept/seniority (drag is enough).
- Agent tool for chat-driven restructure (no concrete bulk-rename use case yet).
- Pyramid layout / inferred manager edges.

## Verification

1. Expand Browserbase in `/campaigns/<id>` → matrix renders.
2. Drag IC Engineering card to Lead Engineering cell → snaps, toast, persists across refresh.
3. Drag across departments → both `department` and `seniority` update.
4. Drag outside cells → snaps back, no DB write.
5. Click "Refresh org" → only `department IS NULL` rows get re-classified; manual moves preserved.
6. `pnpm typecheck && pnpm lint` clean.
