# Design: door-readiness

## Binding decisions, verbatim

### Readiness contract ([readiness-contract](../../../chart/leaf-readiness/forks/readiness-contract.md))

2026-10-02, operator: `1a`

Each leaf carries a readiness contract written by the door: env names with the repo whose env holds them, required files, granted live changes, and proof records naming the identity and target used. `akrogon next` refuses dispatch while any declared input is absent or empty, and `akrogon status` lists every gap across open leaves. akrogon makes no live calls. Reason: the prose-only rule already failed (F1); gaps should cost a status line, not seat hours.

Foreclosed: 1b, prose plus a stricter door audit only.

Correction 2026-10-02, operator, verbatim: "This should be general, not for Cloudflare or GitHub only. Every time a leaf needs something I need to know up front."
Applies as: the contract is provider-neutral and covers every need of any kind (keys, scopes, files, hostnames, approvals, values produced by other leaves); all of it is visible to the operator before handoff.

### Key creation ([key-creation](../../../chart/leaf-readiness/forks/key-creation.md))

2026-10-02, operator, verbatim: "1a - but when will that happen? At what point? Do I just look at the list from the akrogon status and do it manually? How can I get the instructions from the agent to tell me how to get those keys exactly? | 2a"

Q1 taken 1a: the operator creates every missing outside-account key in one batch before handoff, from the door's list. No agent holds a key-creating key. Reason: smallest exposure, works for every provider, no current need for agent issuance. Foreclosed: 1b agent issuance from an approved held parent (B's pick), 1c agents mint whenever possible.

Q2 taken 2a: a leaf that creates something with its own key stores that key itself, declared up front as produced by that leaf; dependents wait on it; the write touches only that named value in the declared repo's env, is authorized in the contract, never prints it, and revokes the new key if saving fails. Foreclosed: 2b operator copies it by hand.

The operator's when/how question moved to [key-sheet](key-sheet.md).

### Key sheet ([key-sheet](../../../chart/leaf-readiness/forks/key-sheet.md))

2026-10-02, operator, verbatim: "1a"

The operator completes the inputs during charting, after forks settle and before the door's proof calls. The door shows one sheet listing every need across the proposed leaves, each with purpose, consuming leaves, exact permissions and resources, official source and date checked, destination (keys and values to the declared env, files to their paths, approvals to authorization records) and what done looks like. One complete list, completed at the operator's pace; asynchronous approvals are waited for before the affected proofs. The door checks presence and runs the proofs; a failed proof yields a specific repair step. Handoff stores the steps in each leaf's contract; `akrogon status` prints any still-missing need with its steps; `akrogon next` refuses dispatch. A leaf-produced value is proven after its producer delivers, so that dependent hands off after the producer. Reason: steps stay with the leaf, no lost chat context, no extra command. Foreclosed: 1b door-only sheet with names in status, 1c separate instructions command.

### Live change grant ([live-change-grant](../../../chart/leaf-readiness/forks/live-change-grant.md))

2026-10-02, operator: `1a then` (after asking "what does planning time mean? Charting?"; answered: yes, during charting before the first mutating proof, confirmed at handoff review).

