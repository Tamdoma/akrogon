# Design: readiness-contract

## Binding decisions, verbatim

### Readiness contract ([readiness-contract](../../../chart/leaf-readiness/forks/readiness-contract.md))

2026-10-02, operator: `1a`

Each leaf carries a readiness contract written by the door: env names with the repo whose env holds them, required files, granted live changes, and proof records naming the identity and target used. `akrogon next` refuses dispatch while any declared input is absent or empty, and `akrogon status` lists every gap across open leaves. akrogon makes no live calls. Reason: the prose-only rule already failed (F1); gaps should cost a status line, not seat hours.

Foreclosed: 1b, prose plus a stricter door audit only.

Correction 2026-10-02, operator, verbatim: "This should be general, not for Cloudflare or GitHub only. Every time a leaf needs something I need to know up front."
Applies as: the contract is provider-neutral and covers every need of any kind (keys, scopes, files, hostnames, approvals, values produced by other leaves); all of it is visible to the operator before handoff.

### Key sheet ([key-sheet](../../../chart/leaf-readiness/forks/key-sheet.md))

2026-10-02, operator, verbatim: "1a"

The operator completes the inputs during charting, after forks settle and before the door's proof calls. The door shows one sheet listing every need across the proposed leaves, each with purpose, consuming leaves, exact permissions and resources, official source and date checked, destination (keys and values to the declared env, files to their paths, approvals to authorization records) and what done looks like. One complete list, completed at the operator's pace; asynchronous approvals are waited for before the affected proofs. The door checks presence and runs the proofs; a failed proof yields a specific repair step. Handoff stores the steps in each leaf's contract; `akrogon status` prints any still-missing need with its steps; `akrogon next` refuses dispatch. A leaf-produced value is proven after its producer delivers, so that dependent hands off after the producer. Reason: steps stay with the leaf, no lost chat context, no extra command. Foreclosed: 1b door-only sheet with names in status, 1c separate instructions command.

### Key creation ([key-creation](../../../chart/leaf-readiness/forks/key-creation.md))

2026-10-02, operator, verbatim: "1a - but when will that happen? At what point? Do I just look at the list from the akrogon status and do it manually? How can I get the instructions from the agent to tell me how to get those keys exactly? | 2a"

Q1 taken 1a: the operator creates every missing outside-account key in one batch before handoff, from the door's list. No agent holds a key-creating key. Reason: smallest exposure, works for every provider, no current need for agent issuance. Foreclosed: 1b agent issuance from an approved held parent (B's pick), 1c agents mint whenever possible.

Q2 taken 2a: a leaf that creates something with its own key stores that key itself, declared up front as produced by that leaf; dependents wait on it; the write touches only that named value in the declared repo's env, is authorized in the contract, never prints it, and revokes the new key if saving fails. Foreclosed: 2b operator copies it by hand.

The operator's when/how question moved to [key-sheet](key-sheet.md).

### Env source ([env-source](../../../chart/leaf-readiness/forks/env-source.md))

2026-10-02, operator, verbatim: "1a"

When akrogon prepares a leaf worktree (new or reused), it links `<worktree>/.env` to the registered checkout's file, found through the existing repo registration. It refuses, never overwrites, when the path is a real file, a tracked path, a different link, or when the link or target is not gitignored, and never creates an empty target. Writes go to the real file, never through the link. Worktree removal deletes only the link. Client repos keep their own file. Presence is still checked at dispatch; a dangling link counts as missing. Reason: one file, keys added mid-run reach every leaf, no script changes. Foreclosed: 1b path only, 1c env-aware runner, copy, value injection.

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

- blocker-record: seat instructions and the operator settings change belong to seat-input-rules and the operator; this leaf adds no blocker command
- door behavior in key-sheet, key-creation, live-change-grant, proof-fixtures and save-route: writing the contract and running proofs belong to door-readiness; this leaf owns only the schema those records use and the gap check
- env-source link creation: owned by env-link; this leaf reads the holder's real `.env`, so the worktree link does not affect the check

## Standing design

/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md (installed at ~/.claude/skills/chart-issues/assets/standing-design.md)

