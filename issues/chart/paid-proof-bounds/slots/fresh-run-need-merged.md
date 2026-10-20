# fresh-run-need merged notes

## Options

- O1 one recorded-output rule for every proof, no new mechanism (A,B,C). Model and outside stages replay output saved from one real run, with provenance and never hand-patched. Every deterministic stage, consumer and check runs for real on the current head against that output. A fresh paid call happens only when one of these holds: the stage's model-facing inputs changed (prompt, instructions or templates, model pin, settings, input data, tool or provider contract, output shape); the recording is unreliable or missing; or the criterion's property is fresh-start, order, live orchestration or whole-run behavior (A,B,C). An unknown input counts as changed (C); B: unknown means unresolved evidence to investigate, then a sufficient authorized proof or the blocker stop. This rule already exists in standing-design, scoped to chain triggers. The plan, implement and check rerun rules do not consistently carry the model-versus-consumer split into concrete rerun triggers (A,B,C); implement:67 and check.repair:93 already keep unaffected green proof (B). Cost: a seat must judge which inputs feed the model stage, and can get it wrong either way. The plan writes that input set down so a reviewer can check it (A,B,C).
- O2 a fresh full run after every failure or head change, rejected (A,B,C). This is the current practical reading, and it is what burned the spend. It finds one deterministic defect per run, and after model output fails, rerunning just samples until a lucky pass.
- O3 always reuse the latest output, or "cassette forever", rejected (B,C). A recording can never prove a new prompt or model works.
- O4 time-based re-record, rejected (C): an arbitrary interval, and it breaks the leaf-run-stalls no-clock lock.
- O5 hash or cassette invalidation code in akrogon, rejected (C): more machinery, and a hash cannot see provider drift or which file feeds the model.
- O6 build stage resume now, rejected (A,B,C): operator 4a, and it would still rerun paid stages whose saved output was enough.
- O7 ban live model proofs, or use a cheaper model for reruns, rejected (A): an untested prompt ships, or the behavior under test changes.
- O8 treat a partial or failed saved run as proof of the whole criterion, rejected (B,C). Both leaves closed criterion 4 by operator acceptance, which is a waiver and not proof.

## Sentence changes under O1

- standing-design chain bullet (line 15): widen the replay sentence from "one leaf's output consumed by code another leaf owns" to every multi-stage proof, inside one leaf or across leaves (A,B,C). Clarify that "output shape" means the model or outside output contract, not every consumer's result (B). The chain-specific parts stay.
- standing-design slow/live bullet (line 16): "It reruns every changed stage plus every consumer of its outputs" becomes "under the recorded-output rule" (B). Narrow "when unsure it restarts from a trustworthy point" and "the final proof must be valid at the final commit" for model stages: deterministic stages run at the final commit, and a reused model stage needs its named inputs still valid at that commit (C).
- plan-issue plan synthesis: for each model or outside stage, the rerun trigger names its model-facing input set, the recording it reuses or the one fresh call that creates it, and the consumers that run real. "Head changed" alone is not a valid trigger for a paid stage (A,B,C). "A whole run the brief names stays" gains: it may replay saved model stages through the real spine unless fresh whole-run behavior is the property (C).
- implement-issue implement-end rerun and check.fix "supply passing proof for every done-criterion": rerun only invalidated proof, under the standing-design rule (B,C). A: leave these sentences to the standing-design rule if the plan names the trigger.
- check-issue check.repair "B runs planned live proofs itself, replaying the exact command": B first replays the recording through the real consumers, and pays for a fresh run only when the rule requires it and the grant covers it (B,C).
- shapes.md Preflight audit: refuse a live-run criterion worded as a fresh or full replay unless the brief names the property that saved output with real consumers cannot prove (B,C). This stops avoidable paid work from being locked into a brief.
- Deleted: the blanket freshness clauses in standing-design line 16 (C), and the "fresh evidence dir on failure" and "head changed" restart recipes in future plans (B,C). No code (A,B,C).

## Evidence

