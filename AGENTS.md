:-----------------------------------------------------------

# AI Agent Guidelines for bsv2 (Bill Splitter v2)

:-----------------------------------------------------------

A Next.js 16 web application for splitting restaurant bills with AI-powered receipt parsing.

:-----------------------------------------------------------

## Technology Stack

:-----------------------------------------------------------

- **Framework**: Next.js 16.0.7 (App Router)
- **Frontend**: React 19.2.1, React DOM 19.2.1
- **Language**: TypeScript 5.9.3 (strict mode)
- **Styling**: Tailwind CSS 4.1.17 (CSS-based configuration in globals.css)
- **UI Components**: shadcn/ui (53 components) with Radix UI primitives
- **State Management**: React Context API (BillProvider, AuthContext)
- **Backend**: PocketBase (client-side only architecture)
- **Package Manager**: pnpm 10.24.0 (REQUIRED - do not use npm/yarn)
- **Icons**: Lucide React

:-----------------------------------------------------------

## Package Management

:-----------------------------------------------------------

**ALWAYS use pnpm**: `pnpm install`, `pnpm dev`, `pnpm build`
**Never** use npm or yarn commands
Lockfile: pnpm-lock.yaml

:-----------------------------------------------------------

## Project Structure

:-----------------------------------------------------------

```
src/
├── app/                  # Next.js App Router
│   ├── api/v1/parse/     # AI receipt parsing API
│   ├── globals.css       # Tailwind v4 CSS config (NO tailwind.config.ts)
│   ├── layout.tsx        # Root layout with providers
│   ├── mobile/           # Mobile-optimized page
│   └── page.tsx          # Main page
├── components/
│   ├── ui/               # shadcn/ui components (53)
│   ├── BillProvider.tsx  # Global state context
│   ├── BillSplitter.tsx  # Main application component
│   ├── BillTable.tsx     # Table view component
│   ├── PhotoUpload.tsx   # Receipt upload with AI parsing
│   ├── AuthDialog.tsx    # Authentication modal
│   ├── UserMenu.tsx      # User avatar dropdown
│   ├── SaveReceiptDialog.tsx  # Save receipt with image toggle
│   ├── ReceiptHistory.tsx # Receipt history with thumbnails
│   ├── AuthenticatedImage.tsx # Protected image component
│   ├── Header.tsx        # App header with auth controls
│   ├── MobileLayout.tsx  # Mobile-optimized layout
│   └── DesktopLayout.tsx # Desktop-optimized layout
├── contexts/
│   └── AuthContext.tsx   # Authentication state management
├── hooks/
│   └── use-mobile.ts     # Mobile breakpoint detection
└── lib/
    ├── pocketbase.ts     # PocketBase client singleton
    ├── receipts.ts       # Receipt CRUD operations
    ├── image-processing.ts  # Image optimization utilities
    └── utils.ts          # CN utility, table calculations, data types
```

:-----------------------------------------------------------

## Build & Development Commands

:-----------------------------------------------------------

| Command             | Purpose                                       |
| ------------------- | --------------------------------------------- |
| `pnpm dev`          | Start development server                      |
| `pnpm build`        | Build for production                          |
| `pnpm start`        | Start production server                       |
| `pnpm lint`         | Run ESLint (eslint-config-next)               |
| `pnpm format`       | Format code with Prettier                     |
| `pnpm format:check` | Check code formatting without modifying files |

:-----------------------------------------------------------

## Formatting Workflow

:-----------------------------------------------------------

This project uses **Prettier** for code formatting with a configuration file at `.prettierrc`.

### Configuration (`.prettierrc`)

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Usage

- **Format all files**: `pnpm format`
- **Check formatting (CI)**: `pnpm format:check`

### When to Format

- Run `pnpm format` before committing changes
- Use `pnpm format:check` in CI/CD pipelines to ensure code consistency
- The formatter handles all supported file types automatically (TS, TSX, JS, JSON, CSS, etc.)

:-----------------------------------------------------------

