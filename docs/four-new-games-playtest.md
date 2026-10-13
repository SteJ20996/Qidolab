# Four additional Just One More concepts — playable review build

2026-10-13. User requested development of the remaining four ideas after approving the first two. This branch introduces `/next/` as a standalone preview; it does not add unfinished concepts to the production menus or merge them automatically.

## Playable scope

- **After You / 遲到一步 (JOM-01):** choose A or B, play an unused operation, then resolve the previous pending echo. Current action precedes the old echo; the new echo targets the other dial. The final echo is resolved automatically before victory. The latest turn shows separately labelled, staggered phases; undo restores the entire turn, including its pending echo. Invalid turns are atomic and consume nothing.
- **Mixed Signals / 線索串台 (JOM-02):** recover a four-digit distinct code from 0–5 and assign four shuffled inclusive feedback pairs to their given guesses. Selecting a feedback card then a guess row assigns it, swapping an already used card when needed. Identical-valued feedback cards are interchangeable. Both the code and every assignment must match on submission. Leading zero, paste, editable drafts, undo and optional help are supported.
- **Two-Way Tally / 橫豎兩筆帳 (JOM-03):** fixed 3×3 cells each contribute one visible number to a row and the other to a column. Flipping swaps the contributions. Six explicit edge sums must simultaneously match. Direction arrows and accessible labels distinguish contributions without relying on colour.
- **Both Ways / 反著也得通 (JOM-04):** click operation cards into a shared strip; A reads forward and B backward. Removing a placed card returns it to the pool, and undo restores the previous arrangement. Partial paths are labelled previews, invalid intermediate values are shown, and only a complete legal strip can win. Reversing card order does not invert the operations.

Each game has ten independently generated fixed rounds, four-language UI and five-step animated independent examples. Numeric games use exact integers in 0–99; division must be exact. No time limit. Local progress, separate tutorial dismissal, undo, restart, optional hints and full solutions are included. No accounts, analytics or automatic feedback submission.

## Verification

`node docs/research/create-four-rounds.mjs` deterministically reproduces the fixtures. Every operation order/side assignment, all 512 tile orientations and all 360 candidate codes are exhaustively checked as applicable. Tally, Both Ways and Mixed Signals fixtures each have one solution; all valid Echo routes are accepted.

`tests/four-new.test.mjs` tests the generators' fixtures, rule edge cases, inclusive feedback, duplicate-feedback equivalence, all 40 rounds through all four UI languages, assistance, replay isolation, reload, invalid storage, input/paste, and undo of echoes/flips/placements/assignments. Existing four-game tests also run because the reusable tutorial controller now accepts optional lesson/scene extensions; its default four-game behaviour stays intact.

The wording and rules are independently implemented from our concept notes. No external game code, question bank, visual asset or animation was imported. This is not a claim of global originality or exclusive ownership of the mechanics; the earlier similarity-review limits remain. These are ten fixed rounds per game, not yet endless generators. Difficulty labels are provisional and enjoyment needs player feedback.
