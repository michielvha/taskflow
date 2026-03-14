# Taskflow - Implementation Plan

## Tech Stack
- **Frontend**: React 19 + TypeScript + Vite 7 + shadcn/ui (new-york) + Tailwind CSS v4
- **Native shell**: Tauri v2 (macOS, iOS, Android) with `macos-private-api` for Sequoia vibrancy
- **Database**: SQLite via `tauri-plugin-sql` (native) / `wa-sqlite` + IndexedDB (browser)
- **Icons**: lucide-react
- **Dates**: date-fns
- **Testing**: Vitest + @testing-library/react
- **Linting**: ESLint 9 flat config + typescript-eslint + eslint-plugin-security
- **SAST**: Trivy (filesystem + image scan), npm audit, eslint-plugin-security
- **CI/CD**: GitHub Actions, `michielvha/gitversion-tag-action`, `michielvha/docker-release-action` (ghcr.io)
- **Docker**: node:25-alpine builder -> nginx:alpine, non-root, port 8080
- **Package manager**: npm

## Data Model (SQLite)

**todos**: id (TEXT PK), title, description, topic_id (FK), due_date, completed (INT 0/1), completed_at, priority (0-3), sort_order, created_at, updated_at
**topics**: id (TEXT PK), name (UNIQUE), color (hex), icon, sort_order, created_at, updated_at
**settings**: key (TEXT PK), value (TEXT) - auto_hide_completed, auto_hide_delay_ms, default_sort, theme

## Data Layer Architecture
- `src/lib/platform.ts` - detect Tauri vs browser via `__TAURI_INTERNALS__`
- `src/db/database.ts` - `DatabaseAdapter` interface (`execute`, `select`, `close`)
  - `TauriSqliteAdapter` - wraps `@tauri-apps/plugin-sql`
  - `WaSqliteAdapter` - wraps `wa-sqlite` with `IDBBatchAtomicVFS` for IndexedDB persistence
- `src/db/repositories/` - todo, topic, settings repos (raw SQL, platform-agnostic)
- `src/db/migrations.ts` - idempotent schema (CREATE IF NOT EXISTS)
- Export/import: JSON serialization of all tables, triggered from settings dialog

## Project Structure

```
taskflow/
├── .github/workflows/
│   ├── ci.yml                    # lint, typecheck, test, SAST, Docker build+push
│   └── release-native.yml        # Tauri builds (macOS aarch64/x86_64, iOS, Android)
├── docs/plan/                    # This plan
├── src/
│   ├── components/
│   │   ├── ui/                   # shadcn generated components
│   │   ├── layout/
│   │   │   ├── app-shell.tsx     # Sidebar + content grid
│   │   │   ├── sidebar.tsx       # Topic nav, collapses to drawer on mobile
│   │   │   ├── header.tsx        # Title, search, settings gear
│   │   │   └── glass-panel.tsx   # Glassmorphism wrapper
│   │   ├── todo/
│   │   │   ├── todo-list.tsx     # Sorted list container
│   │   │   ├── todo-item.tsx     # Single row (checkbox, title, topic badge, date)
│   │   │   ├── todo-form.tsx     # Add/edit dialog
│   │   │   ├── todo-filters.tsx  # Sort/filter bar
│   │   │   └── completed-section.tsx  # Collapsible, auto-hide configurable
│   │   ├── topic/
│   │   │   ├── topic-list.tsx
│   │   │   ├── topic-badge.tsx
│   │   │   └── topic-form.tsx
│   │   └── settings/
│   │       └── settings-dialog.tsx    # Includes export/import buttons
│   ├── db/
│   │   ├── database.ts           # DatabaseAdapter + platform switch
│   │   ├── migrations.ts         # SQL schema
│   │   ├── schema.ts             # TypeScript types
│   │   └── repositories/
│   │       ├── todo.repository.ts
│   │       ├── topic.repository.ts
│   │       └── settings.repository.ts
│   ├── hooks/
│   │   ├── use-database.ts       # DB context + provider
│   │   ├── use-todos.ts          # CRUD + filtering + sorting
│   │   ├── use-topics.ts
│   │   ├── use-settings.ts
│   │   └── use-platform.ts
│   ├── lib/
│   │   ├── utils.ts              # shadcn cn() utility
│   │   ├── platform.ts           # isTauri() / isBrowser()
│   │   ├── export-import.ts      # JSON export/import logic
│   │   └── constants.ts
│   ├── styles/
│   │   ├── globals.css           # Tailwind v4 @theme with dark blue palette + glass utilities
│   │   └── glassmorphism.css     # .glass, .glass-heavy, .glass-gradient classes
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── src-tauri/                    # Tauri v2 scaffold
│   ├── Cargo.toml                # tauri, tauri-plugin-sql, window-vibrancy, serde
│   ├── tauri.conf.json           # transparent window, sql plugin preload
│   ├── capabilities/default.json
│   └── src/lib.rs                # macOS vibrancy setup via window-vibrancy crate
├── public/favicon.svg
├── index.html
├── package.json
├── tsconfig.json                 # ES2022, strict, jsx: react-jsx, @/* paths
├── tsconfig.node.json
├── vite.config.ts
├── eslint.config.js              # Flat config + typescript-eslint + security + react-hooks
├── components.json               # shadcn/ui config (new-york style, Tailwind v4)
├── nginx.conf                    # SPA routing, WASM MIME, security headers, port 8080
├── Dockerfile                    # node:25-alpine -> nginx:alpine, non-root
├── .dockerignore
├── .gitignore
├── gitversion.yml                # GitHubFlow/v1 (copy from image-resizer)
└── README.md
```