## Code Style Guidelines

:-----------------------------------------------------------

### TypeScript

- Use strict TypeScript mode (enabled in tsconfig.json)
- Prefer interfaces over types for object shapes
- Use proper React.FC typing for components
- Path alias: `@/*` maps to `./src/*`

### React Patterns

- Use React 19's `use` hook for context consumption (see PhotoUpload.tsx:20)
- Forward refs properly with React.forwardRef
- Add `"use client"` directive when using hooks or browser APIs
- React Compiler is enabled (next.config.mjs)
- Use `asChild` prop pattern for component composition

### Component Structure (shadcn/ui Pattern)

Follow this pattern for all components:

```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// 1. Define variants with cva
const componentVariants = cva(
  "base-classes",
  {
    variants: {
      variant: { /* ... */ },
      size: { /* ... */ },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// 2. Define props interface
export interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {
  asChild?: boolean;
}

// 3. Create component with forwardRef
const Component = React.forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "element";
    return (
      <Comp
        className={cn(componentVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Component.displayName = "Component";

// 4. Export both component and variants
export { Component, componentVariants };
```

### Styling (Tailwind CSS v4)

**IMPORTANT**: No separate tailwind.config.ts file. Configuration is in `src/app/globals.css`.

- Use `@theme` directive for custom properties
- CSS variables in HSL format: `hsl(var(--background))`
- Use `cn()` helper from `@/lib/utils` for class merging
- Container utility already defined in globals.css
- Dark mode support via CSS custom-variant

### State Management Pattern

Global state via React Context (see BillProvider.tsx and AuthContext.tsx):

```typescript
// 1. Create context
export const BillContext = createContext<BillContextType | undefined>(undefined);

// 2. Create provider component
export const BillProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<StateType>(initialState);
  // ... state logic
  return <BillContext.Provider value={value}>{children}</BillContext.Provider>;
};

// 3. Consume context with use hook (React 19)
const context = use(BillContext);
if (!context) throw new Error("Component must be used within Provider");
```

:-----------------------------------------------------------

## Key Files Reference

:-----------------------------------------------------------

### Calculation Logic

`/src/lib/utils.ts` - Bill calculation functions:

- `createTable()`: Generates bill split table using DataFrame
- `getPartialSubtotal()`: Individual's share of items
- `getPartialAmount()`: Proportional tip/tax calculation
- `getPartialTotal()`: Complete individual total
- `validateTotals()`: Ensures calculations are accurate (within $0.01 epsilon)

**Data Types**:

```typescript
export interface Item {
  name: string;
  price: number;
  buyers: string[];
}
```

### State Provider

`/src/components/BillProvider.tsx` - Global state management:

- Items management (add, delete, save, update buyers)
- People management (add, delete, save with rename propagation)
- Tip/tax settings and calculations
- Table generation and persistence
- Receipt image state management
- `loadReceipt()` method for loading saved receipts from PocketBase
- beforeunload handler for unsaved changes warning

### Component Examples

- `/src/components/ui/button.tsx`: Standard shadcn/ui component pattern
- `/src/components/PhotoUpload.tsx`: AI integration with error handling
- `/src/components/BillSplitter.tsx`: Main application logic

### API Route

`/src/app/api/v1/parse/route.ts` - AI receipt parsing:

- POST endpoint accepts FormData with image file
- Calls OpenRouter API (google/gemini-2.0-flash-001)
- Returns JSON: `{ items: [], tip: number, tax: number, written_total: number }`

:-----------------------------------------------------------

## AI Integration Guidelines

:-----------------------------------------------------------

### Receipt Parsing API

- **Endpoint**: `POST /api/v1/parse`
- **Provider**: OpenRouter (openrouter.ai)
- **Model**: google/gemini-2.0-flash-001
- **Authentication**: OPENROUTER_API_KEY environment variable

### Response Format

The AI returns structured JSON:

```json
{
  "items": [
    { "name": "string", "price": number, "buyers": [] }
  ],
  "tip": number,
  "tax": number,
  "written_total": number
}
```

