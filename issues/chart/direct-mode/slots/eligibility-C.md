# Eligibility fork notes, slot C (blind)

Carries: container 1a, no leaf record, chart folder holds the work.

## Q1. Which jobs may the door offer as direct, and which are refused outright?

### Pick
Direct is offered only when every one of these holds, checked mechanically on the draft contracts before the handoff review; any miss removes the option without a question:

1. One destination, one leaf, `blocked-by` empty.
2. Draft `readiness.yaml` has empty `inputs`, `produces`, `grants` and `retained`. `proofs` the door ran at charting are fine; they are door work, not seat work.
3. No done-criterion names a live run or an outside call during implementation.
4. No human-only prerequisite still pending (already a handoff block, SKILL.md:59; stated here so direct cannot be read as a way around it).
5. B named at open (SKILL.md:25).

Reason: under 1a the mechanisms that make inputs and grants safe for a seat do not exist. `akrogon status` cannot see readiness without `state.yaml` (SKILL.md:83), and the seats' only permitted presence check is the `Missing:` lines of `akrogon status <slug>` (implement-issue/SKILL.md:45, :59; check-issue/SKILL.md:31). Grant reuse, created-ID records and the stop line all read `grants[]` from the leaf (implement-issue/SKILL.md:49; check-issue/SKILL.md:33). A direct job with any of these would run live operations with no presence gate and no grant the reviewer can compare against. Everything above the list (size, number of files, judgment calls) stays the door's recommendation and the operator's choice, not a rule.

Cost: a genuinely small job that reads one env value at test time is refused and goes through the lifecycle. Acceptable; the lifecycle is one leaf away and the drafts are already written.

### Rejected
- Conceptual eligibility with recorded reasons and no categorical ban on live operations. Rejected because a reason in a fork file is not a gate: nothing stops the door mid-implementation when a value is absent or a mutation exceeds what was discussed, and B has no record to review against. Under 1c (foreclosed) this would have been fine.
- Size thresholds (lines, files). Already off route in CHART.md; not observable before implementation.
- Refusing any job with `proofs` at all. Too wide: a charting proof is run by the door with its own identity before handoff (SKILL.md:57) and leaves nothing for the implementer to redo.

### Evidence
- better-than-training, chart-issues/SKILL.md:57-63 and :83, read 2026-10-08: proof, grant and fixture rules are leaf contracts; status cannot see drafts without state.
- better-than-training, implement-issue/SKILL.md:45, :49, :59; check-issue/SKILL.md:31, :33, read 2026-10-08: presence and grant reuse depend on the leaf record.
- better-than-training, shapes.md:169-247, read 2026-10-08: the five readiness sections the check reads; `proofs` are records, the other four are seat-facing.
- better-than-training, src/turn.ts:8-23, read 2026-10-08: `eligibility` already encodes "inputs missing means not dispatchable"; the direct check mirrors it with "inputs present at all means not direct".

### Pitfalls and what removes each
- A need discovered mid-implementation (an env value, a token scope). Removed by the growth fork's stop: the door stops, keeps the branch, hands off as a leaf; readiness then carries the need.
- A check command that itself reads `.env` (none in this repo: issues/config.yaml:7-11 are format, test, typecheck, test_changed). Removed by condition 2 being judged on the draft readiness plus the door reading the destination's `checks` list for env use at the review.
- Door treating "very small" as a reason to skip the question, by analogy with debate (SKILL.md:69). Removed by Q2: direct is never auto-chosen.

## Q2. Does the repo setting only allow the door to offer direct, or authorize direct by default for eligible jobs?

### Pick
Allow only. `direct: false` boolean in `repoSchema` (src/config.ts:38-60), printed by `akrogon config`. When true and Q1 passes, the handoff review carries one question, lifecycle or direct, with the door's recommendation; the operator answers; recommendation or silence never selects direct (questions.md:31). When false or Q1 fails, no question and the review says in one line why direct is unavailable.

Reason: the intake says "not gonna be default mode" and "advise ... whether to use the full life cycle or just do it immediately now". Advising means asking. Direct changes who writes the code and removes the command's guards; that is an operator choice each time, not a repo-wide default.

Cost: one more reply per eligible chart.

### Rejected
- `direct: true` means direct whenever Q1 passes, no question. Rejected: Q1 is the mechanical floor, not a judgment of size; an auto pick lands code on main without lifecycle guards on the door's judgment alone.
- Three-valued setting (`off`, `ask`, `always`). Nobody asked for `always`; adds a mode and a schema enum for a hypothetical. If wanted later, a boolean widens to an enum without breaking `false`.
- Machine-level key in `globalSchema` (src/config.ts:23-30). The intake says per consuming repo; `slots` shows repo config is where per-repo policy goes (src/config.ts:59).

### Evidence
- operator, INTAKE.md:12, read 2026-10-08: "not gonna be default mode", "advise ... whether to use the full life cycle".
- better-than-training, chart-issues/SKILL.md:69 and questions.md:31, read 2026-10-08: debate is asked once at the door; recommendations and silence cannot supply an answer.
- better-than-training, src/config.ts:38-60, read 2026-10-08: strict repo schema, so the key must exist in the schema for every command to parse config.

### Pitfalls and what removes each
- A consuming repo that never opted in sees the question anyway. Removed by the default `false` in the schema; no key, no option.
- Debate question and direct question both shown. Under 1a there is no leaf, so `debate` (src/state.ts:66) has no home; the review asks lifecycle-with-debate or direct as one question, and the debate sub-choice applies only on lifecycle.

## Questions C would ask that the fork does not
- Is the question asked when the operator already authorized direct in the session text? SKILL.md:69 says concrete handoff authorization supplied in the session is recognized instead of asking again. Suggest the same rule applies: an explicit "do it direct" in the intake counts as the answer, a recommendation request does not.
- Which seat's config applies to the door's implementation? Dispatched seats get `--dangerously-skip-permissions` from the harness line; the door runs with whatever the operator opened. Not a gate, but the review should say the door may hit permission prompts.
