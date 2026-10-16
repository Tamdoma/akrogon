# Implementation report: state-home

Base: dd5c15c217d85c8fafbb02f5f2544efe9b591a89 (unchanged; branch was already on origin/main tip)
Committed head: e1917e6beeed8cf12f25c575d18d1e7c3d24d8ce

## Changed files and reasons

- `src/config.ts` — `globalHome()` resolves `AKROGON_HOME`, else `~/.akrogon` when it holds `config.yaml`, else `toolRoot` when it holds `config.yaml`, else `~/.akrogon`; resolved per call.
- `src/state-home.ts` (new) — `migrateStateHome()`: gate + copy + atomic `config.yaml` commit; holds `.lock` and every `runs/locks/*` file, refuses while live run records or foreign `/proc` references to the tool root exist, copies the fixed state set, rewrites relative `repos:` entries against the tool root, prints `moved state home: <src> -> <dst>` on stderr.
- `src/akrogon.ts` — calls `migrateStateHome()` first, before argument parsing.
- `src/run-check.ts` — `AKROGON_HOME` added to `constructedEnv`'s copied names so a nested `akrogon` inside a checked command shares the caller's state home instead of re-cutting over.
- `src/AREA.md` — one Key-files line for `src/state-home.ts`.
- `README.md`, `docs/guide/install.md` — machine config named as `~/.akrogon/config.yaml` (`AKROGON_HOME` override).
- `tests/state-home.test.ts` (new) — criterion proofs C1–C5.
- `tests/hold-retired.test.ts` — retirement sweep exempts `state-home.ts` for `held.yaml` (cutover copy list legitimately names it).
- `tests/run-check.test.ts` — env allowlist gains `AKROGON_HOME`.

## Commands and results

- `akrogon run-check --name state-home-tests -- bun test tests/state-home.test.ts` (worker U1, commit 84b0508): 6 pass, `check state-home-tests: 0 .../check-state-home-tests-1792107125156-2900946.log`
- Worker U2 (commit 4e4cb4d): docs-links 5 pass (`check-docs-links-1792106172687-1200797.log`), command-reference 6 pass (`check-command-reference-1792106172784-1200901.log`)
- `bun test --timeout=30000` after U1 pick (4300ca8): 906 pass, 1 fail — `hold-retired` literal ban hit `held.yaml` in the copy list → corrected the test (3c87194). Wall ~105 s.
- `bun test --timeout=30000` after U2 pick + correction (eae518d): 907 pass (`check-changed-tests-1792107472992-3311931.log`). Wall ~107 s.
- `akrogon verify` on e1917e6: test 0 fail (907 pass, ~111 s), typecheck 0 fail, format green → `verify leaf e1917e6: green`. Wall ~115 s total.
- Intermediate reds: `verify` on 16a3bb7-range heads failed on `check-names` stderr contract (cutover line on stdout → moved to stderr, 02f8518) then on `run-check` env allowlist (AKROGON_HOME propagation, 9596071) and prettier drift (e1917e6). All repaired on-head; final run green.

## Done-criteria proof

- C1 `~/.akrogon`/`AKROGON_HOME` home, source-run == installed: tests 1–3 of state-home.test.ts green on head (check-state-home-tests-final2 log).
- C2 `init` registers into state home, no tracked checkout change: covered by criterion test 2's pause-write assertion plus `init`'s unchanged `globalHome()` write path; tracked-files test green.
- C3 cutover copies + one line + relative `repos:` rewrite: test 1 green (asserts stderr line, rewritten `repos.rel`).
- C4 no tracked file touched; defers on live records and foreign processes: tests 4–6 green.
- C5 tool-root config dead after cutover: test 2 mutates the tool-root config post-cutover and asserts state-home values only.
- C6 docs: README/install.md updated; docs-links and command-reference suites green.

## Known limitations

- Residual race documented in plan.md: between post-copy re-check and the `config.yaml` rename, a brand-new old-code spawn on a previously unseen `runs/locks/<slice>` could race; bounded to an unobserved-and-retried state on the next command.
- Liveness uses a loose schema: a record admission would call stale can defer cutover (conservative only).
- Nit N1 (unresolved): symlink-invoked old code (`~/.local/bin/akrogon` with foreign cwd) escapes the `/proc` foreign-process gate; see review-A.md.

## check.fix (2026-10-16)

Base refresh: dd5c15c → 4302113 (prior head fa7f295 → new head 2eabe02).

Handed items from B's check.repair and their resolution:

- C2 criterion case: new `init registers into the state home config and leaves the checkout untouched` — shown red under a toolRoot config write (`check c2-red: 1 .../check-c2-red-1792109713216-547820.log`), green after (`check criterion-final: 0 .../check-criterion-final-1792109788125-578538.log`, 77 tests).
- C4 tracked-files assertion corrected: now rejects tracked modifications/deletions and permits untracked additions; the previously failing case passes.
- C4 overlap case: `an already-running command that admits a nested checked run defers cutover; ...` — spawns a real `run-check` held to old-code shape by a foreign-process sentinel, which writes a live admission record to the tool root and admits a nested `run-check`; two mid-run `config` invocations defer, then cutover proceeds after exit and nothing writes the tool root after. Shown red with `settled()` neutered (`check c4-overlap-red2: 1 .../check-c4-overlap-red2-1792110994743-2769662.log`), green on head (`check c4-overlap-v2: 0 .../check-c4-overlap-v2-1792110975084-2761745.log`).
- Fixture alignment: `tests/self-update.test.ts` and `tests/install.test.ts` `selfUpdateFixture` seed `config.yaml` in the fixture home so `globalHome()` resolves it; both files green in the same run.
- Report updated: C2/C4 now carry real proof; the missing-`.lock` limitation is obsolete after B's always-lock repair and removed.

A-F2 (review-A) was disproven by B with evidence in review-B.md: `config.yaml` was never in `copiedEntries`; no product change needed.

Final verify on 2eabe02: test 957 pass / 0 fail (~127 s), typecheck green, format green → `verify leaf 2eabe02: green`.

## check.fix round 2 (2026-10-16)

B's re-check retained only the C4 admitted-run scenario (first attempt used a fabricated record). Replaced with the real admission case above (commit 6498fcd, prettier follow-up da7b658). Base unchanged (4302113); head da7b658.

Final verify on da7b658: test 957 pass / 0 fail (~134 s), typecheck green, format green → `verify leaf da7b658: green` (check-test-1792111422716, check-typecheck-1792111424744).

## check.fix round 3 (2026-10-16)

B demonstrated a false green: the payload `${nested}; sleep 6` masked a nested failure before admission. The payload now propagates the nested exit (`nested; rc=$?; sleep 6; exit $rc`) and asserts the nested `check run: 0` line inside the outer's captured log. Shown red under the invalid-nested-option input break (`check c4-nested-red: 1 .../check-c4-nested-red-1792111723915-126916.log`), green on head (`check c4-nested-green: 0 .../check-c4-nested-green-1792111736976-133123.log`). Commits e29bbf9 + 83b9279 (prettier).

Final verify on 83b9279: test 957 pass / 0 fail (~133 s), typecheck green, format green → `verify leaf 83b9279: green` (check-test-1792112029698, check-typecheck-1792112031703).

## Unverified criteria

None. All criterion tests green on the verified head.
