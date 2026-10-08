# Brief 3: peer skills and guide for the direct route

## 1. Goal

Plan D12–D15 (criterion 6). The chart door's direct route (door A implements and lands; chart B reviews; no leaf record)
needs a direct form in implement-issue Standalone, a standalone-review section in check-issue, a direct trigger in
broadcast-issue, and an operator-facing section in `docs/guide/chart.md`, each without restating rules owned elsewhere.

## 2. Numbered acceptance criteria

1. implement-issue Standalone describes a direct form the door runs itself, prompt
   `implement-issue direct chart=<chart-folder> worktree=<path>`: task = the chart's draft brief and design read in place
   (not rewritten as a new brief); checkout = that worktree; `checks` and base from `akrogon config` in that worktree;
   plan and report go under `<chart>/direct/` (`plan.md`, `report.md`); delegation works as Standalone does today with A
   owning the result; it returns to the door for B's review and repair rounds instead of finishing; no phase call. The
   clauses that today say Standalone reads no config and writes artifacts in the checkout (lines 10, 23, 90, and the
   description on line 3 if needed) are edited to admit this form.
2. check-issue has a `## Standalone review` section B follows when prompted by the door with no leaf, prompt
   `check-issue direct slot=B chart=<chart-folder> worktree=<path> base=<sha> head=<sha> out=<chart>/slots/<file>`:
   inputs are the chart's brief and design, the worktree, base and head; the existing Fix/Nit bar, base-run rule,
   verdicts and re-check scope apply by reference; B writes only the named return file, runs no `akrogon phase`, and
   returns. The description and the prompt line (line 10) admit the form.
3. broadcast-issue names the direct trigger: after a direct landing the chart door is the sender; its context is the
   chart's brief plus the pushed SHA and closed sources; the description, line 10, line 14 (completion owner) and
   line 43 (merge slot clause) name this case.
4. `docs/guide/chart.md` has a short `## Direct route` section before the final handoff diagram paragraph: the repo opts
   in with `direct` (link `setup.md`), the door offers it only for a small, fully charted, code-only single item with B
   named and the operator chooses it at the handoff review, A implements in a branch worktree and B reviews, the door
   lands the tested commit on the default branch, closes delivered sources, broadcasts when configured, removes the
   branch and worktree and closes the chart; if the work grows or repairs run out the door stops, saves the work in a
   `Direct attempt` record and the operator hands it to the lifecycle or abandons it. Plain operator language; link to
   skills rather than restating eligibility or landing rules.
5. `bun test tests/docs-links.test.ts --timeout=30000` stays green.

## 3. Read-first list

- `skills/implement-issue/SKILL.md` (lines 3, 6, 10, 23, 86-99)
- `skills/check-issue/SKILL.md` (whole)
- `skills/broadcast-issue/SKILL.md` (whole)
- `docs/guide/chart.md` (whole; style), `docs/guide/setup.md:58`
- `tests/docs-links.test.ts` (what it checks)
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Owned paths: `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/broadcast-issue/SKILL.md`,
`docs/guide/chart.md`. Must land first: nothing. Shared test resource: none.

Another worker writes, in parallel, chart-issues `SKILL.md` `## Direct route` (eligibility, route question, protocol,
landing order, repair bound with repo `fix_rounds`, growth stop) and the `Direct attempt` section in
`skills/chart-issues/assets/shapes.md`. Refer to those by name (for example "the chart-issues direct route"); do not
restate them. Fixed artifact paths: `<chart>/direct/plan.md`, `<chart>/direct/report.md`, `<chart>/slots/review-B-<n>.md`.

## 5. Do-not, reasons and exceptions

- Do not restate eligibility, landing, repair-bound or growth rules: chart-issues owns them. Exception: name them.
- Do not restate check-issue's Fix/Nit bar inside the new section: apply it by reference. Exception: none.
- Do not change implement-issue leaf sections (`implement`, `check.fix`) or check-issue `check.review`/`check.repair`
  behavior: only the Standalone section and the clauses named above. Exception: none.
- Do not edit `docs/guide/merge.md` or other guide pages: not owned; if you see a now-stale line there, list it under
  known limitations.
- A mismatch with the plan goes back to A with evidence; exception: a revised brief from A.

Reasons and exceptions restated: rules stay with their owner and are referenced, leaf sections stay untouched, unowned
docs are reported not edited, and only a revised brief from A changes scope.

## 6. Ordered steps

1. implement-issue Standalone direct form plus clause edits (criterion 1).
2. check-issue `## Standalone review` plus description and line 10 (criterion 2).
3. broadcast-issue trigger edits (criterion 3).
4. docs/guide/chart.md `## Direct route` (criterion 4); run docs-links test (criterion 5).
5. Commit once.

Advisory size: 4 files, under 16 turns.

## 7. Commands

`AKROGON_BASE=d17029e2b0a8c369ee366a91bf12346141fc508a bun test --changed="$AKROGON_BASE" --timeout=30000`

## 8. Done-when, evidence and report

Each criterion maps to a cited line in the report; docs-links green; one commit, SHA returned.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
