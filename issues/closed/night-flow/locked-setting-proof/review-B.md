# Review B: locked-setting-proof

Date: 2026-10-11
Phase: check.review (initial, blind)
Base: `c53f6196533289555518577f08907ec9c713721c`
Reviewed head: `9bb3879ad111b49e43e1d51c44067258df7c05f3`
Verdict: ready

## Scope and findings

Read the brief, locked design, plan, implementation report, reference index, skills area, chart guide and affected charting contracts. No debate artifacts exist because this leaf has `debate: no`. No peer review was read.

The committed diff changes only `skills/chart-issues/SKILL.md:57`, adding the planned sentence inside the Take operation-proof paragraph. It requires the same key, location and value, observation of the relied-on property, and rejects a proof in a different form. This meets criterion 1 and decisions D1–D3. No code, test, runner configuration, AREA file or lesson removal changed. The worktree is clean.

For the brief's concrete bunfig scenario, the new rule rejects CLI-flag-only evidence for a locked config key, and requires observing the property through the locked config setting. Existing provider dry-run language limits what the call proves and does not override the new rule.

Independently repeated the meaning sweep with `rg -n -i 'prove|proof|probe|counts|call' skills/chart-issues/`, covering all seven files. No line permits a different proof form for a locked setting. The report lists out-of-scope hits. In particular, shapes.md:284 references the Take rule, shapes.md:168/286 and standing-design.md govern criterion proof rather than substitute operation proofs, and questions.md:29/56 expressly retain required operation proof. Fixture, credential-save, direct-route, usage-count and peer-wait references do not license substitution. Criterion 2 passes.

`docs/guide/chart.md` describes charting and handoff but restates no operation-proof form. No human documentation change is required. The changed skill is the live documentation surface and accurately describes the new behavior.

No Fixes, Nits or operator actions.

## Verification evidence

Reused implementation evidence at the unchanged reviewed head, without repeating passing checks:

- `implementation/check-format-1791713212048-1197661.log`: format pass, files unchanged.
- `implementation/check-test-1791713305636-1203298.log`: planned full suite, 792 pass, 0 fail across 41 files, terminal result present.
- `implementation/check-typecheck-1791713312058-1600880.log`: `tsc --noEmit` pass.

The report's changed-test row records the lane invocation but not the configured check wrapper. Ran the exact configured `test_changed` check to close that evidence gap:

```sh
akrogon run-check --name 'test_changed' -- sh -c 'akrogon guard ancestors && flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile'\'' && akrogon guard own-modules && sh -c '\'': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'\'''
```

Exit 0: one changed file, no affected tests, 0 fail. Evidence: `implementation/check-test_changed-1791713378244-1800804.log`. All planned checks are accounted for. No checks were skipped, filtered or disabled by the diff. No merge checks are configured.

Prose review is the sufficient criterion proof explicitly selected by the locked design. No wording-assertion test or outside call is required.

## Test-Change trailers

`git log c53f6196533289555518577f08907ec9c713721c..HEAD --format=full` contains one commit and no `Test-Change:` trailers. `src/test-files.ts` matches no changed path, so no trailer is required and no existing expectation changed.

## Merge verification: 2026-10-11

Attempt: `dae4de9e-b887-4097-8094-b22095d78e64` (applied stack, no carried members).
Integration base: `43abb2e1df3e27bb524903d23730520e85976209`.
Tested top: `ba6b8a1d677661aa4aa08d8beb058594485d861f`.

The command rebased the reviewed change onto current main. No fetch, rebase or commit was performed by B. The integrated diff still changes only the planned sentence in `skills/chart-issues/SKILL.md:57`, and the worktree remains clean.

Ran all four exact configured check commands from the worktree, using each `akrogon run-check` wrapper with ancestor guard, locked frozen install and own-module guard. `merge_covers` and `merge_checks` are empty.

- Format: exit 0, files unchanged; `implementation/check-format-1791713432702-1923633.log`.
- Typecheck: exit 0, `tsc --noEmit` clean; `implementation/check-typecheck-1791713445082-1950519.log`.
- Changed tests: exit 0, one changed file and no affected tests; `implementation/check-test_changed-1791713439133-1950533.log`.
- Full suite: exit 0, 813 pass, 0 fail across 42 files, 125.68 seconds; `implementation/check-test-1791713564765-1950492.log`.

`akrogon phase locked-setting-proof merged --slot B --check --attempt dae4de9e-b887-4097-8094-b22095d78e64` returned `ok`, recording this exact top as tested.

No advisory failures. The only batch leaf is this holder. Night-flow has seven other open leaves, so this merge closes no completion owner and requires no completion broadcast.