- Operator 2026-10-19 (verbatim in fork Carries): asked for `claude -p` because the framework runs in Claude Code, and wants far fewer test tokens. limit-mechanism Taken: one lifetime grant, no counter.
- Code, read 2026-10-19: standing-design lines 10, 15 and 16 already hold cheapest-sufficient proof, recorded replay with re-record triggers, and "a clean full run only when reuse cannot be shown" (A,B,C). The rerun rules in plan-issue, implement-issue and check-issue partition nothing by stage (A,B,C).
- Framework plans: hub-child-links plan.md:52,61 ("fresh evidence dir" on failure, trigger "templates, brief or verify changes"); replay-cases plan.md:51,53 ("leaf head or plumbing fixture change", "restarts from scratch") (B,C).
- Framework reports (B,C): hub-child-links criteria 1-3 were deterministic and proven offline in seconds. Attempts 1-11 each found one deterministic defect (B,C); every fix could be proven on the previous run's saved artifacts (C), while slot pin, lease and dispatch binding changes may need a fresh affected interaction (B). Attempts 12-15 were writer-conformance variance, so a rerun was sampling for luck. replay-cases runs 1-19 found one machinery defect each, and the final layout fix was proven on run-19's saved dist with no fresh run. Fresh runs that were truly needed: each leaf's first run after its model-facing change, plus replay-cases' final whole run to the human gate, which never happened and was waived (C). Roughly 35 paid attempts, about 3 of them needed (C, inference from reports, not measured spend; B declines to give a count).
- Framework checker: check-satellite-live-replay.ts checkRevision requires the receipt at the current HEAD, so an old full receipt cannot be reused; the contract must change or a whole run must be paid (B).
- The framework already uses committed `claude -p` recordings with provenance in its own suites (context-delivery recordings, composition-spine) (C).
- Practitioner, read 2026-10-19: Eidolon AI, vcrpy for LLM app tests, kept separate from prompt quality checks (B). Simon Willison's LLM, pytest-recording of real responses (B). Awsaf Alam 2026-03-10: a replay miss fails, it never calls the API (B). Netflix Polly.JS and VCR.py record-once modes; re-record on contract change, never on a schedule (C). Anthropic test docs: code grading against golden outputs is the fastest and most reliable (C).

## Pitfalls and what removes them

- A recording goes stale through provider drift: provenance (pin and date) plus the unreliable-recording trigger. A criterion about current provider behavior says so and pays fresh (A,B,C).
- A missing recording quietly spends money: no live fallback. It takes a grant-covered fresh call or the blocker stop (B,C).
- Saved output is deleted (`rm -rf .temp/...`): a recording counts only when it is durable, either a committed fixture or a preserved path with provenance in the report (C). Preserve failed raw output before cleaning (B).
- One lucky sample is called conformance: if reliability across runs is the property, the brief says so and pays for sampling under a grant (B,C).
- An input is missed, so reuse proves the old pipeline: the plan names the input set, and unknown counts as changed (A,B,C).
- Orchestration behavior (leases, dispatch, session recovery): replay tests the decision logic (B,C); a claim about real admission, hooks or timing needs the smallest fresh affected interaction, not automatically a whole run (B); when whole-run behavior is the product, one fresh run is final confirmation, not debugging (C).
- A recorded stage is labelled real: standing-design already refuses this (A,B).

## Open questions

- Do the open framework leaves get their criteria amended now, or does the rule apply only to future handoffs? This is an operator action; seats cannot amend locked contracts (A,B).
- May a leaf commit the recording from its one fresh call as a test fixture, or is that proof machinery that needs a prerequisite leaf? C: a recording is test input, not machinery. A: if the runner cannot replay, that is a prerequisite leaf.
- Does "model behavior under test" include live session admission, hooks and routing (B)?
- May a recording captured by another leaf at another head be reused (C)?

## Where slots differ

- Scope (B,C rebuttals): O1 governs future contracts and plans only. A locked criterion naming a fresh or full replay, or a current-HEAD receipt, stands until the operator amends it.
- Recording vs machinery (C rebuttal): committing recorded output is test input; building replay support is machinery and a prerequisite leaf.
- A's plan-only variant: C rebuts that both plans named triggers and named wrong ones, so the seat-skill rerun clauses must carry the split too. A accepts.

- Seat-skill sentences: B and C edit implement-issue and check-issue to point at the rule. A would leave them alone if the plan names the trigger.
- Preflight refusal of full-replay criteria: B and C add it. A did not propose it.
- Missing replay support: A sends it to a prerequisite leaf. C says committing a recording is not machinery. B says use existing consumer checks and never claim resume the runner lacks.
- Count of avoidable runs: C estimates about 32 of about 35. B declines to assign a number.