## Theme: GitHub Dark / Obsidian + macOS Sequoia Glassmorphism

**Colors** (in globals.css @theme):
- Background: #0d1117 (deep dark blue)
- Card/Surface: #161b22
- Muted: #21262d
- Border: #30363d
- Primary accent: #58a6ff (blue)
- Destructive: #f85149
- Text: #e6edf3

**Glassmorphism CSS**:
- `.glass`: rgba(22,27,34,0.65) + backdrop-filter: blur(20px) saturate(180%)
- `.glass-heavy`: rgba(22,27,34,0.85) + blur(40px)
- `.glass-gradient`: linear-gradient with subtle blue tint + blur

**Tauri macOS vibrancy**:
- `transparent: true` in tauri.conf.json
- `window-vibrancy` crate with `NSVisualEffectMaterial::UnderWindowBackground`
- `macos-private-api` Cargo feature

## CI/CD Pipelines

### ci.yml (push to main + PRs)
1. **lint-and-test** job: checkout -> setup-node@v6 (node 25) -> npm ci -> lint -> typecheck -> test
2. **sast** job: npm audit --audit-level=high + Trivy FS scan (SARIF -> GitHub Security tab)
3. **build** job (main only, after lint+sast pass): gitversion-tag-action -> docker-release-action (ghcr.io, linux/amd64+arm64) -> Trivy image scan

### release-native.yml (on version tags v*)
1. **macOS** (matrix: aarch64-apple-darwin, x86_64-apple-darwin): tauri-apps/tauri-action
2. **iOS**: tauri ios build (requires Apple signing secrets)
3. **Android**: tauri android build (requires Java 17 + Android SDK)

## Reference Files (copy patterns from)
- `image-resizer/Dockerfile` -> Docker multi-stage pattern
- `image-resizer/eslint.config.js` -> ESLint base config
- `image-resizer/.github/workflows/ci.yml` -> CI workflow structure
- `image-resizer/tsconfig.json` -> TypeScript config base
- `image-resizer/gitversion.yml` -> GitVersion config (exact copy)

## Implementation Phases

### Phase 1: Scaffolding
- `npm create vite@latest . -- --template react-ts` in taskflow/
- Install Tailwind v4, shadcn/ui init, ESLint config, tsconfig paths
- Dockerfile, nginx.conf, gitversion.yml, .gitignore, .dockerignore
- Verify: `npm run dev`, `npm run build`, `npm run lint`

### Phase 2: Database Layer
- wa-sqlite for browser, platform detection, DatabaseAdapter interface
- Migrations, repositories (todo, topic, settings), TypeScript types
- Export/import JSON logic
- React context + hooks for DB access

### Phase 3: Core UI
- Install shadcn components (button, card, checkbox, dialog, dropdown-menu, input, etc.)
- GlassPanel, AppShell, Header, Sidebar
- TodoList, TodoItem, TodoForm, TodoFilters, CompletedSection
- TopicList, TopicBadge, TopicForm
- SettingsDialog (with export/import)

### Phase 4: State & Data Flow
- Wire hooks to components: use-todos, use-topics, use-settings
- Sort by date (default), topic, priority
- Topic filtering from sidebar
- Completed section toggle + auto-hide with configurable delay

### Phase 5: Tauri Integration
- `npx tauri init`, tauri-plugin-sql, TauriSqliteAdapter
- Window config (transparency, size), macOS vibrancy via window-vibrancy crate
- Tauri v2 capabilities/permissions
- Test: `npm run tauri dev` (macOS)

### Phase 6: CI/CD
- ci.yml: lint, typecheck, test, SAST (Trivy + npm audit), Docker build
- release-native.yml: Tauri desktop + mobile builds
- eslint-plugin-security integration

### Phase 7: Polish
- Responsive: sidebar -> Sheet drawer on mobile
- Touch targets (44px min), keyboard shortcuts (Cmd+N)
- Completion animations, empty states
- Topic count badges

## Verification
```bash
cd /Users/michielvh/code/personal/taskflow && npm run lint && npm run typecheck && npm run build
```
