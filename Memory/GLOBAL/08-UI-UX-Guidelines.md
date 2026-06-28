# Meter Verse — UI/UX Guidelines

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 16 |
| UI Library | React | 19 |
| Styling | Tailwind CSS | v4 |
| Component Library | shadcn/ui | 48 components |
| Icons | lucide-react | Latest |
| State Management | @tanstack/react-query | Latest |
| Auth | next-auth | v4 |
| Animations | framer-motion | Latest |

---

## Design System

### Theme Support
- **Dark/Light mode**: Via `<ThemeProvider>` wrapping root layout
- **Mode persistence**: localStorage with system preference detection
- **CSS Variables**: Tailwind `dark:` prefix and CSS custom properties
- **Mode toggle**: Theme switcher component in navigation

### RTL Support
- **Direction**: Right-to-Left (RTL) for Arabic localization
- **Implementation**: `dir="rtl"` on `<html>` element when locale is Arabic
- **Tailwind**: RTL-aware utilities via `rtl:` prefix
- **Icons**: Mirrored automatically for directional icons in RTL mode
- **Known issue**: Some third-party components don't fully support RTL

### Typography
- **Font system**: Tailwind v4 default font stack
- **Arabic font**: 'DejaVu Sans' for invoice PDFs; 'Noto Sans Arabic' for UI (planned)
- **Scale**: text-xs (12px) through text-4xl (36px)

### Colors
- **Primary**: Blue (#000066 in invoices, Tailwind blue-600 in UI)
- **Secondary**: Gray palette
- **Status colors**: 
  - Success → green
  - Warning → amber/yellow
  - Error → red
  - Info → blue
- **Charge groups**: Color-coded (see charge-groups.ts in invoices)

---

## Application Pages (38 Pages)

| Module | Pages | Status |
|--------|-------|--------|
| **Auth** | Login, Forgot Password, Reset Password | ✅ Complete |
| **Dashboard** | Main dashboard, Area dashboard | ✅ Complete |
| **Customers** | List, Detail, Create, Edit | ✅ Complete |
| **Meters** | List, Detail, Create, Edit, Activate, Terminate | ✅ Complete |
| **Readings** | List, Capture, Review Queue | ✅ Complete |
| **Invoices** | List, Detail, Generate, Issue | ✅ Complete |
| **Payments** | List, Create, Allocate | ✅ Complete |
| **Tariffs** | List, Create, Edit, Simulate | ✅ Complete |
| **Billing Periods** | List, Create, Close | ✅ Complete |
| **Settlements** | List, Create, Adjust | ✅ Complete |
| **Reports** | List, Generate, View | ⚠️ Partial |
| **Support** | Tickets, Create Ticket | ✅ Complete |
| **Admin** | Users, Roles, Areas, Settings, Audit Log | ✅ Complete |
| **Profile** | User Profile, Notifications | ✅ Complete |

---

## Component Library

### shadcn/ui Components (48)
All available shadcn/ui components are installed and ready for use.

**Frequently used**:
- `Button`, `Input`, `Select`, `Card`, `Table`, `Badge`, `Dialog`, `Sheet`
- `DropdownMenu`, `Popover`, `Tooltip`, `Tabs`, `Accordion`, `Separator`
- `Toast`, `Sonner`, `Skeleton`, `Spinner`
- `Form`, `Label`, `Textarea`, `Checkbox`, `RadioGroup`, `Switch`

**Less used**:
- `Calendar`, `DatePicker`, `Command`, `ContextMenu`, `Menubar`
- `NavigationMenu`, `Pagination`, `Progress`, `ScrollArea`, `Slider`

---

## Icons

- **Library**: `lucide-react` (comprehensive, tree-shakeable)
- **Pattern**: Always import specific icons, never the entire library:
  ```typescript
  import { User, Settings, LogOut, Bell } from 'lucide-react';
  ```
- **Size**: Default `size={4}` (h-4 w-4) for inline icons, `size={8}` for navigation
- **Custom icons**: Not used; all icons from lucide-react

---

## Known UI Issues

### Critical
- **Raw fetch instead of apiClient**: Several pages in the Frontend use direct `fetch()` calls instead of the configured `apiClient` from `@/lib/api/index.ts`. This bypasses auth headers, base URL configuration, and error handling.
  - Affected files: Various page components and hooks
  - Fix: Replace all `fetch()` with `apiClient.get/post/put/patch/delete()`

### High
- **Missing loading states**: Several pages don't show loading spinners or skeletons during data fetch. Users see a blank page until data arrives.
  - Affected components: Customer detail, Meter detail, Report pages
  - Fix: Wrap all async data with `<QueryBoundary>` (exists in `@/components/shared/QueryBoundary.tsx`)

- **Missing error boundaries**: Some pages crash the entire app on API errors instead of showing a friendly error state.
  - Fix: Add `<ErrorBoundary>` to each page-level component

### Medium
- **Mobile responsiveness**: Table components overflow on mobile viewports. No horizontal scroll handling for many tables.
  - Affected components: Invoice list, Payment list, Customer list, Meter list tables
  - Fix: Add responsive table wrapper with horizontal scroll

- **RTL inconsistencies**: Some shadcn/ui components (Calendar, DatePicker) have layout issues in RTL mode
  - Affected: Calendar component, Date range pickers

- **Dark mode gaps**: Some pages have unreadable text in dark mode due to missing dark: variants
  - Fix: Audit and add `dark:` variants to all color classes

### Low
- **Animation performance**: framer-motion page transitions cause jank on lower-end devices
- **Image optimization**: Invoice logos not optimized via next/image
- **Font loading**: No font-display: swap configured for custom fonts

---

## Coding Conventions

### File Structure
```
src/
├── app/           # Next.js App Router pages
├── components/    # React components
│   ├── shared/    # Reusable across modules
│   └── {module}/  # Module-specific components
├── hooks/         # Custom React hooks
├── lib/           # Utilities, API client, types
│   ├── api/       # API client and query provider
│   ├── mock-*.ts  # Mock data files
│   └── types.ts   # TypeScript type definitions
└── pages/         # Legacy pages (migration to app/ ongoing)
```

### Component Pattern
```typescript
// Example pattern for page components
export function MetersPage() {
  const { data, isLoading, error } = useQuery(...);
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState />;
  if (!data) return <EmptyState />;
  return <div>...</div>;
}
```

### Feature Flags
All modules support mock/API toggling via `feature-flags.ts`:
```typescript
import { getModuleSource } from '@/lib/feature-flags';
const source = getModuleSource('projects'); // 'mock' | 'api'
```

---

## Source Files

| File | Purpose |
|------|---------|
| `Frontend/src/app/layout.tsx` | Root layout with ThemeProvider + QueryProvider |
| `Frontend/src/lib/feature-flags.ts` | Mock/API toggle configuration |
| `Frontend/src/lib/api/index.ts` | API client + QueryProvider |
| `Frontend/src/lib/api/query-client.tsx` | React Query client setup |
| `Frontend/src/lib/types.ts` | TypeScript types including UserRole |
| `Frontend/src/components/shared/QueryBoundary.tsx` | Loading/error/empty state wrapper |
| `Frontend/src/components/shared/PageHelpers.tsx` | EmptyState and page helpers |
| `Frontend/tailwind.config.ts` | Tailwind CSS configuration |
| `Frontend/components.json` | shadcn/ui configuration |
| `Frontend/next.config.ts` | Next.js configuration (standalone, ignoreBuildErrors) |
