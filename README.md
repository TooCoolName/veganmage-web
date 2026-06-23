# veganmage-web

React, TypeScript, and Vite web app.

## Setup

Install dependencies with Bun:

```sh
bun install
```

## Scripts

Run the development server:

```sh
bun run dev
```

Build for production:

```sh
bun run build
```

Lint with oxlint:

```sh
bun run lint
```

Run TypeScript type checking:

```sh
bun run typecheck
```

Preview the production build:

```sh
bun run preview
```

## Linting

This project uses [oxlint](https://oxc.rs/docs/guide/usage/linter.html). The checked-in `.oxlintrc.json` enables the TypeScript, Unicorn, Oxc, and React plugins, and warnings fail the lint command via `--deny-warnings`.
