# Previsão Detalhada Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the `Previsão do mês` card into the entry point for a detailed month-forecast dashboard with a compact trigger, a pizza chart first, and a scrollable line-chart section below.

**Architecture:** Keep the current dashboard summary intact and add a separate detail surface that opens from the existing forecast card. The detail surface will reuse the existing forecast data plus real transactions and recurring rules, but it will render a new visual hierarchy: summary header, interactive pie chart, numeric totals, and a scrollable trend line chart. The heavy data work stays in forecast helpers/hooks so the new surface remains mostly presentational.

**Tech Stack:** React, TypeScript, Vite, Recharts, shadcn/ui dialog/drawer primitives, existing Elefin forecast/transaction hooks.

---

### Task 1: Add the forecast detail trigger and shell

**Files:**
- Modify: `src/components/DashboardCarousel.tsx`
- Modify: `src/pages/Index.tsx`
- Modify: `src/components/ForecastMonthCard.tsx`
- Test: `src/test/index-month-navigation.test.tsx`

- [ ] **Step 1: Write the failing test**

Add a test that renders the dashboard slide and verifies the `Previsão do mês` card exposes a clickable trigger that opens a dedicated detail surface.

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DashboardCarousel from '@/components/DashboardCarousel';

describe('DashboardCarousel forecast detail', () => {
  it('opens the forecast detail trigger from the forecast card', () => {
    const onOpenForecastDetail = vi.fn();

    render(
      <DashboardCarousel
        transactions={[]}
        categories={[]}
        projectedItems={[]}
        forecastData={null}
        currentMonthLabel="abril de 2026"
        currentMonthShortLabel="abr/26"
        previousMonthShortLabel="mar/26"
        recurringRules={[]}
        selectedMonth={3}
        selectedYear={2026}
        caixaInicial={0}
        onOpenGeneric={vi.fn()}
        onOpenProjection={vi.fn()}
        onOpenForecastDetail={onOpenForecastDetail}
      />,
    );

    fireEvent.click(screen.getByTestId('forecast-month-detail-trigger'));
    expect(onOpenForecastDetail).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- --run src/test/index-month-navigation.test.tsx`

Expected: fail because `onOpenForecastDetail` and `forecast-month-detail-trigger` do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Add `onOpenForecastDetail` to the dashboard carousel props and wire the `Previsão do mês` card click to that callback. In `Index.tsx`, add a new `forecastDetailOpen` state and a dialog/drawer shell that opens when the trigger is clicked.

```tsx
const [forecastDetailOpen, setForecastDetailOpen] = useState(false);
// ...
<DashboardCarousel onOpenForecastDetail={() => setForecastDetailOpen(true)} />
// ...
<Dialog open={forecastDetailOpen} onOpenChange={setForecastDetailOpen}>
  <DialogContent className="max-h-[90vh] overflow-y-auto border border-[#263731] bg-[linear-gradient(180deg,#111A17,#16211D)] text-[#E6F2EE]">
    <ForecastDetailDashboard ... />
  </DialogContent>
</Dialog>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- --run src/test/index-month-navigation.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/DashboardCarousel.tsx src/pages/Index.tsx src/components/ForecastMonthCard.tsx src/test/index-month-navigation.test.tsx
git commit -m "feat: add forecast detail trigger shell"
```

### Task 2: Build the forecast detail dashboard

**Files:**
- Create: `src/components/forecast/ForecastDetailDashboard.tsx`
- Create: `src/components/forecast/ForecastPieChart.tsx`
- Create: `src/components/forecast/ForecastTrendChart.tsx`
- Modify: `src/lib/forecast.ts`
- Modify: `src/lib/monthFilters.ts`
- Test: `src/test/forecast-detail-dashboard.test.tsx`

- [ ] **Step 1: Write the failing test**

Add a test that asserts the detail dashboard renders the pie summary first, then a line chart section, and that the line chart receives the current day as the analysis start.

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ForecastDetailDashboard from '@/components/forecast/ForecastDetailDashboard';

describe('ForecastDetailDashboard', () => {
  it('renders pie first and line section below it', () => {
    render(<ForecastDetailDashboard analysisDate="2026-04-10" />);

    expect(screen.getByRole('heading', { name: /previsão detalhada do mês/i })).toBeInTheDocument();
    expect(screen.getByTestId('forecast-pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('forecast-line-chart')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- --run src/test/forecast-detail-dashboard.test.tsx`

Expected: fail because the component does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create a detail dashboard component that:
- computes the analysis window from the local date to the end of the month
- reuses the existing forecast helpers plus transactions and recurring rules
- renders a pie chart first, with categories `Essenciais`, `Estilo de Vida`, `Prioridades Financeiras`, and `Sem categoria`
- renders a line chart below with past solid and future dashed styling, current-day marker, and zero baseline
- shows a small automatic reading block based on thresholds

Add helper functions in `src/lib/forecast.ts` for:
```ts
export function getForecastAnalysisWindow(referenceDate: Date) { ... }
export function buildForecastDetailSeries(input: { ... }) { ... }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- --run src/test/forecast-detail-dashboard.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/forecast/ForecastDetailDashboard.tsx src/components/forecast/ForecastPieChart.tsx src/components/forecast/ForecastTrendChart.tsx src/lib/forecast.ts src/lib/monthFilters.ts src/test/forecast-detail-dashboard.test.tsx
git commit -m "feat: add forecast detail dashboard"
```

### Task 3: Connect data flow, accessibility, and month-boundary behavior

**Files:**
- Modify: `src/pages/Index.tsx`
- Modify: `src/components/forecast/ForecastDetailDashboard.tsx`
- Modify: `src/components/forecast/ForecastTrendChart.tsx`
- Modify: `src/components/forecast/ForecastPieChart.tsx`
- Modify: `src/lib/forecast.ts`
- Modify: `src/lib/monthFilters.ts`
- Test: `src/test/forecast-detail-edge-cases.test.tsx`

- [ ] **Step 1: Write the failing test**

Add tests for:
- end-of-month analysis window
- February with recurring rules on days 30/31
- local-time date handling
- cache invalidation at midnight
- ESC closes the drawer/dialog

```tsx
it('closes forecast detail on Escape', () => {
  // render wrapper, open detail, fire keydown Escape, expect closed
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- --run src/test/forecast-detail-edge-cases.test.tsx`

Expected: fail because the edge-case logic is not fully implemented yet.

- [ ] **Step 3: Write minimal implementation**

Implement:
- `analysisDate` pinned to local time only
- `getForecastAnalysisWindow()` that clamps to the current month end
- February handling that skips invalid 30/31 recurrence dates safely
- a midnight invalidation key so the detail view refreshes automatically
- `Dialog`/`Drawer` accessibility: trap focus, ESC closes, and `aria-label` on chart containers

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- --run src/test/forecast-detail-edge-cases.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Index.tsx src/components/forecast/ForecastDetailDashboard.tsx src/components/forecast/ForecastTrendChart.tsx src/components/forecast/ForecastPieChart.tsx src/lib/forecast.ts src/lib/monthFilters.ts src/test/forecast-detail-edge-cases.test.tsx
git commit -m "feat: wire forecast detail edge cases"
```

### Task 4: Final verification

**Files:**
- Modify: none

- [ ] **Step 1: Run the full test sweep**

Run:
```bash
npm.cmd test
npm.cmd run build
```

Expected:
- all forecast and dashboard tests pass
- production build completes successfully

- [ ] **Step 2: Visual check**

Open the dashboard and verify:
- clicking `Previsão do mês` opens the new detail surface
- pizza appears first
- line section appears below after scroll
- current-day recalculation behaves as expected when reopening on a different date

- [ ] **Step 3: Commit final state**

```bash
git add .
git commit -m "feat: forecast detail dashboard"
```
