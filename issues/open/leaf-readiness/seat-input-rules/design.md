# Design: seat-input-rules

## Binding decisions, verbatim

### Blocker record ([blocker-record](../../../chart/leaf-readiness/forks/blocker-record.md))

2026-10-02, operator: `1a`

Reconcile the rules at their source. Human-only prerequisite, owner operator, completion recorded before the affected leaves open: remove the user-level command-text deny `Bash(* .env*)` from ~/.claude/settings.json; keep the file-tool denies and direct dumping bans; explicitly permit the narrow producer-key save in each harness, including the pi `tamdoma-env-guard`; confirm configured merge checks may read the committed `.env.example`. Leaf scope: phase skills permit process consumption for declared checks and live operations, by-name presence results (absent or empty is missing), and only the taken producer-key write into the real file of the contract's declared holding repo, never the worktree symlink; the producer passes the value privately, changes only the named entry, never prints it or puts it in arguments, and revokes it if saving fails. Blockers use the existing `akrogon phase <slug> failed --reason "<blocker and artifact>" --slot <seat>` with name or ID, attempted operation, identity reference, error, owner and next action in the pass artifact, never values. After reconciliation, the presence check, blocker transition and producer-save route are each demonstrated once under the actual consuming harness with throwaway inputs.

Reason: the conflict is between policy sources and declared operations; a helper that passes because a matcher misses it is not authorization and still needs the same rule change.

Foreclosed: 1b akrogon env command family.

### Save route ([save-route](../../../chart/leaf-readiness/forks/save-route.md))

2026-10-02, operator: `1a`

A producer's readiness contract names its save operation: entry point, inspected revision, non-secret arguments, key name, the holding repo's real file and the private value source. Saving happens inside the producer process that receives the key, or the value passes privately to a narrow save subprocess; it never returns to the agent to build a command. At charting the door proves on disposable data that only the named entry changes, other entries are preserved and nothing prints; inspects the real target's effective harness controls and records why the result transfers; and proves real revocation on a disposable provider-issued key with the producer identity. The operator's approval of that recorded operation plus the proof is the explicit permission. No redundant allow entry or pi guard change; a control that denies the operation is reconciled at its source and re-proved; no safe representative proof holds that producer's handoff. Tool edits, shell redirects and dumping stay refused.

Refines blocker-record: the operator prerequisite is removing `Bash(* .env*)` and confirming merge checks may read `.env.example`; "explicitly permit the narrow producer save in each harness" is met per producer by this recorded, proven operation.

Reason: an allow entry records permission but does not limit what code writes; the guards have no save allowlist; framework producers already save in-process.

Foreclosed: 1b per-harness allow entries and a pi guard save-policy leaf.

### Key creation ([key-creation](../../../chart/leaf-readiness/forks/key-creation.md))

2026-10-02, operator, verbatim: "1a - but when will that happen? At what point? Do I just look at the list from the akrogon status and do it manually? How can I get the instructions from the agent to tell me how to get those keys exactly? | 2a"

Q1 taken 1a: the operator creates every missing outside-account key in one batch before handoff, from the door's list. No agent holds a key-creating key. Reason: smallest exposure, works for every provider, no current need for agent issuance. Foreclosed: 1b agent issuance from an approved held parent (B's pick), 1c agents mint whenever possible.

Q2 taken 2a: a leaf that creates something with its own key stores that key itself, declared up front as produced by that leaf; dependents wait on it; the write touches only that named value in the declared repo's env, is authorized in the contract, never prints it, and revokes the new key if saving fails. Foreclosed: 2b operator copies it by hand.

The operator's when/how question moved to [key-sheet](key-sheet.md).

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

### Env source ([env-source](../../../chart/leaf-readiness/forks/env-source.md))

2026-10-02, operator, verbatim: "1a"

When akrogon prepares a leaf worktree (new or reused), it links `<worktree>/.env` to the registered checkout's file, found through the existing repo registration. It refuses, never overwrites, when the path is a real file, a tracked path, a different link, or when the link or target is not gitignored, and never creates an empty target. Writes go to the real file, never through the link. Worktree removal deletes only the link. Client repos keep their own file. Presence is still checked at dispatch; a dangling link counts as missing. Reason: one file, keys added mid-run reach every leaf, no script changes. Foreclosed: 1b path only, 1c env-aware runner, copy, value injection.

### Excluded binding decisions

- readiness-contract and key-sheet: schema, gap check and status output belong to readiness-contract, and the key sheet and door proofs to door-readiness. Seats consume `akrogon status` output only
- env-source link creation: env-link's code. Seats only follow "writes go to the real file"

## Standing design

/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md (installed at ~/.claude/skills/chart-issues/assets/standing-design.md)

- Leaf work is agent-owned. The operator prerequisite (blocker-record Taken, refined by save-route Taken) was completed 2026-10-02 and recorded in the chart. A charting probe the same day ran a command naming the env file under claude, codex and pi with no denial.
- Live run: criterion 4 is the one live run. It is needed because a harness's permission decision on a real command cannot be shown by a smaller check (blocker-record Taken: demonstrated once under the actual harness). It uses throwaway names, a scratch akrogon home and a scratch repo, and never reads or writes a real `.env`.
- LESSONS 2026-10-01 records that prose assertions couple tests to wording, so prose criteria are judged in review and the report quotes each changed sentence against its binding decision.
- LESSONS 2026-09-14 records `bun -e` argv shifting per harness, which removing the one-liner avoids.
- No hardcoded secrets. Values never appear in reasons or artifacts.
- Not applicable: auth mocks, server authorization, backend mutation, browser flows.

## Leaf architecture

Owned surfaces: `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `skills/AREA.md`. Scratch demo repos and homes live outside the repo and are deleted after the transcripts are copied into `implementation/`. (A,B)

Interfaces consumed: `akrogon status <slug>` lines of the form `Missing: <repo>/<slug> <kind> <name> in <holder>: <steps>`, and the `readiness.yaml` fields from readiness-contract (`produces[].save`, `grants[]` with `fixtures[].cleanup` and `absence_check`, `retained[]`).

Human-only prerequisite, owner operator, completed 2026-10-02 with evidence in the chart's blocker-record fork Findings (A,B): remove `Bash(* .env*)` from `~/.claude/settings.json`, and confirm configured merge checks may read the committed `.env.example`.

Exclusions: no `src/` change, no chart-issues change, no change to harness configs, the pi guard or consumer repos. merge-issue's `.env.example` exception stays.
