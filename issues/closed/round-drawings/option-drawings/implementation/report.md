# Report: option-drawings

Serial-solo run (plan names one unit). Docs-only leaf; no workers, no test files.

## Changed files and reasons

- `skills/chart-issues/assets/questions.md`
  - Template outer fence ` ``` ` → ` ```` ` (D1): an inner ` ```text ` drawing block cannot close a 4-tick fence (CommonMark: a closing fence may not carry an info string), so the template still renders as one block.
  - Drawing example under question 1's options (D6): ` ```text ` block between the `- **1b**` bullet and `How to choose`, two captioned panels side by side, max line width 48 columns.
  - "Every round uses this shape" paragraph: drawing rule sentence (when: visible/followed difference + much easier; where: one fenced text block after option bullets, before How to choose; form: one per option captioned with option code, side by side under ~60 columns else stacked; replaces no required part; same rule in autopilot rounds) (D2).
  - Pre-send read sentence: appended "including any drawing block" (D9 fallback taken — naming the block at the read site is safer than relying on "these rules").
  - Fork-record sentence: "and keeps the chosen option's drawing verbatim beside them" (D4).
  - Signposts exception sentence: "and may carry drawings under the same test" (D3).
- `docs/use/plan-work.md` — one sentence in "Answer one fork per round" (D5): "A question whose options look different comes with a small drawing of each when the drawings make the choice much easier."

## Proof commands run

- `check c2-template-block: 0` (`implementation/check-c2-template-block-1793795813990-3506738.log`, head 30b7d737): extraction at the 4-tick fence reaches `Challenge check`, exactly one ` ```text ` inside the template, and it opens before `How to choose`. Proves criterion 2's render-as-one-block and placement clauses.
- `check c2-block-width: 0` (`implementation/check-c2-block-width-1793795816993-3507390.log`, head 30b7d737): every line in the drawing block ≤60 columns. Proves criterion 2's width clause.
- `check c1-c3-rule-text: 0` (`implementation/check-c1-c3-rule-text-1793795819591-3507879.log`, head 30b7d737): all six rule clauses present (autopilot, signposts exception, verbatim keeping, captioning, replacement, pre-send read). Aid for criteria 1 and 3 — the prose meaning is for B's review read.
- `check c4-plan-work-sentence: 0` (`implementation/check-c4-plan-work-sentence-1793795819695-3507944.log`, head 30b7d737): the section carries the "much easier" sentence. Aid for criterion 4.
- `check c5-only-named-files: 0` (`implementation/check-c5-only-named-files-1793795817092-3507504.log`, head 30b7d737): `git --no-pager diff --name-only 5499e3da...HEAD` lists only the two named files and the tree is clean. Proves criterion 5.

Planning reds recorded in `plan.md` (premature-close, overwidth, stray-file) all reproduce against the final commands' failure shapes.

## Checks

- `akrogon verify` on head 30b7d737: first run **red** — `tests/run-units.test.ts` "a verify pass survives its caller being SIGKILLed mid-check" (log `check-test-1793795899771-3508501.log`); `format` and `typecheck` green.
- Retry protocol: targeted rerun passed (`check retry-sigkill-test: 0`, `check-retry-sigkill-test-1793795913423-3876389.log`), then the full configured `test` check passed (`check test: 0`, `check-test-1793796047575-3910185.log`, 1309 pass / 0 fail). **Inconsistent**: the flaky SIGKILL-survival test has no cause in a docs-only diff; recorded as inconsistent with both logs.
- `akrogon verify` rerun on the same head 30b7d737: **green** (receipt `verify leaf 30b7d7378338f0e2685d9f255cd5cb9f787aee8a: green`).

## Base and head

- Base (`AKROGON_BASE`): `5499e3dab209ccc6fae14c8f4568e62e5c4c15c2`
- Committed head: `30b7d7378338f0e2685d9f255cd5cb9f787aee8a` — "chart door: drawing rule for round questions with visibly different options", 2 files.
- Refresh: `git fetch origin` + rebase onto `origin/main` — already up to date; no branch move.

## Decision notes

- D8: design pick 2's "about 80 columns" vs adopted correction's 60 — 60 governs; noted for review.
- D9: fallback taken — the pre-send read sentence names "any drawing block" explicitly rather than relying on "these rules".
- D3: the design's "one word" was realized as a short clause "and may carry drawings under the same test" since a bare word cannot carry the "same test" condition.

## Known limitations

- Prose criteria (1, 3, 4) are observed by review read, not by command — per the standing design's no-vanity-tests rule. The grep aids above confirm clause presence, not reader comprehension.
- The stacked-form drawing layout is shown only in prose; the template example demonstrates the side-by-side form only (design shows one such block; both forms described in the rule sentence).
- Inconsistent `run-units` SIGKILL test noted above; no code change in this leaf.
