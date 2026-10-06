# Brief 1: batch record schema and stack engine (plan U1, wave 1)

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/merge-batch-u1

## 1. Goal

Implement the `batch` state schema and the disposable-stack git engine that merge dispatch and the phase command build on (plan decisions D1, D3, D4, D12). Later units consume these exact interfaces; do not change them.

## 2. Acceptance criteria

1. `stateSchema` accepts a state with `batch` (shape below) and `solo`, and rejects unknown or missing-required batch fields (`strictObject`).
2. `buildStack` rebases each member's range `base..head` onto a growing tip starting at `builtOn`, in list order, then the holder range `lastTip..holderHead` last, inside a detached worktree under the leaf temp dir. It returns each member's new tip and the stack top. An empty member or holder range produces a tip/top equal to its head without running a rebase.
3. A member range that conflicts returns `{ ok: false, conflict: <member slug> }` and leaves no live branch changed. A holder conflict returns `{ ok: false, conflict: <holder slug> }`.
4. `applyStack` runs `git -C <worktree> reset --hard <tip>` per member then `reset --hard <top>` in the holder worktree; a member leaf with no `state.worktree` uses `git update-ref refs/heads/<slug> <tip>` in `repo.root`. After it, each member branch points at its tip and the holder branch at the top.
5. `restoreMembers` resets each member's worktree/branch back to its saved `head` with the same reset-or-update-ref rule.
6. `isAncestor` runs `git merge-base --is-ancestor a b` in `cwd` and returns the boolean (code 0/1; other codes throw `CommandError`).
7. `attemptId` returns unique nonempty strings.
8. `batchMemberSlugs(repo)` returns the set of member slugs across every leaf carrying a `batch` record.
9. The disposable build worktree is removed after each build call (temp dir cleaned, `git worktree remove --force`).

## 3. Read-first list

- `src/state.ts` (schema, `allLeaves`, `Leaf`, `State`), `src/config.ts` (`Repo`, `leafTemp`, `trackingRef` lives in `src/preflight.ts`), `src/shell.ts` (`command`, `run`, `CommandError`, `Result`), `src/turn.ts` (`mergeQueue`), `tests/helpers.ts` (`fixture`, `cli`, `leaf`, `yaml`), `tests/phase.test.ts:1792-1871` for the CLI test pattern.
- One existing pattern to copy: `ensureWorktree`/`removeLeafTemp` in `src/next.ts` for worktree add/remove against `repo.root`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Owned paths: `src/state.ts`, `src/batch.ts` (new), `tests/batch.test.ts` (new). Read-only: `tests/helpers.ts` (reuse `fixture`/`leaf`/`yaml`/`command`).

Add to `stateSchema` (both optional):

```ts
export const batchMemberSchema = z.strictObject({ slug: z.string(), base: z.string(), head: z.string(), tip: z.string() });
export const batchSchema = z.strictObject({
  attempt: z.string().min(1),
  built_on: z.string(),
  members: z.array(batchMemberSchema),
  top: z.string().optional(),
  tested_top: z.string().optional(),
  candidate: z.string().optional(),
  applied: z.boolean(),
  solo: z.boolean().optional(),
});
// state fields: batch: batchSchema.optional(), solo: z.boolean().optional()
export type Batch = z.infer<typeof batchSchema>;
export type BatchMember = z.infer<typeof batchMemberSchema>;
```

`src/batch.ts` exports (imports only `config`, `state`, `shell`, `preflight`, `node:path`, `node:crypto`):

```ts
export function attemptId(): string;                                   // random id
export async function memberBase(repo: Repo, builtOn: string, head: string): Promise<string>; // merge-base
export async function buildStack(
  repo: Repo,
  builtOn: string,
  items: { slug: string; base: string; head: string }[],
  holderHead: string,
): Promise<{ ok: true; tips: Map<string, string>; top: string } | { ok: false; conflict: string }>;
export async function applyStack(repo: Repo, top: string, members: { slug: string; tip: string; leaf?: Leaf }[], holder: Leaf): Promise<void>;
export async function restoreMembers(repo: Repo, members: { slug: string; head: string; leaf?: Leaf }[]): Promise<void>;
export async function isAncestor(cwd: string, a: string, b: string): Promise<boolean>;
export async function batchMemberSlugs(repo: Repo): Promise<Set<string>>;
```

`applyStack`/`restoreMembers` take optional `leaf` so callers can pass the discovered leaf (uses `leaf.state.worktree` when present); without a leaf use `update-ref` in `repo.root`. `buildStack` creates `leafTemp(repo)/batch-<rand>` via `git worktree add --detach` at `builtOn`, runs `git rebase --onto <tip> <base> <head>` per item, captures the new tip via `git rev-parse HEAD`, detects conflict by nonzero rebase exit, runs `git rebase --abort`, and removes the worktree in `finally`. Rebasing a bare sha detaches HEAD — allowed in a detached worktree.

## 5. Do-not

- Do not edit `next.ts`, `phase.ts`, `akrogon.ts`, `turn.ts`, `skills/`, `docs/`, `README.md`, or any existing test file — other units own them; a needed change there returns a mismatch.
- Do not add files under `issues/` to the branch (the command refuses it).
- No new dependencies; use existing `zod`, `command`/`run` helpers.
- `state.yaml` files in tests are written with the existing `yaml` helper; do not hand-parse YAML.
- A commit changing an existing file matched by `src/test-files.ts` needs a `Test-Change:` trailer; your owned test file is new, so no trailer is expected unless you touch an existing test file (do not).
- Return a mismatch with evidence instead of changing this interface.

## 6. Ordered steps

Advisory: 3 files, under 30 turns.

1. `tests/batch.test.ts`: write the failing tests first (schema accept/reject; build order + tips + top via `git log`/`rev-parse` on a fixture repo with two member branches made with real commits; member conflict case — member B edits the same line member A or built_on rewrote; holder conflict; empty-range member; apply then restore round-trip asserting `git rev-parse <slug>` and `git -C <worktree> rev-parse HEAD`; `isAncestor` true/false; `batchMemberSlugs`).
2. `src/state.ts`: schema fields.
3. `src/batch.ts`: implement.
4. Run the changed-tests command, then `bun test tests/batch.test.ts --timeout=30000`.

## 7. Commands

`AKROGON_BASE=1edd0c0b02fa8094f62eb04225b2a624cfa94c01 bun test --changed="$AKROGON_BASE" --timeout=30000`

(Run `bun install` in the worker worktree first.)

## 8. Done-when, evidence and report

All criteria green; pasted test output in the return. Commit your work on the worker's detached HEAD and return the commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
