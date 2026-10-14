# Corrected external review — 2026-10-14

Baseline: `a958070931fae47b5b34c556eaf4d8f076b485df`. These changes implement accepted findings, not every original recommendation.

| Review items | Implemented |
| --- | --- |
| 1, 10 | Four-language privacy/local-progress page and footer links on all public game entries. Describe browser storage, deletion limits, Cloudflare delivery, contact and self-check scope without inventing a log-retention period or a progress-backup feature. |
| 8 | Script CSP with exact inline/importmap hashes, self-only frames and SAMEORIGIN. A generator and test detect stale hashes. Inline styles remain allowed because game layouts use them. |
| 14 | Traditional conversion table requested only when Traditional Chinese is needed. Initial load waits safely; failed loading keeps a usable language and a retry message; newer language choices win over slow earlier requests. |
| 15, 16 | White coin-control labels on a solid dark green background, 13px coin/tab labels, and larger secondary instructions while retaining the existing palette. Disabled controls retain their separate state. |
| 19, 20 | Taiwan Undo wording uses 復原. Default homepage text and accessible labels are English before JavaScript; explicit source keys preserve four-language switching. Dynamic jug labels, restored move counts, feedback and hint labels remain owned by the game renderer. |
| 21, 24 | Direct language URLs, language-specific canonical/alternate links, sitemap entries and differentiated page titles/descriptions for the four public collections. These improve discoverability; they do not guarantee indexing. Hash game routes are preserved. |
| 22 | Qidoball language names use English / 简体中文 / 繁體中文. Its Spanish scope remains unchanged; the reserve game is not added to the sitemap. |
| 23, 28, 29 | Preserve all ten confirmed English/Spanish sentence boundaries; clean the prototype footer and supply the missing deployment guide. The prototype keeps noindex. |

## Checks

Run `npm ci --ignore-scripts`, `npm run build:metadata`, `npm run build:headers`, then `npm test`. Existing suites cover game mathematics, all forty newer rounds, hints, undo, language changes and saved progress. Added checks cover static English, sentence boundaries, CSP hashes, language URL/canonical consistency, slow language changes and unavailable Traditional copy. Browser preview verification caught an initial-translation overwrite of restored move counts and feedback; the correction is covered by cold-start and late-translation assertions.

## Conditions retained

- Cache-Control remains `max-age=0, must-revalidate`; revalidation can reuse content. Import maps and mutable dependencies are not assigned one-year immutable caching.
- No claim about production HSTS or hosting log retention is made. Direct header requests from the review environment returned 403; deployment responses must be verified separately.
- Names such as Think Again! / Make 24 are not changed solely because another work has a similar name. Existing mobile navigation retains card-to-game scrolling; a full layout redesign is not silently introduced.
- No account system is enabled. No existing local progress keys, game definitions or mathematics are changed.
- Native macOS/Safari, speech-control tools and real production load are outside the automated checks.
