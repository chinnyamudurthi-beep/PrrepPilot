# PrepPilot — AI Placement Assistant

PrepPilot is a polished, responsive placement-preparation dashboard for college students. It includes a dashboard, interview practice, coding exercises, resume analysis, skill tracking, progress history, and settings.

## What works in this prototype

The app is intentionally local-first for the initial demo. It needs no paid API, secret key, account, or external AI service. Interview coaching uses transparent rule-based feedback, coding uses an educational keyword-based checker instead of pretending to compile code, and resume analysis clearly presents a simulated ATS-style score. All progress is stored in browser `localStorage` under `preppilot-state-v1` and survives refreshes.

The responsive shell supports direct paths for `/`, `/interview`, `/coding`, `/resume`, `/skills`, `/progress`, and `/settings`. The required route manifest is served at `/manus-routes.json`.

## Run locally

```bash
pnpm run dev
```

The app listens on `http://localhost:3000`. The static build is generated with:

```bash
pnpm run build
```

The build output is `dist/` and contains the static app shell.

## Publish as a live website

This managed project is already connected to a Manus Preview. To publish a checkpoint, use the project’s Version history / Publish workflow after committing the intended files. The static deployment contract is configured to run `pnpm run build` and serve `dist/`; no server or database is required for the current prototype. If you later connect a real AI analyzer or user accounts, enable the managed server capability before adding a server deployment.

## Upload to a new public GitHub repository named `PrepPilot`

The managed Webdev GitHub connection flow must be used rather than `gh repo create` or a separate GitHub connector. In the project configuration, choose the GitHub canonical repository action, enter the owner and repository name `PrepPilot`, and complete the owner confirmation card. The current platform flow may create a new private repository first; if public visibility is required, switch the repository to **Public** in GitHub’s repository Settings after the transfer completes. Confirm that `main` contains the latest accepted checkpoint before changing visibility.

For a manual backup outside the managed canonical repository, the equivalent commands are:

```bash
git init
git add .
git commit -m "Build PrepPilot placement assistant prototype"
git branch -M main
git remote add origin https://github.com/<your-username>/PrepPilot.git
git push -u origin main
```

Do not commit secrets. The prototype does not require any.
