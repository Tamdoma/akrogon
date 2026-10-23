# Worker brief 2 — U3 src/guard.ts own-modules remedy

## 1. Goal

Implement plan decision D4: the `akrogon guard own-modules` refusal keeps its missing path and exit 1 and adds that `setup` in issues/config.yaml must install dependencies in each fresh checkout.

## 2. Acceptance criteria

- The stderr line keeps `missing own node_modules: <path>` verbatim and appends the remedy; use this exact line:

```
`missing own node_modules: ${own}; set setup in issues/config.yaml to install dependencies in each fresh checkout`
```

- Exit code stays 1; the `ancestors` verb and `checkLocation` are unchanged.
- Committed tests/guard.test.ts passes without edits (it now asserts `setup` and `issues/config.yaml` appear in both the direct refusal and the printed-check refusal).

## 3. Read-first

- src/guard.ts `guard` (own-modules branch, ~line 30)
- tests/guard.test.ts (the two tests asserting the new wording)
- skills `ponytail.md` in the implement-issue skill folder

## 4. Change list

- src/guard.ts: one stderr line change inside `guard`. Owns: src/guard.ts only. Lands first: nothing. Shared test resource: tests/helpers.ts fixture (read-only).

## 5. Do-not

- Do not edit tests; a red planned test returns a mismatch.
- Do not touch `checkLocation` or `offendingAncestor`; do not derive installers from lockfiles (rejected design Q2 2b).
- Return a mismatch instead of changing scope; the exception is a revised brief from A.

## 6. Steps

1. `flock "$(git rev-parse --git-path akrogon-install.lock)" bun install --frozen-lockfile` in the worktree.
2. Edit the own-modules stderr line.
3. Run §7.

Advisory: 1 file, under 10 turns.

## 7. Commands

- `akrogon run-check --name u3 -- bun test --timeout=30000 tests/guard.test.ts`

## 8. Done-when, evidence and report

§7 exits 0, change committed on the detached HEAD with a conventional message, report the commit ID and the `check u3: <exit> <path>` line.

Changed files and reasons:
Tests run:
Known limitations:
Unverified criteria:
