# Brief 1: leaf-temp-dir core src (D1, D3-D6)

## 1. Goal

Implement the derived per-leaf temp path, private creation plus `TMPDIR` placement on every allocation, and confirmed-gone deletion in `src/config.ts` and `src/next.ts`. Plan decisions D1, D3, D4, D5, D6. No tests are added here; brief 2 proves the behavior.

## 2. Numbered acceptance criteria

1. `leafTemp(repo, slug)` is exported from `src/config.ts` and returns `<root>/<first-20-slug>-<12-hex>` where hex is `sha256(repo.root + "\n" + slug)` sliced to 12. Unset override selects `/var/tmp/akrogon-${process.getuid()}`; set-but-blank or relative override throws an error naming `AKROGON_LEAF_TEMP_ROOT`.
2. `allocate` creates parent then leaf with mode 0700 on every dispatch and adds adjacent `'--env', 'TMPDIR=<leafTemp>'` to `placement`, so tab create and both pane splits carry it. Symlink, non-directory, or foreign-uid parent or leaf aborts with an error naming the path and creates no tab or split. Existing owned permissive dirs are chmod-corrected to 0700; foreign entries are never chmodded.
3. `tab_closed` branch deletes scratch for a merged owner before `dispatchLeaf` via the shared helper, reports errors through `report()` without blocking dispatch or dependents, and skips non-merged owners.
4. `closeMergedTab` returns had-live boolean; `cleanupMerged` deletes scratch before the `issues/open` return only when the tab had no live panes before close; live-panes sweeps close the tab and keep scratch. Existing close timing and worktree/branch removal unchanged.

## 3. Read-first list

- `src/config.ts` (`worktreeStore` ~:127 is the pattern to copy for `leafTemp`)
- `src/next.ts` (`allocate` ~:298-338, `closeMergedTab` ~:552, `cleanupMerged` ~:559, `cleanupRepos` ~:642-650, `tab_closed` ~:721-731)
- `src/state.ts` (slug regex, already `[a-z0-9-]`)
- This skill folder's `ponytail.md`
- Open the plan's index only for a gap in this list.

## 4. Change list and needed interfaces

Must land first: none (wave 1). Owns: `src/config.ts`, `src/next.ts`. No shared test resource. Consumed output: none; brief 2 consumes this unit's behavior plus the `AKROGON_LEAF_TEMP_ROOT` contract.

Changes, in file order:

- `src/config.ts`: import `createHash` from `node:crypto`. Add `export function leafTemp(repo: Repo, slug: string): string` beside `worktreeStore`. Parse `process.env.AKROGON_LEAF_TEMP_ROOT` at the call boundary: `undefined` selects the production root; blank (`trim() === ''`) or relative (`!isAbsolute`) throws `Error` naming the variable. No schema, flag, state, or uid parameter.
- `src/next.ts` imports: extend the `node:fs` import with `mkdirSync`, `chmodSync`, `lstatSync`, `rmSync`; import `leafTemp` from `./config`.
- `src/next.ts` `allocate`: after `ensureWorktree`, before `placement`, ensure parent first then leaf with one small local helper: `lstatSync` rejects symlink/non-directory/foreign-uid (`statSync().uid !== process.getuid()`) by throwing with the path; else `mkdirSync(p, { mode: 0o700 })` (tolerate EEXIST) then `chmodSync(p, 0o700)`. Add the `--env TMPDIR` pair to `placement`. Keep bootstrap, seat selection, and split targets untouched.
- `src/next.ts`: add `removeLeafTemp(repo: Repo, slug: string): Promise<void>` doing `existsSync` early return, else `rmSync(leafTemp(repo, slug), { recursive: true, force: true })` then `await command(['git', 'worktree', 'prune'], repo.root)`.
- `src/next.ts` `tab_closed`: before `dispatchLeaf`, `if (owners[0].leaf.state.phase === 'merged') try { await removeLeafTemp(owners[0].repo, completedSlug); } catch (error) { if (!(error instanceof Error)) throw error; report(invocation, owners[0].repo.name, owners[0].leaf.path, error, completedSlug); }`. Dispatch and dependents lines unchanged.
- `src/next.ts` `closeMergedTab`: return `Promise<boolean>`; `undefined` tab or no matching panes returns `false`; else close and return `true`. `cleanupMerged`: `const hadLive = await closeMergedTab(leaf); if (!hadLive) await removeLeafTemp(repo, leaf.state.slug);` before the open return; rest unchanged.

## 5. Do-not, reasons and exceptions

- Do not touch `tests/`, `skills/`, or `docs/` (briefs 2 and 3 own them); mixing owners causes conflicting picks.
- Do not add a config key, CLI flag, state field, `TMP`/`TEMP`, age sweep, phase-end wipe, worker-cleanup change, or tab-close timing change; the design forecloses each and review rejects scope drift.
- Do not chmod, chown, or delete foreign-owned paths; that is an unsafe mutation outside the leaf's boundary.
- Do not change allocation topology or split targets; recovery must reuse `placement` as-is.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

Reasons restated: owners prevent conflicting picks; foreclosed scope fails review; foreign-path mutation is unsafe; topology changes break existing seat asserts. Exception restated: only a revised brief from A authorizes a scope or interface change.

## 6. Ordered steps

1. `src/config.ts` for criterion 1: add `leafTemp` per section 4; keep `worktreeStore` adjacent and untouched.
2. `src/next.ts` for criterion 2: imports, ensure helper, `placement` pair; verify by reading the diff that splits still use `placement` with identical targets.
3. `src/next.ts` for criteria 3-4: helper, `tab_closed` block, `closeMergedTab` return, `cleanupMerged` guard; verify the `:753` caller still compiles ignoring the return.
4. Run section 7, paste the result, commit only this chunk.

Advisory size: about 2 files and under 10 turns.

## 7. Commands

Run in the brief's worktree after `bun install`:

```sh
AKROGON_BASE=88f252f02eb36aacee6dadf6668c303374b692d5 bun test --changed="88f252f02eb36aacee6dadf6668c303374b692d5"
```

This resolved changed-test command only; criterion proof and every `checks` command belong to A.

## 8. Done-when, evidence and report

Done when criteria 1-4 hold in the diff and section 7 output is pasted. Report each criterion against its code location; new-behavior tests arrive in brief 2, so evidence here is the diff plus the changed-test result. Name limitations and unverified criteria explicitly.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
