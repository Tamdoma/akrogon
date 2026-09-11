# Turn Within Phase

Chart skill version: 4

Status: resolved
Type: grilling

## Question

Positions, rebuttals and the fidelity audit all happen inside one phase, P-draft or I-draft. July 28 told them apart with run-status tokens the agents wrote, which the intake rejects. What fact says whose turn it is and which step is next, without parsing prose?

Candidates: file existence (a.md, b.md, rebuttal files), a step field next to phase in state.yaml moved only by the lifecycle command, or finer phases. Blocked by # Next Command Owner because the reader of that fact differs.

## Findings

Tier 2, codebase read on 2026-09-08. Full tables per phase: [phase-passes.md](../research/phase-passes.md). Changes this decision and # Next Command Owner.

- P-draft holds up to 8 passes (grill, two positions, two round-one rebuttals, fork classification, two round-two rebuttals). I-draft holds 7. I-synth holds synthesis, audit, repair, operator direction, approval. C-ready and C-fix hold two concurrent reviews plus repair and QA sub-pass. July 28 told them apart with 28 run-status tokens at the issue root, and the tokens under-describe several passes.
- File existence cannot say whose turn it is in any phase. Create Flow writes the whole file set at scaffold, planning and implementation plan.md, a.md, b.md, and pre-seeds every heading including an empty Fidelity Audit inside planning/b.md. The folder listing is identical from creation to merge. The only existence signals are the worktree folder (execution started) and the issue folder vanishing (merged).
- Two states never reach disk: operator approval at P-synth lives in chat, and the consecutive-drift count at I-synth is nowhere.
- The QA reviewer sub-pass has no token at all.
- Blindness rules are all "do not read section X of the peer's file", not "file does not exist", so the same file is both the blind input and the shared output.

Consequence: any turn signal must either be finer phases (one phase per pass, moved only by the lifecycle command), or files created only when their pass runs (no scaffold), or a step field beside phase. The July 28 scaffold-everything rule is what forced tokens into existence.

Slot A research 2026-09-08. July 28 already had a phase field plus a 30-token next_step field with a 35-line cross-table, tmp+rename and an mkdir lock only on the second file (lifecycle.ts:134-166, 255-289, 773-781, 1025-1066). About 24 real turns after collapsing internals. Finer phases with dotted names, one per pass, moved by compare-and-set and tmp+rename: one field, one table, crash re-prompts the same pass, twice-safe by construction. Files-as-signal fails on four passes (synthesis rewrites in place, approval, audit verdict, C-fix loops). Step field makes illegal pairs representable. Practitioners: Minsky, make illegal states unrepresentable; Erlang gen_statem one state term with sub-state; statecharts, no product means no explosion; Temporal and Step Functions persist one state name per step; rename(2) atomic replace. Routing table lives in the command, one typed constant, config holds per-repo variables only.

Slot B round 2026-09-08 (blind): phases specific enough to name the next pass; positions and rebuttals run together with separate per-slot completion records. Pitfall: one shared done value cannot hold two completions.

Operator answers 2026-09-08: 4 asked for a plainer explanation. 5-B positions at the same time, with the pitfalls to be explained. 6 challenged: why not config, since the operator expected `akrogon status` to be the only command.

Operator answers 2026-09-08 (chat, after explanation): 4-A finer dotted phases, one name per pass. 5-B kept after the pitfalls were shown: a phase with two concurrent agents carries a `done` list and per-slot `attempts`, for example `phase: plan.positions`, `done: [b]`, `attempts: {a: 1, b: 0}`, and `akrogon phase` refuses to move until both slots are in `done`. 6-A after the challenge: `akrogon phase` and `akrogon next` are the agents' commands, `akrogon status` is the operator's, so the routing table lives in the command and config holds per-repo variables only. Check passes map the same way: `check.review` runs both reviewers concurrently, each ending with `akrogon phase <slug> check.review --verdict ready|fix`, the command records slot and verdict, both `ready` moves to `merge`, any `fix` moves to `check.fix` and increments `fix_rounds`; the repair pass ends by re-entering `check.review`, which clears `done` and verdicts; reaching the configured cap (three) marks the issue `failed`. Architecture accepted by the operator, no challenge raised.

Reshape 2026-09-08: 11 open Questions redrawn (config-shape, model-tiering, skill-rewrite, repeat-safety, status-view, handoff-location, peer-questions, parallel-merge, quality-layers, distribution, implementer-brief), none ruled out, no new fork.

## Resolution

Whose turn it is comes from one field: `phase`, a dotted name per pass, about 24 names, moved only by `akrogon phase` with compare-and-set and tmp+rename. A pass whose two slots run concurrently (positions, rebuttals, check reviews) is one phase with a `done` list and per-slot `attempts`; the command refuses to advance until both slots are done, and for reviews it decides from two recorded `--verdict` flags. The fix loop is the review phase entered again with `fix_rounds` one higher, capped by config, cap reached means `failed`. The routing table is a typed constant in the command. Why: one field with no product of phase and step makes illegal pairs unrepresentable (Minsky, gen_statem, statecharts, Temporal), a crash re-prompts the same pass, and no code reads prose or scaffolded files. Forecloses: run-status tokens, a step field beside phase, files-as-turn-signal, a shared single done value, any review verdict parsed from text.

Handoff 2026-09-09 (operator 4-A): `check.review` waits for two recorded verdicts; the re-check after `check.fix` is slot A only; the routing table encodes both routes.
