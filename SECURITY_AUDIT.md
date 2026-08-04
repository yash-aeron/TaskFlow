# TaskFlow Security & Bug Audit Report

**Target**: `C:\Users\aeron\Documents\antigravity\delightful-einstein` (TaskFlow — Electron 31 / React 18 / Vite 5)
**Methodology**: OWASP-aligned review using `mukul975/Anthropic-Cybersecurity-Skills` (performing-web-application-penetration-test, testing-for-xss-vulnerabilities, exploiting-prototype-pollution-in-javascript, implementing-semgrep-for-custom-sast-rules, performing-sca-dependency-scanning-with-snyk) + manual code review + `npm audit`.
**Date**: 2026-08-04

**Good news first**: The codebase already received a prior security pass (commit `e60a90a` "Security Audit Fixes") — Electron hardening is largely correct:
- `contextIsolation: true`, `nodeIntegration: false` on all windows
- `setWindowOpenHandler(() => ({ action: 'deny' }))` + `will-navigate` interceptors
- IPC payload validation (task shape, date regex, prototype-pollution keys, Number coercion)
- Import sanitizer with whitelist/denylist in `storage.js`
- No `dangerouslySetInnerHTML`, `eval`, `innerHTML`, `document.write` anywhere in `src/`
- React default output escaping protects task titles/descriptions from stored XSS

---

## FINDING 1 — Critical: `node-tar` Decompression DoS (GHSA-23hp-3jrh-7fpw)

- **Severity**: Critical (CWE-770, CVSS ~7.5+)
- **Location**: `node_modules/tar` (transitive via `electron-builder` 24.x → `app-builder-lib`)
- **Affected**: `tar < 6.2.1` — package-lock resolves tar 6.x vulnerable version
- **Impact**: Malicious/compromised archive fed to the build toolchain can cause unbounded resource consumption (decompression/parse DoS). Build-time only, but any CI/CD or packaging pipeline is exposed.
- **Remediation**: `npm audit fix` — upgrades `electron-builder` to 26.15.3 (semver-major bump) which pulls patched `tar`.

## FINDING 2 — High: Electron 31.7.7 has 20+ known CVEs (GHSA-vmqv-hx8q-j7mg, GHSA-xj5x-m3f3-5x3h, GHSA-r5p7-gp4j-qhrx, GHSA-3c8v-cfp5-9885, GHSA-532v-xpq5-8h95, GHSA-8337-3p73-46f4, GHSA-jjp3-mq3x-295m, GHSA-9wfr-w7mm-pc7f, GHSA-9w97-2464-8783, GHSA-mwmh-mq4g-g6gr, ...)

- **Severity**: High (several CWE-416 use-after-free, CWE-88 command-line injection, CWE-290 IPC spoofing)
- **Location**: `electron ^31.7.7` (direct dependency, shipped runtime)
- **Impact**: Use-after-free in WebContents/PowerMonitor callbacks, renderer command-line switch injection, service-worker spoofing of `executeJavaScript` IPC replies. Exploitable primarily when rendering untrusted web content; lower risk here because the app only loads bundled local files, but the runtime should not ship with known CVEs.
- **Remediation**: Upgrade `electron` to current supported major (advisory fix suggests 43.x). Note: Electron 31 is EOL — no more security backports.

## FINDING 3 — High: Vite dev server path traversal / fs bypass (GHSA-fx2h-pf6j-xcff, GHSA-4w7w-66w2-5vf9)

- **Severity**: High (CWE-22, CWE-200)
- **Location**: `vite ^5.4.14` (resolves 5.4.21) + transitive `esbuild 0.21.5` (GHSA-67mh-4wv8-2f99 — dev-server request smuggling)
- **Impact**: In dev mode (`npm run dev` / `electron:dev`), any website visited in the same browser can send requests to the Vite dev server on localhost:5173 and read responses (esbuild advisory), and `server.fs.deny` bypass on Windows alternate paths allows reading files outside the project root. Exposes local source files. Dev-only, but real — it's the default dev workflow.
- **Remediation**: Upgrade `vite` to patched 5.x line (`^5.4.21+` → actually needs the latest 5.4.x with the fix; advisory fix points to vite 8.x but a 5.4.x patch release exists for the fs.deny bypass — pin `^5.4.21` and re-audit). Add `server: { fs: { strict: true }, cors: false }` to `vite.config.js`.

## FINDING 4 — Medium: No Content-Security-Policy anywhere (defense-in-depth gap)

- **Severity**: Medium (OWASP WSTG-CONF-12 / CSP)
- **Location**: `index.html`, `today.html`, `habits.html`, `quickadd.html`, `timer.html` — zero CSP meta tags; Electron loads these via `loadFile` (file://) with no `session.defaultSession.webRequest.onHeadersReceived` CSP injection.
- **Impact**: No defense-in-depth against XSS in renderer processes. React's default escaping currently blocks injection, but one `dangerouslySetInnerHTML` or a future `v-html`-style sink removes the safety net. Also Google Fonts are loaded from external CDNs (`fonts.googleapis.com`, `fonts.gstatic.com`) with no integrity/SRI — a supply-chain vector if the CDN is compromised.
- **Remediation**:
  ```js
  // in main.cjs, on app ready:
  session.defaultSession.webRequest.onHeadersReceived((details, cb) => {
    cb({ responseHeaders: { ...details.responseHeaders,
      'Content-Security-Policy': ["default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'"] } });
  });
  ```
  Or add `<meta http-equiv="Content-Security-Policy" content="...">` to each HTML entry.

## FINDING 5 — Medium: `sanitizeString` is a regex denylist — bypassable if ever used on rendered output

- **Severity**: Medium (CWE-79 logic gap, defense-in-depth)
- **Location**: `src/utils/storage.js:141-148`
- **Issue**: `sanitizeString` strips `<script>` tags, `on\w+="..."` handlers, and `javascript:` via regex. Classic denylist weaknesses: it misses encoded forms (`&#60;script&#62;`, `\u003cscript\u003e`), mixed-case/unquoted event handlers, `onerror=alert(1)` without quotes, `<svg/onload=...>`, `<details open ontoggle=...>`, and markup split across whitespace/newlines. Today this is *not* exploitable because the data flows into React state and is rendered with `{task.title}` (auto-escaped) — but the sanitizer gives false confidence: if any consumer later uses `dangerouslySetInnerHTML` or a DOM API, stored XSS becomes reachable.
- **Remediation**: Replace with a real whitelist sanitizer (`DOMPurify` with `ALLOWED_TAGS: []` / `ALLOWED_ATTR: []`, i.e. plain-text extraction) or drop sanitization entirely and rely on React escaping for all render paths. Also note `importData` keeps `createdAt`/`completedAt` as arbitrary strings — harmless now, but they flow into `new Date(...)` parsing in some views.

---

## FINDING 6 — Medium (bug): `sync-data` IPC trusts the renderer for the *entire* task/habit corpus

- **Severity**: Medium (logic/trust-boundary, CWE-345)
- **Location**: `electron/main.cjs:269-281` + `src/App.jsx:116-120`
- **Issue**: The renderer pushes its whole `{ tasks, habits, themeMode }` state up via `sync-data` and the main process stores it verbatim (only array/string type checks). The widgets' preload (`widgets/preload.cjs`) exposes `get-tasks`/`get-habits` and every widget page is a renderer that can call any exposed channel. `themeMode` is only checked to be a string — an attacker-controlled renderer (e.g. via the Finding 4/5 gaps) could set `themeMode` to a huge string or inject junk into the persisted DB. With `contextIsolation` + no remote content this is low-likelihood, but the main-process state is shared across all windows, so a compromised widget renderer poisons the main app state and the on-disk DB.
- **Remediation**: Validate `themeMode` against the allowlist (`['nerv','persona']`) in `sync-data`, and apply the same task-shape whitelist used in `add-task` to `sync-data` payloads (or drop `sync-data` and route all mutations through the validated handlers).

## FINDING 7 — Low (bug): `loadDb` / `sync-data` race on startup; localStorage and disk DB can disagree

- **Severity**: Low (correctness, data-integrity)
- **Location**: `src/App.jsx:71-85`, `electron/main.cjs:37-43`, `src/utils/storage.js`
- **Issue**: On startup the renderer hydrates from `localStorage` first, then async `loadDb()` overwrites tasks/habits — but only if `db.tasks.length > 0`. If the disk DB is the source of truth and is *empty* (user deleted everything), the stale localStorage copy wins and "deleted" tasks reappear on relaunch (the inverse of the retention fix in commit `f6503a5`). Also `syncData` fires on every state change and `saveDb()` writes synchronously on every event — no debounce, so rapid toggles can interleave writes.
- **Remediation**: Pick one source of truth (disk DB when running under Electron; localStorage in browser dev), and debounce `syncData`/`saveDb` (e.g. 300ms) to avoid write amplification.

---

## Verified-Clean Checklist (tested, no issue found)

| Area | Result |
|---|---|
| `contextIsolation` / `nodeIntegration` / `sandbox` posture | ✅ Correct on main + widget windows |
| `window.open` / navigation control | ✅ Denied + intercepted |
| `dangerouslySetInnerHTML`, `eval`, `innerHTML`, `document.write` | ✅ None in `src/` |
| Stored XSS via task/habit titles (React escaping) | ✅ Safe |
| Prototype pollution (`__proto__`, `constructor`, `prototype` keys) | ✅ Blocked in `toggle-habit` + `importData` |
| IPC `add-task` / `toggle-task` / `toggle-habit` / `log-focus` validation | ✅ Validated (types, regex, Number coercion) |
| Import whitelisting (`importData`) | ✅ Field-level allowlists |
| Hardcoded secrets / API keys / tokens | ✅ None found |
| `shell.openExternal` / child_process / RCE sinks | ✅ None present |
| CSP | ❌ Missing (Finding 4) |

## Priority Remediation Order

1. **Upgrade toolchain** — `electron` to supported major, `electron-builder` to 26.x, `vite` to patched 5.4.x (kills Findings 1–3, the only Critical/High items)
2. **Add CSP** (Finding 4) — cheap, big defense-in-depth win
3. **Harden `sync-data`** (Finding 6)
4. **Replace regex sanitizer** with DOMPurify plain-text mode (Finding 5)
5. **Fix startup hydration race** (Finding 7)

*Audit performed with skills from `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). This is a self-audit of the local codebase; no external systems were tested.*

---

## Remediation Applied (2026-08-04)

| # | Finding | Status | What was done |
|---|---|---|---|
| 1 | node-tar critical (GHSA-23hp-3jrh-7fpw) | ✅ Fixed | `electron-builder` 24.13.3 → 26.15.3 → `tar` 7.5.22 (patched) |
| 2 | Electron 31 EOL, 20+ CVEs | ✅ Fixed | `electron` 31.7.7 → 43.2.0 (current supported major) |
| 3 | Vite dev-server fs-bypass / esbuild smuggling | ✅ Fixed | `vite` 5.4.21 → 8.2.0 (rolldown; esbuild removed); `server.cors: false`, `server.fs.strict: true` in vite.config.js |
| 4 | No CSP | ✅ Fixed | CSP meta injected into all 5 HTML entries at build time via `inject-csp` plugin (`default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'`) |
| 5 | Regex denylist sanitizer | ✅ Fixed | `storage.js` now uses DOMPurify whitelist mode (`ALLOWED_TAGS: []`, `ALLOWED_ATTR: []`) — plain-text extraction, not bypassable |
| 6 | `sync-data` trusts renderer | ✅ Fixed | `main.cjs` adds `sanitizeTask`/`sanitizeHabit` whitelists (shared with `add-task`); `themeMode` validated against `['nerv','persona']` |
| 7 | Hydration race / no debounce | ✅ Fixed | `App.jsx`: disk DB is single source of truth in Electron; sync gated on `hydratedRef` (can't clobber DB with initial empty state); 300ms debounce on `syncData` |

**Verification**: `npm audit` → **0 vulnerabilities** (was 11). `npm run build` → clean. App smoke-tested under Electron 43.2.0 — ran 50s with no errors.
