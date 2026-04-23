# Aba Previsão Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a third dashboard tab named `Previsão` that reuses the existing forecast card without breaking the authenticated dashboard render.

**Architecture:** Extend the dashboard carousel from 2 views to 3 views, keeping the existing `Real` and `Planejamento` slides intact and inserting `Previsão` as a dedicated slide that renders the existing forecast component. Move the standalone forecast card out of the page body so the forecast appears only through the tab UI and the page stays visually consistent.

**Tech Stack:** React, TypeScript, Vite, Radix UI, Playwright.

---

### Task 1: Extend the dashboard carousel with a Previsão slide

**Files:**
- Modify: `src/components/DashboardCarousel.tsx`

- [ ] **Step 1: Update the carousel view type and tab list**

Keep the existing `projection` and `real` views, add a third `forecast` view, and label it `Previsão` with a short description that explains it is a reading based on the prior month.

- [ ] **Step 2: Render the forecast card inside the carousel**

Render `PreviousMonthForecastCard` in the new `forecast` slide and pass the same `forecastData` and month labels already computed in `Index.tsx`.

- [ ] **Step 3: Keep scroll sync and dots working**

Make sure the horizontal scroll math, selected tab state, and pager dots work with three slides instead of two.

- [ ] **Step 4: Verify the dashboard still mounts**

Run: `npm.cmd run build`

Expected: production build succeeds without JSX or type errors.

### Task 2: Remove the duplicate standalone forecast card from the page

**Files:**
- Modify: `src/pages/Index.tsx`

- [ ] **Step 1: Remove the page-level forecast card render**

Delete the standalone `PreviousMonthForecastCard` block below `DashboardCarousel` so the forecast appears only inside the new `Previsão` tab.

- [ ] **Step 2: Keep the data flow intact**

Do not change how `forecastData` is computed or passed through the page; the carousel will continue receiving it through its existing props.

- [ ] **Step 3: Re-run the build and smoke test**

Run: `npm.cmd run build`

Expected: build passes and the dashboard loads after login without a white screen.

### Task 3: Verify the authenticated flow end to end

**Files:**
- Test: `tests/e2e/page-load.spec.ts`

- [ ] **Step 1: Confirm login still reaches the dashboard**

Use the existing Playwright login helper and assert `dashboard-carousel` is visible.

- [ ] **Step 2: Confirm the forecast tab exists**

Assert `dashboard-tab-forecast` is visible and the forecast slide can be reached.

- [ ] **Step 3: Run the test**

Run: `npx.cmd playwright test tests/e2e/page-load.spec.ts --project=chromium`

Expected: test passes and the dashboard remains stable after reload.
