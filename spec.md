# Dashboard2Code — Product and Engineering Specification

Status: **Implementation-ready specification; not an implementation or deployment**
Target repository: https://github.com/JsonLord/Paper2Code
Baseline: \`website2code\` at \`0d77173026b2f61634e380004c83164244d20c1c\` (recheck HEAD before coding)
Desired outcome: a third top-level tab named **Dashboard2Code** beside **Website2Code** and **Paper2Code**.

## 1. Purpose and interpretation

Allow a user to paste (a) a public GitHub repository URL containing a dashboard, (b) a direct public design asset URL such as a screenshot/image, or (c) an accessible public dashboard webpage URL. The product inspects that source, derives a dashboard blueprint, and **recreates the dashboard as editable, runnable frontend code** with a live preview and export. "Clone" means replicate the observable layout, visual hierarchy and demonstrable behavior within legitimate access and licensing boundaries; it does not mean silently deploy, push to the source repository, or invent an unavailable backend.

A screenshot is *visual evidence only*: it cannot establish real business rules, API access, hidden pages, or data accuracy. The resulting dashboard must label any sample/mock data and simulated interactions.

## 2. Existing codebase facts to preserve

- \`app/page.tsx\` currently renders two mode buttons and maintains \`'website' | 'paper'\` state; **add** a third \`'dashboard'\` mode without regressing the other two.
- The website flow transfers input via \`sessionStorage\` and navigates to \`app/generation/page.tsx\`, which creates a sandbox and uses the existing generation/apply/edit/preview workflow. Prefer a typed, namespaced Dashboard2Code handoff to this pipeline rather than a second builder.
- \`app/api/scrape-website/route.ts\` is a Firecrawl adapter but currently returns synthetic sample content when no key is present; Dashboard2Code must never report this as a successfully inspected source.
- \`lib/github.ts\` includes a forceful branch update. Dashboard2Code must not use that unsafe behavior for source ingestion or default export.
- \`app/api/submit-job/route.ts\` handles paper submission and GitHub export: keep it separate.
- Next.js 15 / React 19 / TypeScript / Tailwind app, Vite-based generated-app sandbox, existing provider routing, ZIP export and code editor affordances should be reused when practical.
- \`jules/AGENTS.md\` contains stale references to an unrelated project. Follow relevant repository source and the actual root \`Agent.md\`; do not treat those stale statements as the project's architecture or deployment authorization.
- \`.github/workflows/sync-to-hf.yml\` targets other branches, but direct deployment remains out of scope.

Start from this structure, inspect actual source before choosing implementation boundaries, and retain existing working behavior.

## 3. User-facing feature

### 3.1 Three-tab home

Display tabs in this order: **Website2Code | Paper2Code | Dashboard2Code**. The new tab has its own accessible input/form; mode switching preserves the current draft separately per tab where feasible.

Dashboard2Code form:

1. **Source URL** (required). Placeholder: "GitHub dashboard repo, public image, or dashboard URL".
2. Source type: **Auto-detect** (default), GitHub repo, Image/design asset, Public dashboard page.
3. Optional Git ref/subdirectory or dashboard entry point if the repo has multiple apps; prompt the user when ambiguous.
4. Goal: **Faithful recreation** (default) or **Inspired redesign**. Preserve the distinction in generation instructions.
5. Data behavior: **Demo data / local fixtures** (default) or **Integrate public data source** (only if a separate, verifiable public URL is provided). No credential collection in v1.
6. Optional implementation instructions; existing model selector where compatible.
7. Primary action: **Inspect dashboard**; after successful source inspection, show a reviewable blueprint and **Generate code** action.

The inspection review shows source URL/ref, thumbnail/reference if permitted, layout regions, theme, charts/tables/filters, identified interactions, license/provenance notes, and **known unknowns**. Users can correct the inferred blueprint or instructions before generation.

### 3.2 Generation workspace

Reuse \`/generation\` as much as possible:

- Side-by-side reference preview (image or public-page snapshot where available), generated live sandbox, editable code and chat/instruction area.
- Visible states: validating, retrieving, inspecting, awaiting review, generating, installing/building, preview ready, error/cancelled.
- Iterative text edits such as "make the sidebar narrower" or "turn this KPI into a line chart" continue on the **same dashboard sandbox**.
- Runnable React app with responsive layout, typography/color/tokens, dashboard navigation, KPIs, charts, tables, filters and realistic loading/empty/error states. Use local seeded data by default; controls should work on local state where behavior can be inferred.
- Export source as ZIP via existing capability; GitHub publish is **optional** and must require explicit destination and approval, with a new non-destructive branch/PR. Never write to the source repo by default.
- Clearly show "Visual reconstruction", "Functional demo", or "Live data integration" capabilities actually achieved. Do not present fake chart values as authentic source data.

### 3.3 Scope boundaries

**In v1:** public GitHub URLs, direct public PNG/JPEG/WebP images and safe SVG treatment, public HTML dashboard URL where capture service is configured; read-only source analysis; generated React/Vite dashboard; preview, iterative edits, download.

**Not in v1:** private GitHub repos, authentication-cookie scraping, Figma API/private asset access, bypassing paywalls or auth, extracting production data, running arbitrary source-repo build scripts, automatic publication, pixel-perfect claims without comparative evidence, recreating backend services that cannot be observed.

If a public webpage cannot be captured or an image format is unsupported, show an actionable failure; offer a supported image URL rather than silently generating from mock material.

## 4. Source classification and ingestion

### GitHub repository

Recognize \`https://github.com/{owner}/{repo}\`, optional \`/tree/{ref}/{path}\` and \`/blob/{ref}/{path}\`, including ref names containing slashes (resolve ambiguity through GitHub API metadata, not naive string slicing). Resolve the exact immutable commit SHA and selected path. Use GitHub's public read-only REST content/tree endpoints. Inspect bounded directory listings, likely dashboard files (README, package manifests, app routes, UI components, CSS, tokens), images and license. Do **not** automatically clone and execute the repository, run lifecycle scripts, install dependencies, evaluate fetched code, follow submodules, or import executable source into the server. Treat fetched code as *untrusted reference material*.

Detect multi-dashboard repos and ask which subdirectory/page to reproduce. Preserve attribution/license metadata. Prefer code-derived structure when legitimately reusable; otherwise derive visual/semantic structure without copying protected assets verbatim. Unsupported or restricted licenses require explicit notice and original replacement assets.

### Direct image/design asset

Accept approved public HTTPS image URLs with validated content-type and decoded file signature; support PNG/JPEG/WebP and safe SVG preprocessing (render/sanitize to raster for visual inspection, never insert untrusted SVG markup directly into DOM). Preserve reference dimensions/aspect ratio. Analyze visible layout, text labels, palette, cards, plots and hierarchy through the configured multimodal model. Treat any OCR/vision result as uncertain until reviewed; never invent underlying datasets.

### Public dashboard webpage

Use an existing configured capture/scrape provider (e.g. Firecrawl) with screenshot + relevant HTML/styles/metadata when authorized. Record capture quality and access limitations. An HTML scrape alone may miss chart rendering; explicitly say so. Reuse the existing adapter only after removing/excluding "successful fake data" semantics for this feature. No credentialed pages, CAPTCHA bypass or unrestricted crawls.

### Shared constraints

- HTTPS only, except local deterministic tests; reject credentials in URLs, unsupported schemes, localhost, loopback, link-local, RFC1918/private, metadata-service, multicast, and other non-public destinations (IPv4, IPv6, IPv4-mapped IPv6).
- Resolve DNS and enforce public-address checks **on every request and redirect**, including DNS rebinding protection, redirect count and subresource fetches. Recheck final effective URL. Never proxy arbitrary URL schemes.
- Enforce explicit configurable limits; initial suggested ceilings: 3 redirects, 10-second connect and 30-second inspect timeout, 10 MiB image, 100 indexed repo paths, 30 selected text files, 150 KiB per file and 2 MiB combined text. Reject over-limit before buffering.
- Safe content-type sniffing, sanitized filenames, bounded model input, no archive unpacking in v1, no secrets in logs or model prompts. Source documents/repo text are untrusted **data**, not system instructions.
- No outbound POST or mutation to the inspected source. Handle GitHub rate limits, 404, unsupported image formats and unavailable capture providers with non-fabricated error codes.

## 5. Intermediate contract and pipeline

Prefer small typed modules, not one enormous page component. Suggested locations are illustrative; match the repo's actual conventions:

- \`types/dashboard.ts\`: \`DashboardSource\`, \`DashboardInspection\`, \`DashboardBlueprint\`, \`DashboardGenerationContext\` and discriminated status/error types.
- \`lib/dashboard/source-classifier.ts\`, \`github-inspector.ts\`, \`asset-inspector.ts\`, \`page-inspector.ts\`, \`blueprint.ts\`, \`security.ts\`: source adapters and pure validation.
- \`app/api/dashboard/inspect/route.ts\`: typed POST adapter for read-only inspection.
- \`components/dashboard/\`: dedicated home input, blueprint review and comparison affordances.
- Update \`app/page.tsx\` for third tab; extend \`app/generation/page.tsx\` with a dashboard-specific initialization context while retaining existing website/paper contract.

Suggested inspect request:

    {
      "source": {"kind":"auto","url":"https://github.com/owner/repo/tree/main/dashboard"},
      "entryPoint": null,
      "requestedGoal": "faithful"
    }

Suggested inspect response:

    {
      "ok": true,
      "source": {"kind":"github_repo","canonicalUrl":"...","commitSha":"...","entryPoint":"..."},
      "blueprint": {
        "layout": {"regions":["topbar","sidebar","main"]},
        "theme": {"colors":[],"fonts":[],"spacing":[]},
        "widgets": [{"id":"kpi-1","kind":"kpi","label":"Revenue","dataStatus":"unknown"}],
        "interactions": [],
        "breakpoints": ["mobile","desktop"],
        "assumptions": [],
        "sourceEvidence": []
      },
      "warnings": ["No production data access inferred"]
    }

The schema must be validated with Zod, versioned (e.g. \`schemaVersion: 1\`), and backed by provenance references: screenshot coordinates or source file+commit+path, not unsupported claims. The API must return structured error codes and a visible failure, not HTTP 200 with a fake dashboard. For screenshot/asset evidence, use short-lived bounded storage or explicit client handoff without embedding large data URLs into \`sessionStorage\`. Do not assume long-lived server memory or a new database in a Hugging Face Space.

Generation pipeline:

1. Validate/classify URL and fetch bounded evidence.
2. Extract \`DashboardBlueprint\` from source evidence; note uncertainties and licensing.
3. Ask for entry point / human correction if ambiguous.
4. Generate multi-file React/Vite source using the existing model provider and sandbox pipeline, with stable reusable components and editable local state.
5. Apply code to isolated sandbox; run package/build/runtime checks without executing original source-repo code.
6. Render mobile/tablet/desktop snapshots and compare against captured reference where available. Report both successful fidelity and differences.
7. Expose preview, iterative improvements, ZIP export and explicit optional GitHub export.

Reuse existing AI generation/edit routes and model selection where practical, but create a **mode-scoped prompt template and context adapter** so the source is not misclassified as a website URL or paper text. Do not allow source text to override safety instructions, configure providers, request secrets, or command tools.

## 6. Output quality

Generated frontend defaults to React + TypeScript + Vite + compatible CSS/Tailwind within the existing sandbox conventions. Include:

- Responsive dashboard shell (at least desktop 1440px, tablet 768px and mobile 390px).
- Semantic navigation; accessible labels, keyboard-operable controls, visible focus and usable color contrast.
- Sidebar/topbar, dashboard hierarchy, reusable KPI/chart/table/filter components based on observed evidence.
- Functional local interactions for tabs, filters, date ranges, search, sorting and collapsing when present; honest simulated data.
- Deterministic fixture data and no undisclosed external API dependencies.
- Reasonable empty/error/loading states and documented assumptions.
- No exposed API keys, untrusted scripts, remote code evaluation or silent publishing.
- A \`README\` in the generated result describing source attribution, setup, limitations, data-mode status and known mismatches.

For fidelity evaluation, keep the reference viewport fixed, record dimensions, and use a reproducible screenshot comparison and reviewer checklist. A numerical image-similarity score may be reported only if implemented and labeled with method; never invent a score or claim pixel-perfect equivalence.

## 7. API/error/security behavior

Required structured errors: \`INVALID_URL\`, \`UNSUPPORTED_SOURCE\`, \`PRIVATE_OR_BLOCKED_ADDRESS\`, \`SOURCE_UNAVAILABLE\`, \`SOURCE_TOO_LARGE\`, \`RATE_LIMITED\`, \`CAPTURE_UNAVAILABLE\`, \`AMBIGUOUS_ENTRYPOINT\`, \`INSPECTION_FAILED\`, \`GENERATION_FAILED\`, \`SANDBOX_FAILED\`. Preserve HTTP semantics (400/403/404/413/429/422/502/503 as appropriate).

Add request deduplication/cancellation, backpressure, resource ceilings and minimal safe progress logging. Validate any resulting file manifest and filesystem paths before writing to the sandbox. Never accept absolute paths, traversal or shell directives from generated content. Scope job/context data per user/session; do not reuse mutable process-global conversation state across users for the dashboard flow. Verify that current global state behavior does not cross-contaminate jobs before reusing it.

No publication or deployment credentials should be required to **inspect** or **preview**. Any GitHub write must be explicitly opted in, target a separate authorized destination and use non-force, conflict-aware git operations.

## 8. Acceptance tests and gates

**Gate A — analysis and architecture**
- Inspect active HEAD, existing tab logic, URL flow, generation/chat/sandbox/export, relevant environment configuration and route tests.
- Produce a brief architecture note/implementation checklist before changing code.
- Baseline smoke tests for Website2Code and Paper2Code remain runnable, or pre-existing failures are documented with evidence.

**Gate B — inspect**
- GitHub fixture repo: resolves branch + directory to immutable SHA; lists relevant files; no repository code executed.
- Image fixture (PNG/JPEG or WebP): extracts a meaningful blueprint and source dimensions.
- Public page fixture with configured capture provider: returns actual screenshot metadata and identifies charts/cards if visible.
- Missing Firecrawl key, private URL, localhost/metadata IP, DNS-redirect-to-private, unsupported type, oversize and rate limit yield explicit failures; no fake success.
- Tests with instruction-injection text in source README/HTML ensure it remains untrusted data.

**Gate C — end-to-end generation**
- Three tabs visible and keyboard accessible; each retains expected independent behavior.
- From a public repo URL and from an image URL, inspect → review → generate → working sandbox preview → edit prompt → export ZIP.
- Generated result contains at least navigation, responsive shell, useful widgets and deterministic fixture data when source evidence supports them.
- Selected repo entry point flows through without being replaced by default root; state survives navigation without leaking into website mode.
- No implicit write/push/deployment. Optional GitHub export (if exposed) requires explicit destination/confirmation and uses non-force branch/PR semantics.

**Gate D — build/deployment readiness**
- Typecheck, lint (using a valid current command), Next.js production build, relevant unit/integration tests and API contract checks pass; report any existing unrelated failures.
- Test at 390, 768 and 1440 widths, screenreader/keyboard basics, negative inputs, preview failure recovery and cancellation.
- Docker/Hugging Face Space build *can* be tested locally, but do not publish, overwrite Space files, change secrets or merge without human authorization.
- Provide test commands, screenshots/logs that contain no private data, source-specific fidelity notes, resource measurements and a precise GO/NO-GO assessment.

## 9. Delivery artifacts

1. Implementation on a new branch created from \`website2code\` (proposed \`feature/dashboard2code\`) and a **draft PR back to \`website2code\`**.
2. Updated README with three modes, example inputs, required optional env vars and source limitations.
3. Unit/integration/browser tests and small public fixtures with license/attribution.
4. API schema/examples, threat model, test report and short operator instructions.
5. Clear backlog for non-v1 features (private repos via OAuth, uploaded local screenshots, Figma, live data connectors, advanced image-diff QA).

## 10. Non-negotiables

- Preserve the two existing tabs and their data flows.
- Third tab must actually inspect a source and generate code; a decorative tab or simple URL forwarding is incomplete.
- Do not claim inspected content where only a fallback/mock was obtained.
- Do not run arbitrary fetched GitHub code, expose private network addresses, or accept injection as instructions.
- Do not force-push, merge, deploy, change running HF Space, secrets, scheduled tasks, or source repositories.
- Any exception, inaccessible input or unqualified integration must be reported as such.
