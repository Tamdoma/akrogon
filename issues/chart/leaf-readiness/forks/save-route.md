# Save route

## Question
Q1. How does a producer leaf (key-creation 2a) save a key it created, and what makes that save explicitly permitted in each harness: a save command declared in the producer's readiness contract and proven by the door at charting, run as a subprocess with no harness change beyond removing the sentence deny; or per-harness allow entries (a Claude allow rule for the exact command, a pi guard allowlist change in the registered pi-extensions repo)?

### Carries
- [blocker-record](blocker-record.md): taken 1a; "explicitly permit the narrow producer-key save in each harness, including the pi `tamdoma-env-guard`"; B round: "If the installed controls cannot express that exception safely, the prerequisite remains open and handoff is held while the operator selects a permitted mechanism."
- [key-creation](key-creation.md): taken 2a; the write touches only that named value in the declared repo's env, is authorized in the contract, never prints it, and revokes the new key if saving fails.
- [readiness-contract](readiness-contract.md), [key-sheet](key-sheet.md), [env-source](env-source.md): taken 1a.
- Found while drafting contracts 2026-10-02: the pi guard (`~/.pi/agent/extensions/tamdoma-env-guard/index.ts`, registered repo pi-extensions) refuses tool writes and shell redirects to protected names (:1104-1153) but not a script that opens the file itself; Claude Code `Edit` denies do not cover subprocess writes (permissions docs); probe 2026-10-02, Claude Code 2.1.287: `echo "probe: missing FOO absent from .env"` was denied by `Bash(* .env*)`.
- None of the five proposed akrogon leaves produces a key; the route is used by future consumer producer leaves.

## Findings
- Round files: slots/save-route-A.md, slots/save-route-B.md, slots/save-route-merged.md, slots/save-route-rebuttal-B.md. B rebuttal R1-R2 applied.
- (A,B) pi guard refuses tool writes and recognized shell mutations, skips other commands, has no save allowlist (index.ts:843-895,1104-1185; tests :260-298). Claude allows cannot beat denies; Edit denies skip subprocesses; sandbox may still block. Codex rules match argument prefixes.
- (B) Framework producers already save in-process (dev-build-emdash setup-claim.playwright.ts:37-68,285-288; admin-session.ts:83-115) but write the whole file; feasibility only.
- (A,B) Recommend 1a: the producer contract names the save operation (entry point, revision, non-secret args, key name, holding file, private value source); prefer in-process save; door proves only-named-entry change, preservation and silence on disposable data, inspects the real target's effective controls and records why the permission result transfers (B R1), and proves real revocation on a disposable provider-issued key with the producer identity (B R2); no redundant allow entry; a denying control is reconciled at source and re-proved; no safe representative proof holds that producer's handoff. Applies to future producers, not the five current leaves.
- 1b: dedicated allow entry per producer per harness plus a pi guard save-policy leaf in pi-extensions; second policy store; a command match does not limit what code writes.
- Research: Trail of Bits claude-code-config; Claude Code permissions; Codex rules; pi guard source/tests; framework producers; all read 2026-10-02.

## Taken
2026-10-02, operator: `1a`

A producer's readiness contract names its save operation: entry point, inspected revision, non-secret arguments, key name, the holding repo's real file and the private value source. Saving happens inside the producer process that receives the key, or the value passes privately to a narrow save subprocess; it never returns to the agent to build a command. At charting the door proves on disposable data that only the named entry changes, other entries are preserved and nothing prints; inspects the real target's effective harness controls and records why the result transfers; and proves real revocation on a disposable provider-issued key with the producer identity. The operator's approval of that recorded operation plus the proof is the explicit permission. No redundant allow entry or pi guard change; a control that denies the operation is reconciled at its source and re-proved; no safe representative proof holds that producer's handoff. Tool edits, shell redirects and dumping stay refused.

Refines blocker-record: the operator prerequisite is removing `Bash(* .env*)` and confirming merge checks may read `.env.example`; "explicitly permit the narrow producer save in each harness" is met per producer by this recorded, proven operation.

Reason: an allow entry records permission but does not limit what code writes; the guards have no save allowlist; framework producers already save in-process.

Foreclosed: 1b per-harness allow entries and a pi guard save-policy leaf.
