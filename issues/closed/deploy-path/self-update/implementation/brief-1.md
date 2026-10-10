# Sub-brief 1: install-split (plan U1, wave 1)

## 1. Goal

Split the skill/executable link reconciliation out of `install()` in `src/install.ts` so a later unit can reuse it with print-instead-of-throw conflict handling. Plan decisions D4. `install()`'s observable behavior must stay byte-identical.

## 2. Acceptance criteria

1. `src/install.ts` exports two new functions:
   - `planSkillLinks(home: string, sourceRoot: string): { links: Link[]; conflicts: Link[] }` — prunes dangling owned links first (current behavior), computes the link set (`<home>/.local/bin/akrogon` → `<sourceRoot>/src/akrogon.ts`, and `<home>/<root>/<skill>` → `<sourceRoot>/skills/<skill>` for `roots = ['.claude/skills', '.agents/skills', '.codex/skills', '.pi/agent/skills']` and every directory entry of `<sourceRoot>/skills`), then computes the conflict set. It creates nothing.
   - `applySkillLinks(links: Link[]): void` — the existing mkdir+symlink-if-absent loop, applied to the given links.
   - `Link` stays a shared type (export it).
2. `install()` composes them: `planSkillLinks(homedir(), toolRoot)` → if conflicts, print `rm -r -- <dest>` per conflict to stderr and throw `Install destinations conflict. Remove the listed paths before installing.` → else `applySkillLinks(links)` → existing herdr calls. Prune-before-refuse order is preserved because pruning lives inside `planSkillLinks`.
3. `bun test tests/install.test.ts --timeout=30000` passes with zero edits to that file.

## 3. Read-first

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `src/install.ts` — the whole file (45 lines) is your scope.
- `tests/install.test.ts` — the contract that must not change; note the prune-before-refuse and no-link-creation-on-conflict assertions.
- `src/config.ts` line ~170 for `toolRoot`.

## 4. Change list and needed interfaces

Owns: `src/install.ts` only.
Interface contract for the next unit (do not deviate):
```ts
export type Link = { source: string; destination: string };
export function planSkillLinks(home: string, sourceRoot: string): { links: Link[]; conflicts: Link[] };
export function applySkillLinks(links: Link[]): void;
export async function install(): Promise<void>; // unchanged signature and behavior
```
`links` includes the `~/.local/bin/akrogon` executable link. `conflicts` is the subset of `links` whose destination exists and is not already the correct symlink. Pruning only removes symlinks under each `home` root that resolve into `<sourceRoot>/skills/` and whose target no longer exists — copy the existing logic verbatim, parameterized on `home`/`sourceRoot`.

## 5. Do-not, reasons and exceptions

- Do not touch `tests/install.test.ts`, any other src file, or docs: owned scope is `src/install.ts`; other files are other units' territory.
- Do not reorder install()'s phases (prune → conflicts → create → herdr): existing tests assert this order.
- Do not add parameters, options objects, or fallbacks beyond the two signatures above.
- If the split cannot preserve observable behavior, return a mismatch naming the conflict instead of widening scope; the exception is a revised brief from A.

## 6. Ordered steps

1. Read `src/install.ts` and `tests/install.test.ts` fully.
2. Rewrite `src/install.ts` per section 4.
3. Run `bun install` in your worktree if `node_modules` is missing, then the section-7 command and `bun test tests/install.test.ts --timeout=30000`.
4. Commit `src/install.ts` alone. Size: 1 file, ~6 turns.

## 7. Commands

```
AKROGON_BASE=9e2dfbebcfd98e647d34bed995741410ce95c2e4 bun test --changed=9e2dfbebcfd98e647d34bed995741410ce95c2e4 --timeout=30000
bun test tests/install.test.ts --timeout=30000
```

## 8. Done-when, evidence and report

All existing install tests green, signatures exactly as specified. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
