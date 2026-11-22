# How seats budget their own paid test runs

## Question

Q1 Ceiling: where does the operator's one standing ceiling live, what shape, and who writes it?
Q2 Counting: where is a paid launch counted, and how is the host-wide total known?
Q3 Window: rolling 24 hours or calendar day?
Q4 Grants: what remains of a leaf's `grants[]` for paid launches, and does the schema change?
Q5 Absent ceiling: what happens when the key is missing?
Q6 Per-leaf number and the minutes bound: is there a per-leaf cap, and who enforces "each session ends within N minutes"?
Q7 Ceiling stop form: `failed` with one notice, or a wait that clears itself?
Q8 Sufficiency (S5): where is the floor written once, and how does review treat a fresh run after a repair?
Q9 Undeclared paid runs: how is a paid launch without a reservation prevented?

### Carries

- Locks: forks/signposts.md `## Taken` S1-S6 and ranking; `## Needs` N1, N2.
- Map: slots/map-A.md, map-B.md, map-C.md (blind maps answered these questions independently; used as the blind notes, A's reading to avoid a second paid exchange on the same questions).

## Findings

- Merged notes: slots/budget-shape-merged.md. Rebuttals: slots/budget-shape-rebuttal-B.md, -C.md.
- better-than-training, 2026-11-22: no code reads `grants` (`src/readiness.ts` `gaps` iterates `inputs`; status.ts and turn.ts call only `gaps`); `src/run-check.ts` `runCheck`/`checkedRun` has no session notion and appends `check_start`/`check_end` through `src/timing.ts` `appendTiming`; `issues/timings.jsonl` is git-tracked per repo; the four `skills/*/lifecycle-rules.md` are symlinks to one `skills/lifecycle-rules.md` (B; C's "4 copies" is wrong); `globalSchema` is a strictObject in src/config.ts; `akrogon status`: no open leaves.

## Taken

A's pick under full autopilot, 2026-11-22, decided by S1, S3, S4, S5, S6 and the ranking (no budget blown first, fewer rules third).

1. Ceiling: one optional machine key in `~/.akrogon/config.yaml` (`globalSchema`), `paid_budget: {sessions_per_day, session_minutes, approved: {date, answer}}`, `answer` holding the operator's N1/N2 words verbatim, shown by `akrogon config`; written only by the operator, never a seat or the door. The standing scope (paid launches on the logged-in `harnesses` accounts, local writes cleaned after, no other account, provider or outside write) is written once in `skills/lifecycle-rules.md`. (A,B,C; scope placement B, answer text C.) Rejected: per-repo key, separate file, scope fields in config.
2. Counting: `akrogon run-check --sessions <n>` reserves n before the command starts, under one exclusive host lock `<globalHome>/budget.lock` taken before and released before `withAdmission` (never nested in `admission.lock`), appending `{at, repo, slug, run, sessions}` to `<globalHome>/budget.jsonl`; a reservation counts whatever the outcome; refusal when the window total plus n passes `sessions_per_day`, starting no command; the reader and writer fail closed (an unreadable or malformed ledger or a failed append refuses). No field is added to the timing row; review joins on `run`. (A,C; B withdrew the timing row.) Rejected: timing rows (git-tracked, `readTimings` returns [] on error, `appendTiming` only warns), `withAdmissionLock` (shared, per slice), seat count lines.
3. Window: rolling 24 hours. (B,C)
4. Grants: schema unchanged. A leaf whose live proof uses paid launches still carries one grant entry for its targets, fixtures, cleanup, effects and stop line (abandoned-capture recovery and check-issue read `fixtures[].cleanup` and `absence_check`), with `approved.by: standing`, `approved.answer` naming `~/.akrogon/config.yaml paid_budget` and its date, and `bounds` holding no session count. It never claims operator words for this leaf, so no forged approval (C's concern) and no schema change (B's). Outside live changes, destructive, public, billing, DNS, new identity or target keep an operator `approved` entry as today. Old entries stay valid; no migration. (A's synthesis of B and C; standing dissent: C preferred a discriminated schema, B quoting N1.)
5. Absent key: `--sessions` refuses naming `paid_budget` in `~/.akrogon/config.yaml`; no fallback to per-leaf counts. (A,B,C)
6. No per-leaf cap; each launch states n and its reason in the seat's record file; the red-launch paragraph of `## Grant reuse and count lines` stays the brake. run-check exports `AKROGON_SESSIONS=<n>` and `AKROGON_SESSION_MINUTES=<m>` to the reserved command and never kills it on time; the live test enforces and reports the minutes. (B,C)
7. Ceiling stop: the seat stops `failed` with the existing one notice per stopped leaf, reason naming the ceiling; no dedupe state. (A,B; C wanted a per-window dedupe.)
8. Sufficiency: the fresh-call trigger moves from standing-design's recorded-output line into `skills/lifecycle-rules.md` beside the red-launch rule, with S5's floor, so every seat reads one file for the whole decision; standing-design keeps a one-line pointer. Floor: a fresh paid run is needed only when no recorded green on the current model-facing inputs covers the property, or the seat records why the change can reach it; a red caused by product behavior never passes; a run cut short by the ceiling or time limit is judged on the evidence already recorded; a wording-only change the seat judges cannot reach the proven property needs no fresh run, reason recorded. check-issue asks a fresh run only by naming a behavior no recorded run on current inputs shows, as a Fix for repair, never under `Operator actions`. (C home; B's condition of moving the trigger too, adopted.)
9. A live test that launches paid sessions refuses to start without `AKROGON_SESSIONS`, so an unreserved paid run cannot happen. (B)

Split: L1 `session-ceiling` (code: config key, `--sessions`, ledger, lock, refusal, env exports, `akrogon config` output) then L2 `budget-rules` (prose and the live tests' env refusal) blocked-by L1, which consumes the flag and key L1 lands.

Corrections after the final check (B P1-P9, C 1-4), adopted as A's pick, 2026-11-22:
8'. Floor wording (C1, B P1): a fresh paid run is needed only when no recorded green on the current model-facing inputs covers the property and the change can reach it, or the seat cannot show why it cannot; a run cut short by the ceiling or time limit passes only when the floor is met. Every reference moving with the trigger is repointed: check-issue `## check.repair` ("standing-design's recorded-output fresh-call rule and its grant", "standing-design's recorded-output rule"), implement-issue `## implement`, plan-issue `## plan.synthesis`, standing-design's chain-trigger and slow-run lines; the replay half stays in standing-design, the trigger half names lifecycle-rules (B P2). chart-issues gets a fifth `lifecycle-rules.md` symlink so the door reads the trigger for shapes `## Preflight and validation`; tests/docs-links.test.ts reads the link set rather than a fixed four (B P3).
2'. Order and failure (B P4-P6, C2): the reservation runs inside `checkedRun` after `refuse()`, the `merge_checks` refusal, `ownerRefusal` and the first `failedRefusal`, with `--sessions` parsed as a positive integer; a later refusal keeps its row. A ledger refusal prints the file and the bad row and the operator repairs it; a ceiling refusal prints the window total, the ceiling and when the next session frees. `budget.jsonl` joins `src/state-home.ts` `copiedEntries`.
4'. Standing grant fields (C3, B P8): `approved: {by: standing, date: <paid_budget.approved.date>, answer: "~/.akrogon/config.yaml paid_budget"}`; `bounds` holds non-count limits, or "sessions under paid_budget" when none. shapes `## Preflight and validation` and autopilot.md state that a `by: standing` entry is the door's to write and claims no operator approval; every other approval stays operator-only. A leaf with paid launches and an outside live change carries two entries, one standing and one operator. A session count in an old entry is information only. Handoff never waits on `paid_budget`; a door charting probe refused for a missing or exhausted ceiling waits on Needs N1/N2 like any pending row.
5'. Activation (B P7): the operator adds `paid_budget` only once session-ceiling is the installed build (`~/.akrogon/current`), because `globalSchema` is strict.
9'. Guard scope (B P9, C2, C4): `AKROGON_SESSIONS` and `AKROGON_SESSION_MINUTES` join the `constructed` set in `src/config.ts` `repoSchema` (a repo cannot pass them) and are never added to run-check's `copied` list (a nested run does not inherit them). The paid entry points that refuse without `AKROGON_SESSIONS`, and refuse when their planned sessions exceed it: tests/e2e/kinds.e2e.ts, watch-stop.e2e.ts, watch-consults.e2e.ts and watch-live.e2e.ts for claude, codex, pi and agy; the `standin` cell, window.e2e.ts and notices.e2e.ts stay free. The guard catches omission only; check-issue keeps reading paid activity against ledger rows as the catch for the rest.
These narrow or define items already checked; 2', 8' (fifth symlink) and 9' add small mechanisms, re-checked in the leaf-writing review.

## Charting proofs (2026-11-22, free)

- X1 `akrogon run-check --name ai-budgets-probe --holder issues/chart/ai-budgets -- sh -c 'echo AKROGON_RUN=${AKROGON_RUN:+set} AKROGON_SESSIONS=${AKROGON_SESSIONS:-unset}'` from the registered root, door A, release fdc5acdd: printed `run <id>`, the capture pair, `AKROGON_RUN=set AKROGON_SESSIONS=unset`, `check ai-budgets-probe: 0 <log>`; the capture pair was removed by run-check on success. Limits: no `--sessions` flag exists yet (L1 builds it); a leaf worktree call needs `--leaf` or a matching worktree, observed refusal "No leaf worktree matches cwd; pass --leaf or --holder" from the root without `--holder`.
- X2 `akrogon config` prints `~/.akrogon/config.yaml` keys (max_active, slots, harnesses, ...): the N1/N2 done-check reads it. Limits: `paid_budget` does not exist yet.
