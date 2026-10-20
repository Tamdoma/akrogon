# Implementation report: twin-guard

## Commits (base abfee125 → head efe9832b)

- `4eca411d` test: twin-owner refusal tests, rewriting the twin-friendly dispatch test (planning pass, shown red).
- `5eba845a` feat: `twinConflict` predicate in `src/turn.ts`, `Block` gains `{kind:'twin'}`, `eligibility`/`mergeQueue` gain `repo`, `dispatchLeaf` refuses first keyed by the open owner folder.
- `efe9832b` test: un-twin five existing fixtures the new rule correctly refuses.

## Changed files and reasons

- `src/turn.ts` — `twinConflict(repo, leafPath)` (D1), `Block` twin member (D2), `blockDetail`/`eligibility` return twin first (D3), `eligibility`/`mergeQueue` take `repo` (D2).
- `src/next.ts` — `dispatchLeaf` twin refusal right after leaf resolution, reported on `twin.open`, returns `'skipped'` (D4); three `mergeQueue` call sites pass `repo`.
- `src/phase.ts`, `src/status.ts` — `mergeQueue` call sites pass `repo`.
- `tests/next.test.ts` — rewritten twin test plus four new ones; `expectRefused` helper; three fixture repairs.
- `tests/keep-rule.test.ts`, `tests/phase.test.ts` — one fixture repair each.

## Deviations from plan.md

- `expectNoLaunch`'s `.lock`-absent assertion was a wrong expectation for an in-lock refusal (`withLock` creates the file itself); refusal tests use `expectRefused`, which keeps the state/calls/worktree/log assertions. One wrong-expectation correction under the implement exception.
- The two `--all` tests use an empty `closed/old` folder instead of a moved closed leaf: `next --all` legitimately dispatches closed leaves, so a real `closed/old/c1` would have polluted the dispatched-slugs assertion. Twin detection is folder existence, so behavior is identical.
- Three other tests held fixtures that were latent twins; each was moved to a non-colliding owner or (for the two `completeOwner` failure tests) start the leaf already `merged` with the destination occupied, which is the only state that still reaches the destination throw now that the queue gate excludes merge-phase twins.

## Proofs (all on committed heads; logs under `implementation/`)

| Criterion | Command | Result |
|---|---|---|
| C1 slug refusal | `akrogon run-check --name twin-slug-refusal -- bun test --timeout=30000 tests/next.test.ts -t 'closed owner twin refuses'` | red pre-code (`check twin-slug-refusal: 1`, log …9153-3019491), green at 5eba845a (`check twin-slug-refusal: 0`, log …230382-3548996) |
| C1/C3 --all refusal + other owners | `… --name twin-all-refusal … -t 'prints once per owner'` | red pre-code (…34792-3033387), green (…244179-3586563) |
| C4 merge queue | `… --name twin-merge-queue … -t 'never heads the merge queue'` | red pre-code (…148286-3079923), green (…245231-3603178) |
| C2 parked/empty forms | `… --name twin-conflict-forms … -t 'owner folder twin refuses'` | red pre-code (…151138-3110006), green (…247533-3628861) |
| C5 closed-path dispatch | `… --name twin-closed-dispatch … -t 'closed leaf dispatches by path'` | green before (…153956-3134409) and after (…248573-3631606) |
| Fixture repairs | `twin-fixture-repairs`, `twin-fixture-repairs-next` | green (…633545-279605, …634864-298663) |
| Full gate | `akrogon verify` on `efe9832b` | first run red on the 5 fixture tests (…429776-3695953); rerun green: `verify test: 0`, `verify typecheck: 0`, `verify leaf efe9832b: green` (…813506-321031, …815750-321031) |

The red verify run had causes in the leaf's diff (the five twin-shaped fixtures), so no known-red path; repaired and rerun green.

## Refresh

Fetch+rebase at pass start: branch already on `origin/main` tip (`abfee125`), `AKROGON_BASE` unchanged. No conflicts.

## Known limitations

Per plan: `akrogon status` does not display the twin condition; a stopped leaf under a twin owner reports the twin error before the stopped error. No unverified criteria; no env blockers.
