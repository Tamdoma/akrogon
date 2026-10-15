# Sub-brief 2: stacked merge turn docs and merge skill

## 1. Goal

Update the operator-facing docs and the merge skill so they describe the stacked merge turn that lands in this leaf (done-criterion 6). You write prose only; the code is implemented in parallel by another unit from the same pinned contract below, so describe exactly this behavior.

Pinned behavior contract (from plan.md D1–D12):

- When a merge turn starts, the holder's batch record snapshots every other unstopped eligible leaf in `merge`, in merge-queue order, as `members` (each `{slug, base, head, tip}`; `tip` set when the stack is applied). A waiting leaf whose head appears in a red `merge-attempts.jsonl` line on the same `built_on` base is skipped until its head changes or the remote base moves.
- `buildStack` rebases the holder onto the remote base first, then each member onto the tip; a member whose rebase conflicts is skipped and stays in `merge` for a later turn. A holder that cannot be rebased mechanically (conflict or dirty worktree) takes a solo turn with nothing stacked.
- The merge prompt is `merge-issue <slug> slot=B phase=merge leaf=<folder> attempt=<id> top=<sha> members=<slug,...>`; `members=` appears only when the stack carries members. `attempt=<id> solo` is unchanged.
- Only the holder's B is ever prompted and only it runs `akrogon verify`; the verify and the trailer/retired-lesson checks cover the whole stacked tree. B makes no in-place repair while the record carries members: `merged --check` and `merged` require the holder's HEAD to equal the recorded `top`, so any commit is refused.
- On green, `merged --attempt <id>` pushes the stack top fast-forward once; each member branch moves to its recorded `tip`, every stacked leaf still in `merge` moves to `merged` (member `issue complete`/`epic complete` lines print as their owners finish), and the holder moves as today. A member whose head changed, left `merge`, or was stopped during the verify refuses the push and the stack is rebuilt (`rerun` line, same restack flow as today).
- A red verify on a stack with members: B's `check.fix --attempt <id>` call does NOT move the leaf to `check.fix`; it records each stacked `{slug, head}` on the base in `merge-attempts.jsonl`, restores the holder's branch to its pre-stack head, prints exactly `stack red; holder turn restarts alone`, and the holder's next turn (alone) starts by itself. B records the red run in `review-B.md` and ends the pass. A red with no members ends as today (`check.fix` to A).
- After a landed push, a crash before the moves is reconciled by the next pass: the pushed candidate's ancestry on the tracking ref proves the stack, and every recorded member still in `merge` is moved to `merged` once, skipping any already moved.
- B gathers the completion owner's briefs of every stacked leaf (each stacked leaf's own issue/epic owner), not only the holder's, before `merged`.

## 2. Acceptance criteria

- `skills/merge-issue/SKILL.md` describes every behavior above: the `members=` prompt, one verify on the stacked tree, no in-place repair on a membered stack, the stacked red ending (`stack red` output, heads recorded, holder-alone restart), the briefs of every stacked leaf, the endings (green push lands all, drift refusal → rerun/rebuild, reconcile moves).
- `src/AREA.md`, `docs/guide/merge.md`, `docs/guide/next.md`, `docs/guide/phases.md`, `docs/guide/state.md`, `docs/guide/files.md` describe the same turn: `phases.md` :14 and `files.md` already mention stacks/members — update `files.md` `members` to "object entries `{slug, head}`; string-slug entries appear only on lines written before this change returned", `state.md` :52 gains `members`, `merge.md` and `next.md` turn paragraphs describe stacking instead of "one leaf at a time" / "rebases its branch", `src/AREA.md` buildStack/batch lines name members.
- `bun test tests/docs-links.test.ts` green.

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `skills/merge-issue/SKILL.md` (the `## merge` section — restructure minimally, keep its style: terse operational prose, one paragraph per rule, exact command lines in backticks).
- `src/AREA.md` (lines about `buildStack`, batch record, merge reconcile).
- `docs/guide/merge.md` (turn + push + red paragraphs), `docs/guide/next.md` :157, `docs/guide/phases.md` :14, `docs/guide/state.md` :52, `docs/guide/files.md` :55-90.
- `git show 6640ab5^:docs/guide/merge.md` and `git show 6640ab5^:skills/merge-issue/SKILL.md` — the old membered wording exists here; reuse its phrasing where it matches the pinned contract (but old docs describe split/culprit/batch_limit — none of that comes back).

## 4. Change list and needed interfaces

Owned paths (only these): `skills/merge-issue/SKILL.md`, `src/AREA.md`, `docs/guide/merge.md`, `docs/guide/next.md`, `docs/guide/phases.md`, `docs/guide/state.md`, `docs/guide/files.md`. No code, no tests.

The exact strings docs must use verbatim: `attempt=<id> top=<sha> members=<slug,...>`; `attempt=<id> solo`; `stack red; holder turn restarts alone`; `rerun tested=<T1-sha|none> pushed=<T2-sha>`; `rerun rebase <slug> onto <sha>`; `akrogon verify --attempt <id>`; `merge-attempts.jsonl`; `members` record entries `{slug, head}`.

## 5. Do-not, reasons and exceptions

- No split/culprit/batch_limit/cap or parallel-verify wording anywhere: the locked design forecloses them; writing them back is a locked-decision violation. Exception: the `files.md` history note that says `held`/`split`/`ejected`/`culprit` appear only on older lines stays (it documents parsing, not behavior).
- No claim that members get prompts or their own verify runs: only the holder's B is prompted. Exception: none.
- No claim B repairs on a membered stack: `HEAD` must equal `top`. Exception: none.
- Do not document `members` on `batch` state as legacy or optional-text; it is live state. Exception: none.
- `src/AREA.md` stays within its existing section structure (Commands / Key files / Non-obvious patterns / See also) and terse style. Exception: none.
- No edits outside the owned paths; no new files.

Restated: every exclusion above stands with its reason; the only exception is a revised brief from A authorizing the change.

## 6. Ordered steps

1. `skills/merge-issue/SKILL.md`: rewrite the `## merge` section's turn paragraph and the three ending subsections to the contract.
2. `src/AREA.md`: update the `buildStack`/batch lines.
3. `docs/guide/merge.md`: turn paragraph, `--check` paragraph (HEAD equal to recorded top on a membered stack), push paragraph (members move to merged, tips), red paragraph (`stack red` ending), completion/briefs line.
4. `docs/guide/next.md` :157, `docs/guide/phases.md` :14, `docs/guide/state.md` :52, `docs/guide/files.md` merge-attempts `members` line.
5. `bun install --frozen-lockfile` then `bun test tests/docs-links.test.ts`.

Advisory: ~7 files, under 30 turns.

## 7. Commands

```sh
bun install --frozen-lockfile
bun test tests/docs-links.test.ts
```

## 8. Done-when, evidence and report

Docs match the pinned contract, docs-links test green, commit(s) on the detached HEAD with scoped messages. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
