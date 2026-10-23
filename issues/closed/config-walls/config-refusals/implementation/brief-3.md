# Worker brief 3 — U4 docs/guide/setup.md worktree_root bullet

## 1. Goal

Implement plan decision D5: the `worktree_root` bullet says the store must lie outside the checkout and that akrogon refuses one inside it, and drops the sentence sanctioning an in-checkout store.

## 2. Acceptance criteria

- The `worktree_root` bullet in docs/guide/setup.md contains the phrase `outside the checkout` and refusal wording (matching /refus/), and no longer contains `inside the checkout is gitignored`.
- Use this bullet text exactly:

```
- **worktree_root** says where leaf checkouts go. Unset defaults to `~/.akrogon/worktrees/<repo name>`; `~` expands to the machine home directory. The store must lie outside the checkout: akrogon refuses one inside it. `init` also adds `issues/open/**/*.log`, `issues/parked/**/*.log` and `issues/chart/*/direct/**/*.log` to `.gitignore`, so plain check logs stay out of `akrogon sync` commits and pack into `evidence.tar.zst` instead.
```

- Committed test `setup.md requires a worktree store outside the checkout and drops the in-checkout gitignore line` in tests/worktree-store.test.ts passes without edits.

## 3. Read-first

- docs/guide/setup.md line 57
- skills `ponytail.md` in the implement-issue skill folder

## 4. Change list

- docs/guide/setup.md: the single bullet. Owns: docs/guide/setup.md only. Lands first: nothing. No shared test resource.

## 5. Do-not

- Do not edit the test or any other doc line; README's conditional exclusion list and skills/init-akrogon/SKILL.md are explicitly out of scope.
- Return a mismatch instead of changing scope; the exception is a revised brief from A.

## 6. Steps

1. Replace the bullet.
2. Run `bunx prettier --check docs/guide/setup.md` and fix formatting if it flags the line.
3. Run §7 (no dependency install needed, but run `bun install --frozen-lockfile` under the flock if node_modules is absent).

## 7. Commands

- `akrogon run-check --name u4 -- bun test --timeout=30000 tests/worktree-store.test.ts`

## 8. Done-when, evidence and report

§7 exits 0, change committed on the detached HEAD with a conventional message, report the commit ID and the `check u4: <exit> <path>` line.

Changed files and reasons:
Tests run:
Known limitations:
Unverified criteria:
