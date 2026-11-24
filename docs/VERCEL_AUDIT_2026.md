# HomeCraft — Vercel configuration audit (2026-11-24)

## Evidence and access boundary
- Vercel account tab `https://vercel.com/kno-flow/home-craft` was read through the connected browser in read-only mode.
- It displays team **kno-flow / Hobby**, project **home-craft**, production domain `home-craft-omega.vercel.app`, production branch `main` and preview branches `demo-homecraft` and `concept/homecraft-kitchen-os-2026`.
- The user's own browser confirmed the white screen has been fixed after the base path correction.
- Authenticated Vercel API connector returns an empty project list for kno-flow and 404 for home-craft; it does **not** grant reliable access to actual project settings. Do not report console settings as read unless verified in the browser.
- Main `vercel.json`: root Vite build with `--base=/`, `dist` output, `npm ci`. GitHub Pages continues to use `vite.config.ts` base `/HomeCraft/`. Both must remain independent.

## Changes proposed in this PR, not yet in production
1. Add low-risk headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Permitted-Cross-Domain-Policies: none`. Do not add strict CSP until all scripts, images and service workers have been audited.
2. Verify that the Vercel bundle resolves real JS/CSS files, has PWA icons and service worker, and does not accidentally use GitHub Pages prefixes.
3. Add a dedicated PR GitHub Actions check. It does not deploy.

## Manual dashboard review pending (requires same Vercel account as browser)
| Category | Evidence | Recommendation |
| --- | --- | --- |
| Team/plan | Hobby in browser | Stay Hobby for noncommercial tests, no Pro or paid add-ons |
| Domain | home-craft-omega.vercel.app shown | Keep stable production alias; no paid custom domain yet |
| Git | GitHub repository linked and previews shown | Keep `main` as production; separate PR previews |
| Build | root Vite config committed to GitHub | Confirm Dashboard > Settings > Build and Deployment does not override `vercel.json`; install npm ci, output dist |
| Preview protection | Not verified | For demos: prefer authenticated preview access or share individual limited URLs; inspect Deployment Protection before making them public |
| Production protection | Not verified | Leave publicly accessible only if intended; test in logged-out browser |
| Environment variables | Not verified | No API secrets appear necessary for current static Vite app; do not add any until used |
| Observability | Dashboard overview showed 0% recent error rate and 6 CDN requests in a short window | Too little data for reliability verdict. Use browser tests and build logs; avoid enabling paid analytics automatically |
| Security | Headers proposed in PR | Test before release. Do not enable strict CSP without an asset review |
| PWA/offline | Existing app/public/sw.js and manifest | Check offline and update behavior on Safari; test older cache when changing deployment |
| Release | Auto Git deploys apparent | Prevent accidental merge to main; require PR review and green CI via GitHub branch protection if available |
| Rollback | Dashboard shows Instant Rollback | Avoid using without incident and explicit authorization |

## Minimal acceptance before deployment approval
- [ ] CI PASS on PR
- [ ] Preview URL opens in Safari and Chrome, with JavaScript, CSS and icons loaded
- [ ] 320/390/430px screens, four modules, app routing and storage sanity
- [ ] Fresh install plus update of installed PWA after service worker upgrade
- [ ] No log-in or protection loop on intended publicly shareable URLs
- [ ] Human authorizes merge to main

**Do not claim that this audit changed Vercel dashboard settings.** Review was read-only. This PR does not deploy or merge automatically.
