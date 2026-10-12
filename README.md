# Qidolab 1.1 — production source

Target domain: https://qidolab.com/

中文版上线教程：[Qidolab 上线步骤](DEPLOYMENT.zh-CN.md)。

This repository contains the complete static site: 18 original puzzles, optional extra steps, extreme challenges and English, Simplified Chinese, Taiwan Traditional Chinese and Spanish interfaces. All runtime scripts, styles and logos use local relative paths. No installation or compilation is needed. The entry point is `index.html` at the repository root.

The warm-cream theme uses warm charcoal, fresh emerald panels, mint controls and muted apricot on desktop (980px and wider). Narrow screens retain cream, midnight blue and lake blue. The earlier appearance comparison preview is archived in the original repository's history; its controls are not loaded by this production page.

## Cloudflare Workers deployment from GitHub

The current "Set up your application" dashboard screen creates a Worker. This repository includes `wrangler.jsonc` to serve the root directory as static assets and `.assetsignore` to exclude deployment tooling and documentation from public assets. No server-side Worker script is required.

Use these settings for that screen:

| Setting | Value |
| --- | --- |
| Repository | `SteJ20996/Qidolab` |
| Project name | `qidolab` (lowercase; matches `wrangler.jsonc`) |
| Production branch | `main` |
| Build command | Leave empty |
| Deploy command | `npx wrangler deploy` |
| Preview command | `npx wrangler preview` (keep the current dashboard default) |
| Enable Preview builds | On |
| Protect with Cloudflare Access | Off |
| Advanced settings → Path | `/` (repository root) |
| API token | Create new token |
| API token name | `qidolab-deploy` |
| Variables | Leave empty |

After deployment succeeds, test the provided `.workers.dev` address. Add `qidolab.com` from the Worker's **Settings > Domains & Routes > Add > Custom Domain**. Cloudflare manages the DNS record and certificate. Follow the Chinese guide for the detailed steps.

Updates to the linked `main` branch deploy automatically. `_headers` retains the site's cache and ES-module response headers.

Workers references:

- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/workers/static-assets/binding/
- https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/

## Alternative: Cloudflare Pages

Create a new Pages project with Git integration. Use these settings:

| Setting | Value |
| --- | --- |
| Repository | `SteJ20996/Qidolab` |
| Production branch | `main` |
| Framework preset | `None` |
| Root directory | Leave empty (repository root) |
| Build command | `exit 0` |
| Build output directory | `.` |

Create the Pages project from Cloudflare's account-level Workers & Pages area. A domain's Overview page has different navigation, so return to the account level first when needed. Select Pages and Git integration, authorize access to `SteJ20996/Qidolab`, and use the settings above.

After the first deployment succeeds, test the provided `.pages.dev` address. Then open the project's **Custom domains**, add `qidolab.com`, and follow Cloudflare's DNS setup. The domain is registered with Cloudflare. Wait until the custom domain and HTTPS are active before announcing the domain.

GitHub updates to this repository's `main` branch can then deploy through the linked Pages project. `_headers` gives ES modules a JavaScript content type and makes browsers revalidate updated files. No environment variables are needed.

Official references:

- https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
- https://developers.cloudflare.com/pages/configuration/build-configuration/
- https://developers.cloudflare.com/pages/configuration/custom-domains/

## Qidoball · Echo Court

Play the entertainment game at https://qidolab.com/qidoball/ once this revision is deployed. It includes endless solo play, same-side cooperation, wall practice and local two-player duels, with English, Simplified Chinese and Taiwan Traditional Chinese interfaces.

The five files in `qidoball/` are self-contained static assets. Visitors need no account; scripts, styles, icons and sound use no external runtime service, CDN or remote font. The game uses the same existing Cloudflare deployment as Qidolab. Regional and institutional firewall access still depends on the visitor's network.

This release copies the reviewed Echo Court source at commit `3989645d28ea499180ccbda7687d27245526089c`, including the compact racket and reachable back-court baseline. Later game updates should replace the five files together to keep the rendering and physics versions aligned.

## Local preview

From the repository root, run `python3 -m http.server 8080` and open http://localhost:8080/. Use an HTTP server because browsers load the game's ES modules through HTTP.

## Languages

First-time visitors start in English. The language menu includes English, 简体中文, 繁體中文 (`zh-TW`, Taiwan usage), and Español. A valid saved preference remains in use on return visits. Taiwan copy is stored locally in `zh-tw-copy.mjs`, prepared offline from authored text using OpenCC with interface/math terminology edits. The game never loads a conversion library or translation service from a CDN.

## Progress and achievements

Progress is stored in this browser for this origin. Progress saved on an earlier stephenjia.com preview does not automatically transfer to qidolab.com.

- A check marks an original puzzle as solved; a star marks its optional extra step.
- Solving an extreme challenge earns a crown. It can be attempted before the extra step.
- Viewing its answer keeps the crown hollow. Answer exposure alone does not solve the extreme.
- A title and its marks turn gold when all three challenges are solved.
- Solving all 18 original puzzles turns the Quidence bridge gold. Its cosmetic handoff does not mark other puzzles as solved.

Question data, solvers and storage-key formats are retained from the reviewed game. Browser visual QA and mainland-China access testing still require real devices/networks.

## Source provenance

The initial standalone source is copied from the `qidolab/` directory of `SteJ20996/SteJ20996.github.io` at commit `39aa0958696cc9ad93eca41487cebac41afca184`. Runtime files are preserved byte for byte; this README is updated for root-level deployment. The historical source is available at https://github.com/SteJ20996/SteJ20996.github.io/tree/39aa0958696cc9ad93eca41487cebac41afca184/qidolab/.

Qidolab source and deployment documentation now live exclusively in this standalone repository. The `qidolab/` and `qidolab-preview/` copies have been removed from the personal-site repository's current branch, and their former stephenjia.com preview addresses are retired. Publish this repository through Cloudflare using the matching Workers or Pages settings above.
