# Map return: slot B

Read: signposts `## Taken` and `## Needs`, src/run-check.ts, src/readiness.ts, src/config.ts `globalSchema`, src/timing.ts `timingEventSchema`, and a Haiku inventory of skills/, docs/, src/, tests/ (quotes spot-checked for the lines cited below). Correction to my signposts R7: the four per-skill `lifecycle-rules.md` are symlinks to one `skills/lifecycle-rules.md`, so the rule is written once.

Three facts shape every fork:
- No code reads a grant. `gaps` in src/readiness.ts iterates `inputs` only, and `bounds` and `stop_line` are free text. Every count rule is prose.
- `checkedRun` in src/run-check.ts wraps any argv and cannot see a session. Sessions start inside the command through hc, outside the run's systemd scope.
- `appendTiming` in src/timing.ts writes `check_start` and `check_end` per repo with no paid or session field, yet check-issue `## check.review` tells the reviewer to match the count against `issues/timings.jsonl`.

## 1. Forks

F1. Where the ceiling lives and its shape.
- O1 One optional key in `globalSchema` (`~/.akrogon/config.yaml`) holding the numbers and the operator's answer text. The scope (accounts, effects, stop line) is written once in `skills/lifecycle-rules.md`, and the account set is the existing `harnesses` record. Could break: nothing existing, the key is optional.
- O2 A key in each repo's `akrogon.yaml`. Invites a leaf raising its own ceiling through a merge, and gives no host total.
- O3 A separate authorization file. One more file to find for one record.
- Rec O1.

F2. Where counting happens.
- O1 Declared reservation: `akrogon run-check --sessions N`. Under the admission lock (`withAdmissionLock` in src/admission.ts) it sums the window, refuses when the sum plus N passes the ceiling, and writes `sessions: N` on the `check_start` row. A reservation counts whatever the outcome. Invites: an undeclared paid run is invisible (R1).
- O2 Seat-written count lines, as today. Cannot total across leaves or repos, which is the per-day number N2 needs.
- O3 Count real sessions from each harness's session records. Four parsers that break when a harness changes its files.
- Rec O1.

F3. How the per-day total is known.
- O1 Sum `sessions` over `check_start` rows of every repo in `global.repos`, one record for one fact. Could break: an unwritable timings file only warns today, so a reservation whose row cannot be written must refuse.
- O2 A host ledger file under `globalHome()` plus the timing row. Two records of one fact.
- Rec O1. Sub-pick for A: rolling 24 hours (no midnight burst) or calendar day (easier for the operator to reason about). Rec rolling.

F4. What replaces grant repeat counts and `approved`.
- O1 No schema change. A leaf still gets one grant entry for its targets, fixtures, cleanup, effects and stop line, because that is where `fixtureSchema` lives and what seats compare against. `approved.answer` quotes the standing N1 words, `bounds` holds only non-count limits, and the count is the seat's `--sessions` reservation with its reason in the pass artifact. Renewal entries stop existing.
- O2 Add a seat-owned `budget` section to `readinessSchema`. A plan-time number nothing enforces, which is the count line again in YAML.
- O3 Drop grants for paid-only leaves. The fixture and cleanup contract loses its home.
- Rec O1. It answers intake finding 5 only if the classifier accepts a grant write that quotes N1 (X3).

F5. Open leaves with old-shape grants.
- O1 No migration. The schema is unchanged under F4 O1, an old per-leaf approval stays valid authority, and a paid repeat count inside it is read as information while the host ceiling applies.
- O2 Rewrite open leaves' grants at landing. Touches other charts' leaves for no gain.
- Rec O1.

F6. No ceiling key present.
- O1 One path: `--sessions` refuses with "no ceiling configured", the door adds one needs row, and the per-leaf paid count rules are deleted.
- O2 Fall back to today's per-leaf grant counts. Keeps both rule sets alive for good.
- Rec O1. Consequence: if the leaf lands before N1 and N2 are supplied, every paid launch stops until the key exists.

F7. Is there a per-leaf number at all? (My signposts Q6 was not taken as a signpost.)
- O1 None. Each launch states N and its reason, and the only brake is the existing red-launch paragraph of `## Grant reuse and count lines`, kept unchanged.
- O2 The plan states an estimate and seats raise it in prose. Nothing enforces it.
- O3 A machine `sessions_per_leaf` key. One more number from the operator.
- Rec O1. Risk it leaves: one leaf can use the whole day and starve the others.

F8. The minutes bound ("each ending within 15 minutes").
- O1 It stays a property the live test enforces and reports, and the machine ceiling counts sessions only.
- O2 run-check enforces a deadline with `RuntimeMaxSec` on the run scope. Killing the scope kills the driver before its cleanup, while the hc sessions live outside the scope and keep running.
- Rec O1, unless a deadline that still runs cleanup is designed.

F9. Form of the stop at the ceiling (inside S4 O1).
- O1 `failed` with one notice, recovered by the operator.
- O2 A wait that resumes when the window frees, with one notice. `waitReasonSchema` already has `capacity`.
- Rec O2 if a seat can enter that wait without new machinery, else O1. A daily ceiling clears itself, so `failed` makes the operator do what the clock would.

F10. Where S5's floor is written once.
- O1 One sentence in standing-design's recorded-output line (the fresh-call sentence), which already makes sufficiency the model's choice. Seats read it through each leaf design, and check-issue cites it.
- O2 In `skills/lifecycle-rules.md`. Splits proof rules across two files.
- Rec O1. The same sentence must settle wording-only fixes: a fix to model-facing text is judged by the seat for whether it can change the proven property, with the reason recorded. Today's "an input whose effect is unknown is investigated, never silently reused" stays.

