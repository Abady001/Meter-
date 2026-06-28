# RTL Sidebar Discovery Report

## Files Analyzed

| File | Lines | Purpose |
|------|-------|---------|
| `AppShell.tsx` | 1–209 | Layout shell, content margin, page router |
| `AppSidebar.tsx` | 1–516 | Sidebar component (mobile, desktop, collapsed states) |
| `TopNav.tsx` | 1–243 | Top navigation bar |

---

## Findings: Physical Positioning (LTR-hardcoded)

### AppShell.tsx

| Line | Code | Issue |
|------|------|-------|
| 89 | `const contentMarginLeft = ...` | Variable named `...Left` but used as `marginInlineStart` — misleading name only; CSS property already correct ✅ |

### AppSidebar.tsx

| Line | Code | Issue | Severity |
|------|------|-------|----------|
| 258 | `ml-5 pl-4 border-l` | Submenu indent uses physical `margin-left`, `padding-left`, `border-left` | **High** |
| 335–337 | `initial={{ x: -280 }}` / `exit={{ x: -280 }}` | Mobile panel slides leftward in all modes | **High** |
| 339 | `fixed left-0 … border-r` | Desktop-class sidebar fixed to physical left, border on physical right | **High** |
| 362 | `fixed left-0 … border-r` | Same on desktop expanded variant | **High** |
| 406 | `<ChevronRight />` | Collapsed-mode expand icon always points right | **Medium** |
| 465 | `<ChevronLeft />` | Expanded-mode collapse icon always points left | **Medium** |

### TopNav.tsx

| Line | Code | Issue | Severity |
|------|------|-------|----------|
| 66 | `fixed top-0 left-0 right-0` | Header bounding box uses physical `left`/`right` | **Medium** |
| 110 | `left-3` | Search icon positioned from physical left | **Low** |
| 114 | `pl-9` | Search input padding from physical left | **Low** |
| 134 | `-right-0.5` | Notification badge offset from physical right | **Low** |

---

## Logical Property Migration Plan

| Instead Of | Use | Works In |
|------------|-----|----------|
| `left-0` | `inset-inline-start-0` | Tailwind v4 |
| `right-0` | `inset-inline-end-0` | Tailwind v4 |
| `left-3` | `start-3` | Tailwind v4 |
| `-right-0.5` | `-end-0.5` | Tailwind v4 |
| `ml-5` | `ms-5` | Tailwind v4 |
| `pl-4` | `ps-4` | Tailwind v4 |
| `pl-9` | `ps-9` | Tailwind v4 |
| `border-l` | `border-s` | Tailwind v4 |
| `border-r` | `border-e` | Tailwind v4 |
| `x: -280` (Framer) | `x: isRTL ? 280 : -280` | Direction-aware computation |
| `ChevronLeft` / `ChevronRight` | Direction-aware swap via `dir` | Component logic |