Each leaf's readiness contract carries one scoped live-change grant, recorded by the door during charting before the first mutating proof and confirmed at handoff review. It names approval provenance; the verified principal and account from the door's proof plus credential name and holding repo, never the value; targets by name or ID, and leaf-created fixtures by account, purpose, ownership marker, naming rule and count, with created IDs linked to the leaf before any change or deletion; operations including transitive helpers, checks and cleanup, with destructive, public, billing, DNS and retention effects explicit; repeat and recovery bounds; the stop line for what stays human; lifetime (the leaf's unless shorter). Seats reuse it for probes, implementation, repairs, reruns, merge checks and cleanup without asking again, never widen it, and record the grant reference, results and created IDs in their pass artifact. Phase ownership is unchanged (check.fix B hands required live runs to A). New approval is needed for a different identity or account, a target outside the set, a new or different mutation, larger effects, or expiry. The grant needs a schema-backed place in leaf state.

Reason: a design requiring a live run was not read as permission and emdash-launch waited about 8 h (I6); per-run approval repeats that wait (DORA); an open grant leaves accounts, targets and deletes unbounded.

Foreclosed: 1b approval per live run; 1c handoff as permission for anything.

### Proof fixtures ([proof-fixtures](../../../chart/leaf-readiness/forks/proof-fixtures.md))

2026-10-02, operator: `1a | 2a`

Q1 1a: proof fixtures are disposable by default. Before creation the readiness contract names the cleanup sequence (transitive resources, contents and config included), the identity for each step (the creating identity by default, another only when declared and proven before handoff), and the authenticated read-back proving absence. The door's probe proves a small create/use/delete cycle with those identities at charting. Each pass records created IDs under the live-change grant and runs cleanup on success and failure. Absence is proven by provider-appropriate authenticated read-back with visibility shown first, never by a delete reply. Leftover disposable resources are a blocker recorded with IDs, error, owner and next step.

Q2 2a: a fixture stays after its proof only by agreement before creation, with purpose, resources, an accepting owner, removal date, cost and exposure, cleanup identity and route, and why the proof needs it alive. Pass artifacts label agreed-retained resources apart from still-to-delete ones. A cleanup failure never becomes retention afterward. Real backup locks and retention are never weakened. Retention cannot satisfy a deletion criterion or waive operation proof; no safe sufficient proof holds the handoff. When a proof promises the real retention duration it keeps it; lock-rule removal is not a proven cleanup route.

Reason: creation access did not bring delete access (I7), and a nominal throwaway took on a 30-day lock (I12); both surfaced mid-leaf.

Foreclosed: 1b operator cleanup after each proof; 1c account-wide sweeper (live accounts, not dedicated test accounts); 2b no retention.

### Save route ([save-route](../../../chart/leaf-readiness/forks/save-route.md))

2026-10-02, operator: `1a`

A producer's readiness contract names its save operation: entry point, inspected revision, non-secret arguments, key name, the holding repo's real file and the private value source. Saving happens inside the producer process that receives the key, or the value passes privately to a narrow save subprocess; it never returns to the agent to build a command. At charting the door proves on disposable data that only the named entry changes, other entries are preserved and nothing prints; inspects the real target's effective harness controls and records why the result transfers; and proves real revocation on a disposable provider-issued key with the producer identity. The operator's approval of that recorded operation plus the proof is the explicit permission. No redundant allow entry or pi guard change; a control that denies the operation is reconciled at its source and re-proved; no safe representative proof holds that producer's handoff. Tool edits, shell redirects and dumping stay refused.

Refines blocker-record: the operator prerequisite is removing `Bash(* .env*)` and confirming merge checks may read `.env.example`; "explicitly permit the narrow producer save in each harness" is met per producer by this recorded, proven operation.

Reason: an allow entry records permission but does not limit what code writes; the guards have no save allowlist; framework producers already save in-process.

Foreclosed: 1b per-harness allow entries and a pi guard save-policy leaf.

### Excluded binding decisions

- env-source: worktree link creation is env-link's code. The door only records holders
- blocker-record: seat skills belong to seat-input-rules, and the settings change is an operator step
- gap computation and dispatch refusal in readiness-contract: owned by readiness-contract. The door calls `akrogon status`

## Standing design

/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md (installed at ~/.claude/skills/chart-issues/assets/standing-design.md)

- Writer and checker share one rule definition: the door writes `readiness.yaml` and akrogon parses it with `readinessSchema`. Criterion 1 is the agreement test between the shapes.md example and the schema.
- LESSONS 2026-10-01 records that prose assertions couple tests to wording, so the only new test parses the YAML example and prose criteria are judged in review.
- LESSONS 2026-09-11 records stale rules left in `docs/`, so criterion 4 sweeps `docs/` and `skills/`.
- No hardcoded secrets: examples use placeholder names, never values.
- Cheapest sufficient tests: one parse test. No live call.
- Not applicable: auth mocks, server authorization, backend mutation, browser flows.

## Leaf architecture

Owned surfaces: `skills/chart-issues/SKILL.md` (Take, Handoff), `skills/chart-issues/assets/shapes.md` (Leaf files, Preflight and validation), `tests/chart-shapes.test.ts` (new), and any `docs/` page criterion 4 finds stating the old credential list.

Interfaces consumed: `readinessSchema` with field names exactly as in readiness-contract's design: `inputs[].kind|name|holder|purpose|consumers|steps|source|done`, `produces[].name|holder|consumers|save.entry|save.revision|save.args|save.value_source`, `grants[].approved|principal|account|credential|targets|fixtures|operations|effects|bounds|stop_line|expires`, `fixtures[].account|purpose|marker|naming|count|cleanup[].step|cleanup[].identity|absence_check`, `retained[].resources|purpose|owner|remove_by|cost|exposure|cleanup.identity|cleanup.route|reason` (A,B), `proofs[].operation|command|identity|target|version|date|result|cleanup|limits|record`, where `record` is the chart fork path holding the full proof.

Pre-handoff presence check (A,B): SKILL.md tells the door to run, from the akrogon root resolved by `readlink -f $(command -v akrogon)` (`<root>/src/akrogon.ts` on 2026-10-02), `bun -e "import {readGlobal} from './src/config.ts'; import {readReadiness, gaps} from './src/readiness.ts'; console.log(JSON.stringify(gaps(readGlobal(), readReadiness('<draft folder>')!)))"`, which prints names only. After handoff, `akrogon status` validates the emitted files. No new command or flag, because key-sheet Taken chose "no extra command".

Exclusions: no change to seat skills, `src/`, or `questions.md`. The existing Take operation-proof rule keeps its text and gains only the link to `proofs`. No paths under `issues/`.
