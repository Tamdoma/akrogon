# Review-B: busy-age-label

## Scope

Blind initial review of the whole diff against `plan.md` (no Implementation notes section, none needed), `design.md`, and `implementation/report.md`. Did not read the peer review. `debate: no`, so missing positions/rebuttals are expected.

- Base: `ccea397163b8fda774916f2f6a4a60b10506f7d3`
- Reviewed head: `17b322dadf6068099e6277d3a3bd952d4e4eed5d`
- `git status --porcelain` empty; base is an ancestor of head.

## Diff

Three files, +47/-4, exactly the owned surfaces:

- `skills/watch-issues/scripts/observe.ts`: one-line `ageSuffix` return change to `` ` busy=${h}h...m` ``. `formatLeaf` unchanged. Matches plan D1/D2 and the design's leaf architecture.
- `skills/watch-issues/scripts/observe.test.ts`: two expectations updated plus new unparsable and future tests. Matches plan D4.
- `skills/watch-issues/SKILL.md`: only line 28 changed, both tokens to `[ busy=HhMMm]`. Never list untouched, per the design exclusion.

Exclusions hold: no change to `busy_since`, `busy_notified`, or `src/next.ts`; no `issues/` paths on the branch.

## Findings

No Fix. No Nit.

- Criterion 1 (set/unset label): covered by updated busy tests and existing unset lines; verified green.
- Criterion 2 (unparsable/future edges): covered by the two new tests asserting the literal printed line; verified green.
- Criterion 3 (doc line): SKILL.md:28 updated; grep confirms no stale `[+HhMMm]` or `+0h00m` copy remains in `skills docs src tests`.
- Criterion 4 (e2e artifact): both recorded artifacts exist and print ` busy=1h40m` (`/tmp/observe-busy-1790591622.txt`, `/tmp/observe-busy-lane-1790591675.txt`).
- Criterion 5 (checks): report pastes full suite 306 pass, typecheck exit 0, format exit 0 with clean tree; no code changed since, so no rerun.
- Tests assert literal printed observer lines (fixed references that run as written) with herdr/akrogon stubbed at one boundary and real temp repos: no mocks of the unit under test, no wording tests.
- Docs: the changed behavior's page (SKILL.md Observe section) was updated in the diff; no AREA.md in the diff; `skills/AREA.md` still describes `observe.ts` correctly, so no index line is stale.
- Ponytail: smallest diff in the right shared function, existing test pattern reused, no new abstraction or dependency.

## Verification evidence (reviewer-run)

- `bun test ./skills/watch-issues/scripts/observe.test.ts`: 22 pass, 0 fail.
- `cat` of both e2e artifacts: expected ` busy=1h40m` lines.
- `git diff` inspection of all three files; `grep -rn "\[+HhMMm\]\|+0h00m" skills docs src tests`: no stale copies.

## Verdict

`ready`
