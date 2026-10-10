# Brief W1: seed-issue owner routing + docs + link test

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/seed-owner-routing-u1

## 1. Goal

Implement plan.md D1–D8 of leaf `seed-owner-routing`: teach `skills/seed-issue/SKILL.md` owner routing to akrogon's issue repo and the found-existing-report outcome, update every `docs/` line describing seed routing or always-create behavior, and extend `tests/docs-links.test.ts` to skill pages.

## 2. Acceptance criteria

1. Shipped `skills/seed-issue/SKILL.md` lets a fresh agent decide, from text alone: (a) report naming a path present under the current repo root routes via `akrogon.yaml issues_repo`/origin as today; (b) report naming a path absent under the current root but present under the akrogon root (`skills/check-issue/SKILL.md` style) or resolving under it after `readlink -f` (`~/.claude/skills/check-issue` style) routes to akrogon's issue repo — akrogon root's `akrogon.yaml issues_repo` else its origin, same validation rules as today's consumer resolution; (c) that owner-test path absent with no `akrogon` command → visible stop naming the path and reason before posting; (d) path absent under both roots routes to the consumer destination.
2. The duplicate lookups run against the routed repo (existing text already says this; keep it consistent after restructure). When a found report covers the same failure (same mechanism/defect judged by body, not shared keywords), the pass posts nothing and `Last operation` prints the found report's URL — every run, manual included. A related-but-different report still posts with the related line; a failed lookup still posts with "search failed".
3. The body gains `Origin repo: <owner/repo identity of the current repository>` and, only when a lesson triggered the report, `Lesson history: <path>`. Keep the six-section block otherwise unchanged.
4. Frontmatter description reflects the akrogon-owner route.
5. `docs/guide/learn.md` extends "A report about an Akrogon skill belongs in Akrogon." with the owner rule and the absent-akrogon stop and the existing-report outcome; `docs/guide/create.md` routing paragraph and outcome wording ("'none found' ... recorded instead", "The result is a report URL") state the new rules; `docs/guide/cheat.md` seed-issue row no longer promises a created report every run; `README.md` intake paragraph near `issues_repo` names the akrogon-owned route.
6. Sweep `docs/` and `README.md` by meaning for any other line describing seed routing or always-create behavior; edit hits or record them as consistent in the return.
7. `tests/docs-links.test.ts` sweeps `skills/*/SKILL.md` in addition to README and `docs/guide/*.md` (new case in an existing test or a new test in that file — extend, don't add a file).
8. `bun run format` clean; `bun test --timeout=30000` green.

## 3. Read-first

- `skills/seed-issue/SKILL.md` (the file being restructured — Destination/Report/Submit and finish)
- `docs/guide/learn.md`, `docs/guide/create.md` (seed-issue section ~lines 84-110), `docs/guide/cheat.md` (table ~line 142), `README.md` (intake paragraph ~lines 170-178)
- `tests/docs-links.test.ts`
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- Pattern to copy: the existing Destination section's validation prose (same "stops visibly with the path and reason" voice for the akrogon-root variants)

## 4. Change list and needed interfaces

Owns: `skills/seed-issue/SKILL.md`, `docs/guide/learn.md`, `docs/guide/create.md`, `docs/guide/cheat.md`, `README.md`, `tests/docs-links.test.ts`. No shared test resource. Lands first; a later unit runs the fresh-agent case proof against this text.

- SKILL.md order inside the file: keep section names. In Report, state early that inspecting the files the failure names runs before destination resolution (owner test needs the named path). In Destination, after today's consumer resolution text, add: the owner test applies only to a path the report names as the failure's location that does not exist relative to the consumer root; a named path absent there is akrogon-owned when it exists relative to the akrogon root or resolves under it after `readlink -f`; report naming several paths routes to akrogon when at least one is akrogon-owned; a named path absent under both roots does not reroute. Akrogon root: Git root of `readlink -f "$(command -v akrogon)"` (e.g. `git -C "$(dirname "$(readlink -f "$(command -v akrogon)")")" rev-parse --show-toplevel`); akrogon repo: that root's `akrogon.yaml` `issues_repo` else that root's `origin`, validated by the same rules already written. `command -v akrogon` empty or root unresolvable, when the owner test was reached: stop visibly with the path and reason, no posting, no consumer fallback. Consumer-code reports never reach the owner test.
- Body block: add the two lines from criterion 3 at the head of the existing fenced body template (before `Unverified intake.`), `Lesson history` present only when a lesson triggered the report.
- Lookup paragraph: keep routed-repo searches; add the covering-report rule (posts nothing, `Last operation` prints the found URL; related-different still posts with the related line; "covers the same failure" judged by mechanism in the body, not keywords). Update the `Submit and finish` last-lines template so `Last operation` covers created URL, found URL, or failure.
- docs-links test: extend `files` to include `readdirSync`ed `skills/*/SKILL.md` (each `skills/<name>/SKILL.md` under repo root), keeping existing unit cases.

## 5. Do-not, reasons and exceptions

- Do not change the six report sections, lookup commands, retry-once rule, root-report print rule, or quote/safety requirements — locked surface, only the named additions.
- Do not hardcode `Tamdoma/akrogon` or any repo identity in skill text — routing must stay derived (plan exclusion).
- Do not add commands, flags, env vars, or a lesson-only mode — locked exclusions.
- Do not touch `skills/*/SKILL.md` other than seed-issue — lesson-write-rule leaf owns the referencing rule; this leaf owns only the seed-issue text.
- Do not create new test files or assert skill prose wording — standing design: no vanity tests; link resolution is the only mechanical doc check.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A authorizing the change.
- Restated: exclusions above stand because they guard the locked interface and other leaves' owned files; the only exception is an explicit revised brief.

## 6. Ordered steps

1. Read `skills/seed-issue/SKILL.md` fully; edit Report (pre-inspection ordering note, body lines, covering-report rule) → Destination (owner routing) → Submit and finish (Last operation variants) → frontmatter. Criterion 1–4.
2. Edit `docs/guide/learn.md`, `create.md`, `cheat.md`, `README.md` lines named in criterion 5. Criterion 5.
3. Meaning-sweep `docs/` + `README.md` (grep `seed`, `issues_repo`, `report`); record every hit's verdict. Criterion 6.
4. Extend `tests/docs-links.test.ts` per criterion 7; run `bun test tests/docs-links.test.ts`. Criterion 7.
5. `bun run format`; then `bun test --timeout=30000` full suite. Criterion 8.
6. Commit chunk(s) on the detached HEAD. `tests/docs-links.test.ts` matches the test-file rule → commit touching it ends with `Test-Change: tests/docs-links.test.ts <added skills sweep; source: leaf brief criterion 7>` in the final trailer block. Keep skill/docs/test edits as one commit or logically split, your call, smallest clean diff.

Advisory size: 5 files, under ~30 turns.

## 7. Commands

`AKROGON_BASE=3d223c853b51ffcc9a826ce0a4a9f3a20d60da9a bun test --changed="$AKROGON_BASE" --timeout=30000` — run after edits; then the full `bun test --timeout=30000` and `bun run format` per step 5.

## 8. Done-when, evidence and report

All criteria met; format clean; full suite green (paste tail). Report fills:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
