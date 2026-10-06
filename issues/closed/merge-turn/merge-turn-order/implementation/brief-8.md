# Brief: merge-turn-order unit U8 — merge-turn docs and merge-issue skill first-step check

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/merge-turn-order-u8

## 1. Goal

Implement plan decision D9: document the per-repo merge turn and make `akrogon phase <slug> merged --slot B --check` the first act of a merge pass in the merge-issue skill.

Context being documented (locked design, do not re-litigate): each registered repo has one merge turn. The holder is the earliest eligible leaf in `merge` (merge stamp, then last `to: merge` log record, then slug). Only the holder's seat B is prompted; waiting leaves keep tab, panes and `max_active` slot. `akrogon status` names the holder and each waiting leaf's place in a TURN column. For a non-holder leaf in `merge`, `akrogon phase <slug> merged` (with or without `--check`) and `check.fix` are refused naming the holder; `failed` is never refused. After every committed `phase` move and at the end of every `next` pass the command re-sweeps `merge` leaves, so the next holder is prompted without a manual `akrogon next`.

## 2. Acceptance criteria

- AC1 In `skills/merge-issue/SKILL.md`, the first act of a merge pass is `akrogon phase <slug> merged --slot B --check`, with a sentence saying a waiting leaf is refused there naming the current holder before any check or rebase runs. The existing pre-push `--check` paragraph stays (it still validates `Test-Change:` trailers).
- AC2 `docs/guide/merge.md` documents the turn: one holder per repo, order basis, the refusal of `merged`/`check.fix` for waiting leaves, `failed` never refused, and that the command prompts the next holder automatically.
- AC3 `docs/guide/next.md` "How order is decided" names the merge-phase holder rule and the end-of-pass merge sweep.
- AC4 `docs/guide/phases.md` merge row/summary mentions one holder per repo.
- AC5 `docs/guide/limits.md` line ~11 is updated: a completion also wakes the next merge holder (the "only manual `akrogon next`" sentence becomes stale otherwise).
- AC6 `docs/guide/state.md` lists `merge_stamp` among command-owned fields where it describes what Akrogon records.
- AC7 `bun test tests/docs-links.test.ts` passes; no heading anchors or links broken.

## 3. Read-first

- `skills/merge-issue/SKILL.md` (merge section paragraph order), `docs/guide/merge.md`, `docs/guide/next.md`, `docs/guide/phases.md`, `docs/guide/limits.md`, `docs/guide/state.md`, `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Style: plain guide prose, existing voice, no new headings where a sentence in an existing paragraph suffices.

## 4. Change list

- `skills/merge-issue/SKILL.md`: in the `## merge` section, before the existing "Before pushing, commit scoped outstanding changes…" paragraph, add the first-step rule. Keep wording tight, matching the file's style.
- `docs/guide/merge.md`: add the turn paragraph near the top of the merge description; document the refusal and `no merge record` ordering fact only if a place already discusses ordering — keep edits minimal.
- `docs/guide/next.md`: amend "How order is decided" with one or two sentences.
- `docs/guide/phases.md`: merge table row already says "Checks, rebase and push." — extend minimally, e.g. "One leaf per repo holds the merge turn; checks, rebase and push."
- `docs/guide/limits.md`: fix the stale completion claim.
- `docs/guide/state.md`: mention `merge_stamp` in "The fields Akrogon owns" paragraph.

## 5. Do-not

- Do not document batching, solo marks, command-owned push or batch restore — those belong to the merge-batch leaf, not this one.
- Do not restructure files, add sections, or touch README or other skills.
- Do not invent behavior beyond the context paragraph above; exception is a revised brief from A.
- Keep each file's diff under ~15 lines added.

Reasons restated: scope is the turn only; speculative doc text for unbuilt batch behavior would mislead operators and is explicitly excluded by the plan.

## 6. Ordered steps

1. `bun install` in the worktree.
2. Edit `skills/merge-issue/SKILL.md` (AC1).
3. Edit the five guide files (AC2–AC6).
4. Run `bun test tests/docs-links.test.ts` (AC7).
5. Commit as one commit, e.g. `merge turn: docs and skill first-step check`, carrying a `Test-Change: tests/docs-links.test.ts` trailer ONLY if that file itself was changed (it should not be).

Advisory size: 6 files, under 20 turns.

## 7. Commands

- `bun test tests/docs-links.test.ts`

## 8. Done-when, evidence and report

Done when AC1–AC7 hold and the commit exists. Report the commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
