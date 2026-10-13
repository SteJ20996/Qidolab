# Two arithmetic prototypes — playtest only

2026-10-13. The user asked to try JOM-05 and JOM-06 before deciding whether to include them. This branch adds `/playtest/` only; no production menus or existing game modules change. Keep its PR in draft.

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
