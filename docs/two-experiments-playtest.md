# Two arithmetic games — playtest and release record

2026-10-13. The user asked to try JOM-05 and JOM-06 before deciding whether to include them. Initial work was isolated at `/playtest/`. After reviewing the animated guides, the user approved merging and going live on 2026-10-13. The production entry is `/2/experiments/`; it reuses the tested renderer and engines, and all four games now share a navigation menu. Old preview links remain valid.

## What is playable

- Patch the Past: six independently generated fixed puzzles. Replace one original operation; both starting values run the same amended strip. Both endpoints and one intermediate checkpoint must match. Each puzzle has exactly one valid replacement. Rounds 4–6 deliberately include other replacements that match both endpoints but fail the checkpoint. Each attempt replaces only one original step; attempts never stack repairs. Undo restores the previous attempt.
- Borrow & Return: six fixed puzzles with one to three operation cards. Each card, borrowing and returning must be used exactly once; returning must follow borrowing. All legal orders are accepted. Multiplication changes the current number, never the borrowed principal. A matching number with debt or unused actions is not a win. Hint search starts from the player's current state and reports a dead end honestly.
- Intermediate values are exact integers from 0 to 99. Non-exact division, negative results and values above 99 are rejected. Invalid borrow actions consume nothing; invalid patch attempts remain visible with explicit feedback.
- Four independently authored locale sets, reversible moves, restart, optional help, round navigation and separately namespaced local progress. No analytics or feedback is sent; the footer asks the user to comment back in chat.

## Validation and limits

The solver enumerates all single replacements and all legal borrow/card orders. Nine automated checks validate fixtures, checkpoint rejection, accounting, illegal operations, every round through all four UI languages, undo, reload, hints and storage failures. Fixed rounds were selected to include different operation counts, division and different borrowing/returning positions. This demonstrates solvability and correct judging, not that either game is enjoyable or sufficiently different from existing arithmetic puzzles. Difficulty labels are provisional. There is no endless generator in this preview.

These prototypes were implemented in this repository from the earlier concept descriptions, without importing a third-party game, question bank, artwork, text or source code. They use the pre-existing Qidolab logo and system fonts. Working titles and abstract arithmetic mechanics are not presented as globally original or exclusively owned; the earlier rights-review limits still apply.

## Feedback to seek

Can the player explain the rule without reading it twice? Does the checkpoint change how they think? Does borrowing create an interesting timing choice beyond ordinary operation ordering? Do rounds 4–6 invite another attempt? Only decide on formal integration after the user's playtest.

## Guided demos (2026-10-13)

All four Just One More games now have a first-visit, five-step animated walkthrough: Make 24, Crack the code, Patch the Past, and Borrow & Return. Each uses an independent example, with four-language text, back/next, skip, animation replay, and a permanent reopen button. Demos never modify puzzle moves, guesses, assistance flags, or completion. Dismissal is remembered per game on this browser; blocked storage still permits playing. Reduced-motion preferences show the same information without animation.

Patch explicitly explains shared operations, replacement versus addition, checkpoints, both targets, and restarting each attempt from the original strip. Code guessing distinguishes total correct digits from correctly placed digits. Chinese warm-up labels now use 热身 / 熱身.

Release authorized on 2026-10-13 after the user approved this version. The six-concept list includes four unimplemented proposals (JOM-01 through JOM-04); the release contains the existing two games plus JOM-05 and JOM-06, for four playable games total.
