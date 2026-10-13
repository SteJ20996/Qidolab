# Qidolab 2: implementation and rights review

Reviewed 2026-10-13. Scope: the new `/2/` collection, not a clearance audit of the older site.

## Sources and implementation

- `2/engine.mjs`, `2/app.mjs`, `2/copy.mjs`, `2/style.css`, and `2/index.html` were written for this change. No third-party game source, puzzle database, instructions, screenshots, sound, card art or commercial board layout was imported.
- The arithmetic activity uses the abstract rule of combining four numbers with arithmetic to reach 24. Its interface uses Qidolab's own visual system, selectable number tiles, an ordered pair and a separate operation row. It does not reproduce a branded commercial card face.
- The code activity uses digit membership and position counts. Its instructions and examples were written for Qidolab in four languages. It uses numerical totals and a guess table, not another publisher's named product or branded board.
- The ten starter number sets and ten starter codes were selected in this change and checked by the engine. Free arithmetic puzzles are randomly generated, checked with exact rational arithmetic, and rejected if unsolvable. Codes are generated from permutations of digits. No external question bank is used. Simple numerical combinations can naturally coincide with puzzles elsewhere.
- Free play means no limit on requesting another puzzle; the pool of possible combinations is finite. The immediately previous combination is excluded, but older combinations may recur. A bounded fallback uses one of our verified starter sets if random generation repeatedly fails.
- Only pre-existing repository assets `assets/qidolab-lockup.svg` and `assets/favicon.svg` are referenced. This change does not independently establish ownership of these existing Qidolab assets. Fonts are system fonts; icons use basic mathematical symbols or an inline CSS chevron. No new production dependency or remote asset is added. Existing jsdom is used only for development tests.
- All processing and saved progress stay in the browser. Codes are puzzle answers, not security credentials; source and local storage are inspectable.

## Legal basis and limits

The U.S. Copyright Office distinguishes unprotected ideas, systems and methods of operation from protected expression such as code, text and artwork. This supports implementing the underlying mathematical rules independently; it does not authorize copying another game's implementation or visual expression.

- U.S. Copyright Office FAQ: https://www.copyright.gov/help/faq/faq-protect.html
- U.S. Copyright Office, Circular 33: https://www.copyright.gov/circs/circ33.pdf

Names and branding are a separate issue. USPTO guidance explains that similarity and related goods/services can create confusion. This release retains the user's Qidolab name and uses descriptive activity labels; it does not adopt another game publisher's name, logo, endorsement or affiliation.

- USPTO, likelihood of confusion: https://www.uspto.gov/trademarks/search/likelihood-confusion

This is an implementation/provenance review informed by U.S. primary guidance. It is not a worldwide legal opinion, an exhaustive trademark or patent clearance, or a guarantee of noninfringement. Copyright guidance alone does not resolve trademark, trade dress, patent, contractual or non-U.S. rights. The existing Qidolab brand has not received a new trademark clearance through this change. A formal clearance in intended markets would need qualified legal review if such assurance is required.
