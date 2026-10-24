# Seat B: disagreement-only rebuttal

2026-10-24. Read A's map, C's map and the merged map. Positions below replace B's earlier recommendations where stated. No Herdr mutation, akrogon command or peer script was run. Only this return file was written.

## D1. A's native-session anchor removes the initial discovery objection, conditionally

I accept A's anchor as an alternative to operator-supplied session names **if D2 explicitly chooses same-session peers**. Unlike bare pane lookup, it distinguishes A from a same-id pane on another server. Require the matching row to hold both A's expected pane id and A's current native agent session id. Search every running server with bounded discovery, refuse unreadable servers and zero/multiple matches, then pin the resulting Herdr name before target reads. A's own current native identity must be supplied or otherwise established, not selected by a bare pane lookup first. The fact that seats.yaml records native identity does not establish a script interface for retrieving the current entry.

This removes my “existence is not intent” objection for choosing **A's server**. It does not establish that every operator-supplied peer belongs there. Counterexample: A is in X; the operator's B is in Y; X contains an unrelated pane with B's same id. A's anchor correctly finds X, but checking only the target pane id there selects the wrong B. A map F1 proposes an existence check, while F3 says peers are found by their own native agent session. Those are different guarantees. Either restrict supplied peers to X with an authoritative address at intake, or actually carry and validate each peer's expected native identity before restart/prompt. Do not claim an existence-only check detects a foreign peer.

Evidence: `skills/chart-issues/scripts/peer-ask.ts:49-66` currently seeds native identity from the selected server, so it cannot independently establish intended peer identity; `peer-restart.ts:153-177` similarly obtains both identity and process-info there. A's map sections F1 and F3 describe the inconsistent checks. Better-than-training, inspected 2026-10-24.

## D2. Cross-session peers remain an operator choice

I retain my recommendation to allow explicitly qualified supplied peers. I will accept co-location if the operator chooses it. Created peers sharing A's session is established by `peer-create.ts:58-85`; supplied peers sharing it is not established by `questions.md:46`. The merged map correctly attributes B's position, but A's anchor does not remove this fork or the counterexample in D1. No new peer-identity mechanism should be silently assumed as routing plumbing.

## D3. I now prefer putting the idle gate inside peer-ask

The merge accurately describes my original position, but C's removal of the raw wait chain is simpler once discovery is script-owned. I withdraw the preference to route that chain manually. Preserve its existing contract: every target passes its idle gate before any prompt, a failed gate sends no prompt, and the idle allowance, sequential prompt waits and collection budget fit the harness timeout. Decide the timeout input and retry behavior before handoff. This is a deliberate change to the script contract, not permission to alter end-signal or collection rules.

Evidence: `skills/chart-issues/assets/questions.md:46` owns the current all-waits-first gate and timing arithmetic; `peer-ask.ts:112-128` currently seeds and prompts without that idle phase. Better-than-training, inspected 2026-10-24.

## D4. Correct B's reuse tag: argv builder, not repo resolver

The merged “A and B: reuse session-routing's discovery and argv builder” overstates my agreement. My map says **reuse routing, not repo ownership policy**. Reuse the argv builder. Reuse a generic session-list reader only if the delivered interface fits. The repo-workspace resolver cannot find A by native agent identity and must not be reused as if it can. A peer-local identity resolver may be needed; avoid duplicating generic discovery that is actually exported, without requiring an unrelated source refactor.

Evidence: `issues/open/herdr-session/session-routing/design.md:71-76` delivers repo discovery and an executable-aware builder, but does not contract a native-agent-session resolver or a separately exported session-list reader. B's map “Implementation boundary and verification,” A1, explicitly rejects a second workspace resolver. Better-than-training, 2026-10-24. Also correct A map F1's rationale that these scripts already import repo source: importing peer-wait's `readPeerAgent` is a peer-script import (`door-reset.ts:5`), not a src import. This does not prohibit using the builder.

## D5. Existing verb proofs do not prove every proposed operation

I disagree with A's unconditional “no new external operation.” Existing P1-P7 can transfer for identical routed Herdr verbs, subject to checking flags and limits. They do not establish real harness `/clear` or `/new` behavior, Codex's confirmation turn, or local process-group termination. Those operations are already present in the scripts, but are still external operations a proposed contract may name. The distinction is proof coverage, not whether this change invented the operation.

If contracts claim those live behaviors, A must map adequate existing proof or obtain a grant and run disposable proofs before handoff. C's after-install smoke is useful but cannot replace a required pre-handoff operation proof. If contracts limit new implementation checks to fake-proven routing, explicitly state what inherited evidence does and does not prove. I do not require another paid call merely to repeat adequate existing evidence.

Evidence: `peer-restart.ts:215`; `door-reset.ts:16-19`, `:121-149`; sibling `session-routing/readiness.yaml:71-99` records split/process-info, pi start/prompt/wait/list and cleanup, rather than these reset/kill sequences. `skills/chart-issues/SKILL.md:59` requires real proof of named external operations before handoff. Better-than-training and operator-recorded proof, 2026-10-24.

## D6. Re-anchoring may verify a rerun, but must not retarget its exchange

I retain original-address continuity across children and budget reruns. A's anchor makes a fresh discovery safe only while it establishes the **same server as the original exchange**. Counterexample: a prompted peer was in X; after A resumes in Y, Y contains the same peer pane id. Re-anchoring current A finds Y correctly, but the old exchange still belongs to X. Native end-signal checks alone are insufficient: `peer-wait.ts:294-295` can finish on blocked status or a nonempty file before the grace-path identity check at `:307-308`, and `finish()` obtains the final native session from a fresh roster read (`:241-243`). Wrong-server attribution remains possible even though wait is read-only.

Carry the original qualified address on reruns, or carry an equivalent binding that is checked on every completion path and refuses this counterexample. Re-reading A's current session without comparing original exchange routing does not supply that guarantee. How the address travels is open to the plan. The existing native `session` field must keep its current meaning.

Evidence: the cited peer-wait paths and `peer-ask.ts:80` child launch, better-than-training, inspected 2026-10-24. This is a remaining case A's initial anchor does not remove.