### AI Prompt Guidelines (in route.ts)

- Preserve original item order from receipt
- Exclude zero-dollar items
- Handle discounts as negative items
- Handle tip checkboxes (use checked value)
- Include modifications/add-ons in parentheses with item name
- Carefully associate prices with correct items

:-----------------------------------------------------------

## PocketBase Integration

:-----------------------------------------------------------

### Architecture

**Client-side only** architecture for PocketBase (as recommended by PocketBase maintainer):

- No server-side PocketBase calls (avoiding SSR complications)
- Auth token persistence via cookieStorage
- All database operations happen in browser
- CORS configured on PocketBase instance (e.g., Caddy proxy)

### Key Files

- `/src/lib/pocketbase.ts` - Client singleton with auth persistence
- `/src/lib/receipts.ts` - Receipt CRUD operations
- `/src/contexts/AuthContext.tsx` - Authentication state management

### Receipts Collection Schema

Required fields in PocketBase `receipts` collection:

```typescript
{
  user: string,              // relation to users collection
  title: string,              // receipt name
  items: JSON,                // Item[] array
  people: JSON,               // string[] array
  tax: number,                // tax amount
  tip: number,                // tip amount
  tip_as_proportion: boolean, // tip calculation mode
  tip_the_tax: boolean,       // apply tip to tax
  receipt_image?: string,     // optional image file
  created: string,            // auto timestamp
  updated: string             // auto timestamp
}
```

### Receipt API (`/src/lib/receipts.ts`)

- `saveReceipt(data, image?)` - Save receipt with optional image
- `loadReceipt(id)` - Load receipt by ID
- `listReceipts()` - List user's receipts (sorted by newest)
- `deleteReceipt(id)` - Delete receipt

### AuthContext Pattern

```typescript
// Authentication with auto-refresh
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load auth from cookieStorage
    // Set up auto-refresh interval (4 minutes)
    return () => clearInterval(refreshInterval);
  }, []);

  const login = async (email, password) => { /* ... */ };
  const register = async (email, password, name) => { /* ... */ };
  const logout = async () => { /* ... */ };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Receipt History UI Pattern

- Image on right side of row (thumbnail)
- Metadata stacked vertically: date, people count, total amount
- Click row to load receipt
- Delete button with confirmation dialog

### Protected File Access

For accessing protected receipt images stored in PocketBase:

```typescript
// Request a short-lived file token (~2 min validity)
const fileToken = await pb.files.getToken();

// Build URL with the file token as query param
const url = pb.files.getURL(record, filename, { token: fileToken });

