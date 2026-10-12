# Qidolab 1.1 — production source

Target domain: https://qidolab.com/

中文版上线教程：[Qidolab 上线步骤](DEPLOYMENT.zh-CN.md)。

This repository contains the complete static site: 18 original puzzles, optional extra steps, extreme challenges and English, Simplified Chinese, Taiwan Traditional Chinese and Spanish interfaces. All runtime scripts, styles and logos use local relative paths. No installation or compilation is needed. The entry point is `index.html` at the repository root.

The approved warm-cream theme uses warm charcoal, sage and muted apricot on desktop (980px and wider). Narrow screens retain cream, midnight blue and lake blue. The appearance comparison preview remains in the personal-site repository at https://stephenjia.com/qidolab-preview/?palette=cream; its controls are not loaded by this production page.

## Cloudflare Pages deployment from GitHub

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

## Local preview

From the repository root, run `python3 -m http.server 8080` and open http://localhost:8080/. Use an HTTP server because browsers load the game's ES modules through HTTP.

## Languages

First-time visitors start in English. The language menu includes English, 简体中文, 繁體中文 (`zh-TW`, Taiwan usage), and Español. A valid saved preference remains in use on return visits. Taiwan copy is stored locally in `zh-tw-copy.mjs`, prepared offline from authored text using OpenCC with interface/math terminology edits. The game never loads a conversion library or translation service from a CDN.

## Progress and achievements

Progress is stored in this browser for this origin. Moving from the stephenjia.com preview to qidolab.com starts a separate browser save; it does not automatically transfer previous progress.

- A check marks an original puzzle as solved; a star marks its optional extra step.
- Solving an extreme challenge earns a crown. It can be attempted before the extra step.
- Viewing its answer keeps the crown hollow. Answer exposure alone does not solve the extreme.
- A title and its marks turn gold when all three challenges are solved.
- Solving all 18 original puzzles turns the Quidence bridge gold. Its cosmetic handoff does not mark other puzzles as solved.

Question data, solvers and storage-key formats are retained from the reviewed game. Browser visual QA and mainland-China access testing still require real devices/networks.

## Source provenance

The initial standalone source is copied from the `qidolab/` directory of `SteJ20996/SteJ20996.github.io` at commit `39aa0958696cc9ad93eca41487cebac41afca184`. Runtime files are preserved byte for byte; this README is updated for root-level deployment. Earlier development history remains in the original repository: https://github.com/SteJ20996/SteJ20996.github.io/commits/main/qidolab/.

The existing preview at https://stephenjia.com/qidolab/ remains available. Future production updates belong in this standalone repository.
