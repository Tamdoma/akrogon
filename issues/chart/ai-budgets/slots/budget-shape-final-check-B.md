# Final-shape check: budget-shape, slot B

No item breaks running code. One item can be read against a lock (P1), and six leave an implementer guessing.

- P1 Item 8 against S5. "A run cut short by the ceiling or time limit is judged on the evidence already recorded" is not tied to the floor. S5 O1 requires the property observed green at least once on the current model-facing inputs. As written, a seat can pass a cut-short run with no green on current inputs. Add "and passes only when the floor is met".
- P2 Item 8, references that move with the trigger. The Taken names only "a one-line pointer". These cite the standing-design home today:
  - check-issue `## check.repair`: "re-recording only under standing-design's recorded-output fresh-call rule and its grant". Both the home and "its grant" change.
  - check-issue `## check.repair` (twice), implement-issue `## implement` and plan-issue `## plan.synthesis`: "standing-design's recorded-output rule". The replay half stays in standing-design, so say which half each one means.
  - standing-design's chain-trigger and slow-run lines: "the recorded-output rule above" and "recordings still valid under that rule". "Valid" is defined by the trigger that moves.
- P3 Item 8, the door cannot reach the new home by the existing convention. Skills install as one symlink per folder (`~/.claude/skills/chart-issues` points into `~/.akrogon/current/skills/`), there is no `~/.claude/skills/lifecycle-rules.md`, and chart-issues has no `lifecycle-rules.md` link. The door needs the trigger for shapes `## Preflight and validation` (the fresh or full replay refusal). L2 needs a fifth symlink, and tests/docs-links.test.ts (`seat texts and refs name every non-title red name`) lists four.
- P4 Item 2, order inside `checkedRun` in src/run-check.ts is not stated. The `run` id is created there, so the reservation sits there. If it comes before the early `ownerRefusal` and `failedRefusal`, a failed leaf's refused run uses up sessions. State: reserve after the early refusals, and a later refusal (the second `failedRefusal`, after a full-line wait) keeps its row.
- P5 Item 2, fail-closed has no stated recovery. One malformed row in `budget.jsonl` refuses every paid launch on the host, and a seat must not edit the guard. State who repairs it, and that the refusal prints the file and row. The ceiling refusal should also print the window total, the ceiling and when the next slot frees, because the `failed` reason in item 7 and the operator's choice to raise or wait both need them.
- P6 Item 2 against src/state-home.ts. The home move copies only `copiedEntries` and is fenced by `admission.lock`. `budget.jsonl` is not in the list, and the budget lock avoids `admission.lock` by design. On a host not yet moved, earlier reservations are left behind and the window undercounts for up to 24 hours. Low severity, one-time move. Add the file to the list.
- P7 Items 1 and 5, activation order. `globalSchema` is a `strictObject` and `readGlobal` parses it for every verb. If the operator adds `paid_budget` while the installed build (`~/.akrogon/current`) predates L1, every akrogon command fails. N1 and N2 say "after the leaf lands". They must say "after L1 is the installed build".
- P8 Item 4, four things unstated:
  - shapes `## Preflight and validation` says "grant approval ... stay operator-only" and autopilot.md says "approvals stay operator-only". Without an exception for a `by: standing` entry, the door's own rules refuse A's write.
  - Whether handoff waits when `paid_budget` is absent, and what the door does when its own probe is refused. Item 7 covers seats only, and the door has no `failed`.
  - A leaf with paid launches and an outside live change: `## Take` says "one scoped grant". It needs two entries, one `standing` and one operator.
  - Whether an old entry's session count still warns. Say it is information only.
- P9 Item 9 overstates "cannot happen". The variable guards omission only:
  - A seat can set `AKROGON_SESSIONS` by hand.
  - A repo can list it in `env` or `pass_env`, which `constructedEnv` copies.
  - `AKROGON_HOME` is in `copied` and selects the config and the ledger, so another home has its own ceiling.
  - Keep the check-issue sentence that reads paid activity against ledger rows as the catch.
  - State that `AKROGON_SESSIONS` is never added to `copied`, or a nested unreserved run-check inherits it.
  - State whether a test also refuses when its planned sessions exceed n.