// Use the URL directly in <img src={url}>
```

**Important**: The `?token=` query parameter requires a **file token** (from `pb.files.getToken()`), NOT the user auth token (`pb.authStore.token`). The file endpoint does not accept user tokens via Authorization header or query param.

**Key Components:**

- `AuthenticatedImage.tsx` - Handles file token fetching and protected image display
- `ReceiptHistory.tsx` - Uses AuthenticatedImage for receipt thumbnails
- `BillProvider.tsx` - Fetches file tokens when loading saved receipts

:-----------------------------------------------------------

## Image Processing

:-----------------------------------------------------------

### Image Optimization

Receipt images are automatically optimized before upload to reduce storage and improve AI parsing performance:

**Settings:**

- **Max Width**: 1200px
- **Max Height**: 2000px
- **Quality**: 85%
- **Format**: JPEG (converts PNGs automatically)
- **Expected Result**: 4-5MB → 200-400KB

**Processing Flow:**

1. User selects/captures image in `PhotoUpload.tsx`
2. Image is processed client-side using `processImageFile()` from `image-processing.ts`
3. Optimized image replaces original before AI parsing
4. Optimized image is used for cloud saves (if user includes image)

**API:**

```typescript
// Process image to JPEG at 85% quality, max 1200px wide
const processedFile = await processImageFile(originalFile, {
  maxWidth: 1200,
  maxHeight: 2000,
  quality: 0.85,
  format: "image/jpeg",
});
```

:-----------------------------------------------------------

## UI/UX Patterns

:-----------------------------------------------------------

### Responsive Design

- Mobile-first with breakpoint at 768px
- `useIsMobile` hook for responsive detection
- Separate `MobileLayout` and `DesktopLayout` components
- Mobile uses carousel, tabs, and compact list views
- Desktop uses side-by-side table view

### Dialog Patterns

- Use AlertDialog for confirmations (destructive actions)
- Use Dialog for editing (items, people)
- Use Sheet for mobile-friendly side panels
- Use Drawer for mobile-bottom actions

### Form Patterns

- React Hook Form with Zod validation
- Controlled inputs with proper TypeScript types
- Clear error messages and loading states

:-----------------------------------------------------------

## Important Notes

:-----------------------------------------------------------

### Current Limitations

- **NO TESTING FRAMEWORK**: No Jest, Vitest, or Playwright configured
- **NO CI/CD**: No GitHub Actions workflows
- **Coverage**: 0% test coverage currently

### Feature Specifics

- **React Compiler**: Enabled for automatic memoization
- **Dark Mode**: Supported via next-themes (CSS variables)
- **Data Persistence**: PocketBase cloud sync with optional receipt images
- **Animation**: tw-animate-css for Tailwind animations

### shadcn/ui Components Available

53 components in `/src/components/ui/`:

- **Form**: button, input, select, checkbox, radio-group, switch, slider, textarea
- **Layout**: card, dialog, drawer, sheet, tabs, accordion, collapsible, separator
- **Feedback**: alert-dialog, sonner (toasts), progress, skeleton
- **Navigation**: dropdown-menu, navigation-menu, breadcrumb, command, menubar
- **Data Display**: table, badge, avatar, tooltip, hover-card, popover, aspect-ratio
- **Overlay**: context-menu, scroll-area, resizable-panels

### When Making Changes

1. Check if shadcn/ui component exists in `/src/components/ui/` before creating custom
2. Follow existing component file structure and patterns
3. Use `cn()` helper for all class merging
4. Add proper TypeScript interfaces
5. Run `pnpm lint` before committing
6. Run `pnpm format` for code formatting
7. Ensure mobile and desktop layouts both work
8. For PocketBase changes: verify client-side only architecture, no server-side PocketBase calls

:-----------------------------------------------------------

## Environment Variables

:-----------------------------------------------------------

Required for AI features:

- `OPENROUTER_API_KEY`: API key for receipt parsing

Required for PocketBase:

- `NEXT_PUBLIC_POCKETBASE_URL`: URL to your PocketBase instance (e.g., `https://physicsbirds.com/bs/`)

Store in `.env.local` (already in .gitignore)

:-----------------------------------------------------------

## Dependencies to Know

:-----------------------------------------------------------

| Package                    | Purpose                                    |
| -------------------------- | ------------------------------------------ |
| `dataframe-js`             | DataFrame operations for bill calculations |
| `class-variance-authority` | Component variant styling                  |
| `clsx` + `tailwind-merge`  | Class merging (via `cn()` helper)          |
| `zod`                      | Schema validation                          |
| `react-hook-form`          | Form state management                      |
| `cmdk`                     | Command palette                            |
| `vaul`                     | Drawer component                           |
| `sonner`                   | Toast notifications                        |
| `embla-carousel-react`     | Carousel for mobile                        |
| `next-themes`              | Dark/light mode                            |
| `pocketbase`               | Backend-as-a-Service for auth and storage  |

:-----------------------------------------------------------

## File Naming Conventions

:-----------------------------------------------------------

- Components: PascalCase (e.g., `BillSplitter.tsx`)
- Utilities: camelCase (e.g., `utils.ts`)
- Hooks: camelCase with use prefix (e.g., `use-mobile.ts`)
- Styles: lowercase (e.g., `globals.css`)
- API routes: lowercase (e.g., `route.ts`)
