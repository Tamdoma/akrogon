# Implementation report: nameless-base-red

Base: `a93fec755e9b4481d96feda0001841a5eb072ca9` (origin/main). Head: `6352653739fcd32727c809c42a0955811071d98d`. Branch refresh: `git fetch` showed the branch already on origin/main; no rebase, `AKROGON_BASE` unchanged.

## Changed files and reasons

Commits on the lane, in order:

- `d534acd5 test: cover a nameless known-red pair and keep its refusals` — tests/verify.test.ts (planning pass; `Test-Change` trailer carried).
- `68c3d11e fix: cover a nameless known-red by a nameless base run` — src/verify.ts: `noTestNames` constant deleted; `knownRedReceipt`'s head guard refuses only `(log gone)` so `(no test name)` flows into `names.every(name => baseNames.includes(name))`, covering a nameless head only by a nameless base entry of the same command; comment updated. No other function touched.
- `16194019 docs: state the nameless known-red judgment and blocked exception in seat skills` — the known-red paragraphs of implement-issue, check-issue, merge-issue and chart-issues `## Direct route` step 3 now state the two-branch runner-completeness/causal-fit judgment (named test also red on base, or nameless both sides with no head-only failure, own-verdict ending, no diff cause, withhold when logs show too little, own proofs must pass) and the blocked exception (agreed known-red blocker leaves the check recorded as not run, named as not run, never reported as passing, not by itself stopping the leaf; a done-criterion whose proof is that check still stops it).
- `63526537 docs: state the nameless known-red cover rule` — docs/reference/checks.md `## Known red` cover paragraph and `verify known-red <sha>: fail` row, and src/AREA.md's `requireGreenReceipt` tail, now state the nameless cover and the still-refused cases.

## Worker returns (delegated, wave 1 of 1, 3 units)

- brief-1 (u1): commit `9054536360ff` cherry-picked as `68c3d11e`; targeted verify tests 6 pass (`check worker1-verify: 0 …/check-worker1-verify-1794254678027-2061967.log`). No limitations.
- brief-2 (u2): commit `76b593e5c3fc` cherry-picked and amended as `16194019` to drop the worker's committed `report-2.md` artifact; doc test 8 pass (`check worker2-docs: 0 …/check-worker2-docs-1794254706070-2087414.log`). No limitations.
- brief-3 (u3): commit `8609272b3d8b` cherry-picked as `63526537`; doc test 8 pass (`check worker3-docs: 0 …/check-worker3-docs-1794254700812-2083019.log`). Worker noted criterion 4 reads against verify.ts until brief-1 landed — resolved by cherry-pick order.
- All three worker worktrees removed; `git worktree list` clean.

## Commands run and proof results

Targeted proofs on head `63526537`, all through `akrogon run-check`:

- C1a leaf nameless pair + C1b merge member: `check nameless-cover: 0 …/check-nameless-cover-1794254752850-2170288.log` — both new tests pass: `verify known-red <sha>: pass` printed, exit 0, linked base run at merge-base recorded, `phase caller check.review --slot A` accepted (`state.phase === 'check.review'`), `requireGreenReceipt(repo, head, 'merge')` resolves.
- C2 preserved refusals: `check linked-pair: 0 …/check-linked-pair-1794254752850-2170290.log` — 3 pass: linked-pair seeded refusals (nameless head vs named base, gone head log, named head vs nameless base, gone base log, wrong command, unended rows, bad setup, green base entry, named cover), `refuses a head failure absent` and `reruns the failing command` all hold.
- C3: `git diff a93fec75...HEAD -- skills/*/SKILL.md` read — all four known-red paragraphs carry the judgment rule and blocked exception; grep shows no surviving "logged a real test name" as the only judgment branch or unexceptioned "fixed first". Evidence is the diff itself; judgment confirmed against design Q2 2a/Q3 3d.
- C4: `git diff a93fec75...HEAD -- docs/reference/checks.md src/AREA.md` read — cover paragraph, fail-table row and AREA tail state the changed rule; no "always uncovered" claim survives. Evidence is the diff.
- Changed-tests command after each cherry-pick: `check changed-tests-1: 0`, `check changed-tests-2: 0`, `check changed-tests-3: 0` (65 pass 0 fail each on tests/verify.test.ts + tests/docs-links.test.ts).
- `akrogon verify` on `63526537`: `verify test: 0 …/check-test-1794254822457-2177601.log`; `verify leaf 6352653739fcd32727c809c42a0955811071d98d: green` — format, typecheck and 1151 tests all exit 0. Wall time ~58 s.

No paid or live operations ran; no grants consumed; no credential needed.

## Known limitations

- The changed skill text reaches seats and doors only at the next release link (design, `Dependencies: none`).
- Design's stated cost (Q3 3d): while a base check is red under an agreed known-red, a leaf can pass review and land without its `full` checks or `merge_checks` having run on it.
- The herdr-setup `shell` check and its stopped leaf stay outside this leaf (operator-owned).

## Unverified criteria

None. C1a, C1b, C2 proven by test runs above; C3, C4 proven by the changed text read against the design.