- No hardcoded secrets, values never printed: gap output names inputs only, and criterion 5 proves a present value never appears.
- Negative cases are criterion driven: absent file, absent name, blank value, unknown holder, invalid contract.
- Cheapest sufficient tests: command tests with `tests/helpers.ts` fixtures and the fake herdr. No live call, since akrogon makes no live calls (readiness-contract Taken).
- Writer and checker share one rule definition: `readinessSchema` is the single definition. door-readiness adds the agreement test that the door's example parses with it.
- Not applicable: auth mocks, server authorization, backend mutation, chain triggers, browser flows.

## Leaf architecture

Owned surfaces: `src/readiness.ts` (new), `src/next.ts` (`dispatchLeaf` gate only), `src/status.ts` (listing and single-leaf output), `src/AREA.md` (one key-file line), `tests/readiness.test.ts` (new), additions to `tests/next.test.ts` and `tests/status.test.ts`.

Literal schema in `src/readiness.ts` (zod 4). Field names are binding for door-readiness and seat-input-rules:

```ts
const text = z.string().trim().min(1);
export const inputSchema = z.strictObject({
  kind: z.enum(['env', 'file']),
  name: text,                       // env var name, or a path relative to the holder root
  holder: text,                     // registered repo key, or absolute directory of an unregistered repo
  purpose: text,
  consumers: z.array(text).min(1),  // leaf slugs that consume it
  steps: text,                      // exact operator steps (key sheet)
  source: text,                     // official source and date checked
  done: text,                       // what done looks like
});
export const produceSchema = z.strictObject({
  name: text, holder: text, consumers: z.array(text),
  save: z.strictObject({ entry: text, revision: text, args: z.array(text), value_source: text }),
});
export const fixtureSchema = z.strictObject({
  account: text, purpose: text, marker: text, naming: text, count: z.number().int().positive(),
  cleanup: z.array(z.strictObject({ step: text, identity: text })).min(1),
  absence_check: text,
});
export const grantSchema = z.strictObject({
  approved: z.strictObject({ by: text, date: text, answer: text }),
  principal: text, account: text,
  credential: z.strictObject({ name: text, holder: text }),
  targets: z.array(text), fixtures: z.array(fixtureSchema), operations: z.array(text).min(1),
  effects: text, bounds: text, stop_line: text, expires: text.optional(),
});
export const retainedSchema = z.strictObject({
  resources: z.array(text).min(1), purpose: text, owner: text, remove_by: text, cost: text, exposure: text,
  cleanup: z.strictObject({ identity: text, route: text }), reason: text,
});
export const proofSchema = z.strictObject({
  operation: text, command: text, identity: text, target: text, version: text, date: text,
  result: text, cleanup: text, limits: text,
  record: text,                     // chart fork path holding the full proof
});
export const readinessSchema = z.strictObject({
  inputs: z.array(inputSchema), produces: z.array(produceSchema), grants: z.array(grantSchema),
  retained: z.array(retainedSchema), proofs: z.array(proofSchema),
});
export type Readiness = z.infer<typeof readinessSchema>;
export type Gap = { kind: 'env' | 'file'; name: string; holder: string; steps: string };
export function readReadiness(leafPath: string): Readiness | null; // null only when readiness.yaml is absent
export function holderRoot(global: GlobalConfig, holder: string): string;
export function gaps(global: GlobalConfig, readiness: Readiness): Gap[];
```

Env parsing uses `node:util` `parseEnv`, verified 2026-10-02 on bun 1.4.2: `parseEnv('A=1\nB=\n# c\nexport D="x y"')` returned `{A:"1",B:"",D:"x y"}`. The file is read with `node:fs` and its contents never leave `gaps`. `produces`, `grants`, `retained` and `proofs` are parsed for validity only and produce no gap: grants and proofs are recorded at charting, and produced values are proven before dependents hand off (key-sheet Taken).

`next`: in `dispatchLeaf`, directly after the `blocked-by` check and before seat resolution, base check and allocation, compute gaps. Explicit dispatch throws `Leaf inputs are missing: <slug>: <kind> <name> in <holder>, ...`. Implicit dispatch returns `'waiting'`. `status`: after the `Failed:` lines, print `Missing: <repo>/<slug> <kind> <name> in <holder>: <steps>` for every gap of every non-merged open leaf. `status <slug>` prints the same lines after the state YAML.

Exclusions: no change to the `state.yaml` schema, phase routing, seat prompts or skills. No live calls. No env writes.
