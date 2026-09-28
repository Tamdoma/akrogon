# Review A: chart-destination-intake

- Base: `a2f3e7a378d025930e12ac05ce8710f57f0752a2`
- Reviewed head: `5414dc3dd6dd41f80d2c4d9bbdecf09aca4650b2` (commits 64e817a, 128875d, 5414dc3)
- Diff: 3 prose files, +9/-3 — `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, `docs/guide/chart.md`. No `src/`, `tests/`, `plugin/`, `README.md`, or `issues/` paths touched. No AREA.md in diff.

## Acceptance criteria

- AC1 — pass. SKILL.md:63 names the checked set (source + each selected registered destination, deduplicated, source never exempt including as sole destination), timing (selection + right before handoff review, one check when coincident, opening pull counts only when coincident), mechanism (plain `akrogon pull`, cwd at each repo's registered root from `akrogon config` `repos`), and "checking never imports a destination's unrelated seeds". Matches D2 exactly.
- AC2 — pass. shapes.md:164 states all four outcomes: confirmed full unowned match → verbatim into INTAKE.md under own `Source` heading + GitHub provenance line + `sources` fan-out to every leaf under the delivering completion owner; partial stays open with uncovered part shown; owned-elsewhere identity shown as conflict, never silently reassigned; failed/non-GitHub pull holds only that destination and is reported. SKILL.md:63 covers the compare/show/confirm flow.
- AC3 — pass. shapes.md:168 preflight: "Refuse a handoff to a destination whose check right before the handoff review did not succeed, and name that destination." Distinct from the stale-mirror and operation-proof refusals in the same paragraph.
- AC4 — pass. Guide :203 plain-words paragraph covers which/when/how and the failed-refresh consequence. Exemption appended at guide :128 and SKILL.md :33. Sweep hits reported as non-contradictory; README.md untouched (verified: not in diff).
- AC5 — pass. Replay quotes the finding line (SKILL.md:63 compare/show), the confirmation line ("act only on operator confirmation"), and the sourcing line (shapes.md:164 verbatim + `sources` fan-out) for `Tamdoma/pi-extensions#5`. Five scenario reviews each name applicable instructions and outcomes. Pull artifact `/tmp/chart-destination-intake-pull.log` verified on disk: `pi-extensions: 0 open issues pulled`, exit 0, outside tracked `issues/` paths. `gh auth status` confirms `ivanjuras` active. No historical `issues/` changes in diff.

## Live-contract checks

- `shapes.md:162` single-owner rule byte-identical to base (verified via `git show`).
- `src/phase.ts:149-165` confirms completion closes leaf `sources` — the "existing completion closes it" claim is real.
- `src/pull.ts` exists; `akrogon pull` is a real command; `docs/reference-index.md` unaffected.
- SKILL.md:63 correctly bounds its "failed refresh holds only that destination" to destinations; the existing :27 stale-mirror rule covers a failed source refresh. No contradiction with :27 or the shapes stale-mirror sentence.
- No AREA.md files in the diff, so the path-existence check does not apply. Context note: `skills/AREA.md` names `scripts/observe.ts`, but the file lives at `skills/watch-issues/scripts/observe.ts` — stale path pre-existing on base, not this leaf's scope or defect.

## Verification evidence

- Report records `bun run format` exit 0, `bun test` 324 pass / 0 fail, `bun run typecheck` exit 0; `bun test --changed` correctly no-ops on prose-only diffs (0 affected test files). Diff is prose-only, so no rerun warranted.
- `git status --porcelain` clean at reviewed head.

## Findings

### Nit

- N1 (plan/report consistency, non-blocking): plan D6 says "six scenario reviews" while AC5 enumerates five and the report delivers five. Every scenario AC5 names is present, so no done criterion fails; the count wording in D6 is stale.

## Verdict

ready

## Merge pass (slot A)

- First push rejected non-fast-forward (sibling `pull-all-repos` `d6f42f8` landed mid-pass). Refetched, rebased cleanly onto `d6f42f8`; range-diff `e99801d..a3aeb01` vs `d6f42f8..87ab5cd` identical for all 3 commits.
- Post-rebase checks (AKROGON_BASE `d6f42f8`): `bun run format` exit 0 all unchanged; `bun test --changed` 8 pass/0 fail (sibling's `tests/pull.test.ts` now in range); `bun test` 326 pass/0 fail/3863 expect in 160s; `bun run typecheck` exit 0.
- Push: `d6f42f8..87ab5cd HEAD -> main` fast-forward. Merged head `87ab5cd`.
