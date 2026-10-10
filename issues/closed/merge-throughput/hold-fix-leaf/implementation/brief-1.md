# Brief 1: hold-fix code

## 1. Goal

Implement plan.md D1-D6 code changes: a shared merge-holder resolver honoring a hold's `fix` field, the `akrogon hold-fix <slug>` command, and status display of the named fix leaf. Leaf: hold-fix-leaf; brief/design at `/home/ivan/Work/infra/akrogon/issues/open/merge-throughput/hold-fix-leaf/`.

## 2. Acceptance criteria

1. `akrogon hold-fix <slug>` with a live hold on the current repo and `<slug>` in the merge queue writes `fix: <slug>` into `held.yaml` under `.lock` and prints `held <repo> fix <slug>`.
2. `hold-fix` exits nonzero naming the repo when no hold exists; nonzero naming the slug when it is not a repo leaf or not in the merge queue; the hold file is unchanged in every refusal.
3. `mergeTurn` selects the fix leaf as holder while the hold names it and it sits in the merge queue, even when it is not the queue head; the built batch for it has `members: []`.
4. Both hold guards (pre-lock and in-lock) still return early for any non-fix holder while the hold is live, and still drop a stale hold inside the lock, restoring normal queue-head order.
5. `phase <slug> merged|check.fix` authorization accepts the fix leaf during the hold and keeps refusing every other leaf, naming the resolved holder in the error.
6. `akrogon status` leaf view prints `held: <sha> <command> fix <slug>` and the repo heading mark reads `(held fix <slug>)` when `fix` is set; `unpause` on a held repo prints the same fix suffix. All existing formats are unchanged when `fix` is absent.
7. `bun run typecheck` passes; `bun test --changed` passes.

## 3. Read-first

- `src/hold.ts` — hold schema (`fix` field already exists), `unholdCommand` is the shape to copy for `holdFixCommand`.
- `src/turn.ts:81-105` — `mergeQueue` ordering and `QueueEntry`.
- `src/next.ts:973-1075` — `mergeTurn`: holder at ~989, `heldBefore` guard ~1026, in-lock `heldNow` guard ~1041; `src/next.ts:696-706` — `dispatchLeaf` merge gate.
- `src/phase.ts:773-783` — head-only authorization check.
- `src/akrogon.ts:100-140` — verb dispatch (`unhold` case is the template), usage string, unpause hold line ~124.
- `src/status.ts:330-395` — `held:` leaf line ~342 and heading `marks` ~385.
- `tests/hold.test.ts` — for how held fixtures are written (do not edit tests; read for understanding only).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

`src/hold.ts` — add imports `mergeQueue`/`QueueEntry` from `./turn`, `allLeaves`/`findLeaf` from `./state`, `readLog` from `./log`, `Leaf` type from `./state`, `LogRecord` type from `./log`. Add:

```ts
export function mergeHolder(repoName: string, global: GlobalConfig, leaves: Leaf[], log: () => LogRecord[]): QueueEntry | undefined {
  const queue: QueueEntry[] = mergeQueue(global, leaves, log);
  const fix: string | undefined = heldFor(repoName).fix;
  if (fix === undefined) return queue[0];
  return queue.find((entry) => entry.leaf.state.slug === fix) ?? queue[0];
}
```

Add `holdFixCommand(cwd: string, slug: string)` modeled on `unholdCommand`: under `.lock`, refuse `No hold on <repo>` when none, `findLeaf(repo, slug)` for existence (its own error), refuse `<slug> is not in the merge queue of <repo>` when `mergeQueue(global, allLeaves(repo), () => readLog(repo.root))` has no entry for it, then `writeHeld(repo.name, { ...hold, fix: slug })`. Print `held <repo> fix <slug>` after the lock.

`src/next.ts` — import `mergeHolder` from `./hold`. In `mergeTurn`: replace the `queue`/`queue[0]?.leaf` pair with `mergeHolder(repo.name, global, discover(repo, invocation).leaves, () => readLog(repo.root))?.leaf`. Pre-lock guard: `return` only when the hold equals base AND `heldBefore.fix !== holder.state.slug`. In-lock: replace the `mergeQueue(...)[0]` head check with `mergeHolder(...)?.leaf.state.slug !== holder.state.slug`; rework `heldNow`: when stale → `dropHeld`, then require `fresh` to be queue head to continue; when live → if `heldNow.fix !== fresh.state.slug` print `held ...` and return, else set `members: []` (skip member collection). Keep `solo`/`applied` derived from `fresh.state.solo` unchanged. In `dispatchLeaf`, replace the same head check with `mergeHolder(...)?.leaf.state.slug !== slug`. Remove `QueueEntry`/`mergeQueue` imports only if left unused.

`src/phase.ts` — in `phaseCommand`'s holder check, replace `mergeQueue(...)[0]` with `mergeHolder(repo.name, global, allLeaves(repo), () => readLog(repo.root))`; keep the existing error texts and the head-slug it names. Import `mergeHolder` from `./hold`; drop now-unused `mergeQueue`/`QueueEntry` imports if unused elsewhere.

`src/akrogon.ts` — add `case 'hold-fix'`: `const [slug] = z.tuple([z.string().trim().min(1)]).parse(positionals); await (await import('./hold')).holdFixCommand(process.cwd(), slug);`. Add `hold-fix` to the usage string. Unpause hold line: append ` fix ${hold.fix}` when `hold.fix !== undefined`.

`src/status.ts` — leaf `held:` line: `held: ${hold.sha} ${hold.command}${hold.fix === undefined ? '' : ` fix ${hold.fix}`}`. Heading marks: `held[scan.repo.name]?.fix !== undefined ? \`held fix ${held[scan.repo.name].fix}\` : 'held'`.

Owns: src/hold.ts, src/next.ts, src/phase.ts, src/akrogon.ts, src/status.ts. No prerequisite units.

## 5. Do-not

- Do not touch `held.yaml` schema, `mergeQueue` ordering, `solo`/`applied` semantics, or anything in `tests/` (another unit owns it). Reason: the plan pins these; exception: a revised brief from A.
- Do not add a config key, prompt text change, or notification for `hold-fix`; the plan names none.
- Do not change the `held repo on ...` mergeTurn log lines.
- Return a mismatch with evidence instead of changing an interface the plan does not authorize.
- Do not edit `src/turn.ts` — `mergeHolder` lives in `hold.ts` to avoid the import cycle (turn→hold→turn).

Reasons and exceptions as stated: plan-pinned surfaces stay frozen unless A revises this brief.

## 6. Ordered steps

1. Read the read-first files; trace `mergeTurn` end to end.
2. `src/hold.ts`: `mergeHolder` + `holdFixCommand`. Verify `findLeaf`'s error for a missing slug and `allLeaves`/`readLog` signatures.
3. `src/next.ts`: holder resolution, both guards, dispatchLeaf gate.
4. `src/phase.ts`: authorization.
5. `src/akrogon.ts`, `src/status.ts`: verb, usage, display suffixes.
6. `bun install` if `node_modules` absent, then run the section-7 command, then `bun run typecheck`.

Size: 5 files, ~25 turns.

## 7. Commands

```sh
export AKROGON_BASE=3fde73f7197f35ea17ba2ff06c0705c535f9f75e
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
bun run typecheck
```

## 8. Done-when, evidence, report

All acceptance criteria met, commits on top of the worktree HEAD (one commit), both commands pasted with results. Commit message: `feat: hold-fix names a fix leaf that takes the merge turn`.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