F11. Who writes the ceiling key.
- O1 The operator, by one printed command or edit. No seat or door ever writes it.
- O2 The door writes it from the operator's words.
- Rec O1. A seat that can write its own ceiling removes the only guard.

## 2. Surfaces and redundancy

- T1 `skills/lifecycle-rules.md` `## Grant reuse and count lines`, first paragraph: remove the count-line sentences and the warn-and-continue sentence, add the reservation. The second paragraph loses only "This changes no count line or repeat-bound rule."
- T2 skills/chart-issues/SKILL.md `## Take`: "within the one operator-approved paid test budget", the repeat-bound unit sentence, the renewal sentence, and "the door itself never warns and runs". `## Open` needs paragraph: "paid or nested launches, paid budget" rows. `## Handoff`: "each leaf's recorded grant, paid model launches included, confirmed" and the live-run review line's session count.
- T3 autopilot.md: the wait for "a mutating or paid proof call" becomes mutating only.
- T4 standing-design.md: "A fresh call runs only under a covering grant ... a call past a repeat-count bound warned under the seat rule is covered", plus the F10 sentence.
- T5 shapes.md `### readiness.yaml`: the `bounds` and `stop_line` placeholder text. `## Preflight and validation`: "names a session count, which belongs in the handoff review line".
- T6 skills/check-issue/SKILL.md `## check.review`: the count audit sentence shrinks to "paid activity with no reservation row is a Fix". `## Shared context` operator-only rule: a needed fresh run is a Fix for repair. `## check.repair`: "replaying ... under the grant reuse rule".
- T7 skills/implement-issue/SKILL.md `## Shared context` ("record file for grant count lines") and `## implement` ("writes its count line"). skills/plan-issue/SKILL.md `## Shared context`, same phrase. skills/AREA.md `## Key files`.
- T8 skills/watch-issues/consultant-brief.md `## Limits` ("spend past a recorded grant") and skills/mine-issues/SKILL.md `## Sources` ("count lines").
- T9 docs: reference/limits.md `## What stays your job`, use/autopilot.md, use/plan-work.md `## Set the signposts`, use/watch-while-away.md `## What stays yours`, reference/files.md (timing row fields), reference/config.md, reference/commands.md and reference/checks.md (the new flag).
- T10 code: `globalSchema`, `runCheck` and `checkedRun`, `timingEventSchema`, `RUN_CHECK_USAGE`, the config printer.
- Removable: renewal entries (named only in `## Take`, no schema shape), "expiry" for paid launches, and the door's separate overrun rule. Out of scope, record only: six names for one stop, and the abandoned-capture sentence copied in six places.

## 3. Practitioner questions and lifetime pitfalls

- Q1 Does one green prove enough for behavior that varies run to run? The S5 floor accepts one. The sufficiency reason should name the property the green observed and the cause of each red.
- Q2 Reserve before spending or count after? Reserve before: a crash after reserving still counts, which errs toward spending less.
- Q3 Should a missing or unreadable ledger refuse or allow? Refuse.
- R1 Undeclared paid runs. Fail closed with one line: run-check sets `AKROGON_SESSIONS=N` in `constructedEnv` only for a reserved run, and each live test refuses without it. The four tests/e2e paid files already state their bound in comments.
- R2 Seat sessions use the same subscriptions and are not counted. The ceiling bounds test launches only, and the docs must say so.
- R3 Over-reservation. A seat that always declares a large N wastes the day's allowance. The reviewer reads N against the sessions the run started.
- R4 Self-judged reds. The cause is a machine fact when it is a ceiling refusal row. A red inside the test is judged by the seat and read by the other-model reviewer.
- R5 Cleanup debt grows with runs. Leftover cleanup before the next launch stays a stop.
- R6 This host's ceiling is an operator fact, so the docs example must not present 20 as a default.

## 4. Leaves

- L1 `session-ceiling` (code, T10): the config key, `--sessions`, the timing field, the refusal and `AKROGON_SESSIONS`. Free proof under a temp `AKROGON_HOME` with a stub argv: a run under the ceiling passes, a run over it refuses and starts no command, an absent key refuses, rows from two registered repos sum, a row older than the window is not counted, and two concurrent reservations cannot both pass the last slot.
- L2 `budget-rules` (prose, T1 to T9, with the F10 floor): depends on L1, because the rules name the flag and landing them first would send seats to a command that does not exist. Free proof: tests/chart-shapes.test.ts still parses the shapes example, tests/docs-links.test.ts and tests/command-reference.test.ts pass with the new flag, and the reviewing seat reads the rule text.
- One prose leaf, not two: a state where the door has stopped writing counts while seats still require count lines must not land. The S5 floor could land first as its own leaf with no dependency, but it edits the same standing-design sentence as L2, so I recommend keeping it in L2.

## 5. External operations to observe before handoff

None paid. Free ones:
- X1 A real `akrogon run-check` from a leaf worktree: confirm the timing row lands in the registered root's `issues/timings.jsonl`, which F3 O1 relies on.
- X2 `akrogon config` on this host: how it prints `~/.akrogon/config.yaml`, for the N1 and N2 done-check.
- X3 The auto-mode classifier: one real draft-grant write whose `approved.answer` quotes N1, once N1 exists. If it is refused, F4 needs another pick.
- X4 Only if F8 takes O2: `systemd-run --scope -p RuntimeMaxSec=` on systemd 262, observing what the driver receives.
