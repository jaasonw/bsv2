# CRUSH Development Guide

## Build/Test/Lint Commands
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `npx tsc --noEmit` - TypeScript type checking

## Code Style Guidelines

### Imports
- Use `@/` for absolute imports from src/
- Group imports: external packages, then internal modules
- Use `type` imports for TypeScript types: `import type { Metadata } from "next"`

### React/TypeScript
- Use TypeScript strict mode with explicit typing
- Prefer `interface` over `type` for object shapes
- Use React.FC with explicit children props
- Always type useState and context values explicitly
- Use camelCase for variables, PascalCase for components

### File Structure
- Components in `/src/components/` with PascalCase names
- UI components in `/src/components/ui/`
- Utilities in `/src/lib/`
- API routes in `/src/app/api/`
- Use descriptive file names matching component names

### Error Handling
- Use try-catch blocks for async operations
- Return NextResponse.json with appropriate status codes
- Log errors with console.error before returning
- Provide meaningful error messages

### Styling
- Use Tailwind CSS with clsx/twMerge for conditional classes
- Define custom colors in tailwind.config.ts using HSL CSS variables
- Use Radix UI components for accessibility
- Follow mobile-first responsive design