# Brief u3: install/setup guide lines for systemd 254 and gh under a cut bus

Leaf: check-env-fidelity (repo akrogon). Worktree: `/home/ivan/.akrogon/worktrees/akrogon/check-env-fidelity-u3` (detached at the leaf HEAD).

## 1. Goal

Plan decisions D1 and D4 (locked design 1a/3a): the guide states the systemd floor the new flag needs and tells consumers how `gh` authenticates while the session bus is cut.

## 2. Acceptance criteria

1. `docs/guide/install.md` prerequisites name **systemd 254 or later** (the existing bullet reads 'A systemd user manager (`systemctl --user`).').
2. `docs/guide/setup.md`'s `pass_env` bullet gains the fact that the cut session bus also hides keyring-stored credentials, so `gh` must keep its token in its own file (`gh auth login --insecure-storage`) or the repo declares `GH_TOKEN` in `env` or `pass_env`. The bullet's existing content (session vars, never `.env`, `DBUS_SESSION_BUS_ADDRESS` reserved, cgroup reason) stays verbatim.
3. `tests/docs-links.test.ts` stays green.

## 3. Read-first

- `docs/guide/install.md` — prerequisites list (~line 14) and the commands check block below it.
- `docs/guide/setup.md` — `pass_env` bullet (~line 63).
- `tests/docs-links.test.ts` — the guide link checker your edits must keep green.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Owns: `docs/guide/install.md`, `docs/guide/setup.md`. Two short prose edits, same register as the surrounding bullets. No prerequisite units; disjoint from u1 and u2.

## 5. Do-not, reasons and exceptions

- Do not document a D-Bus proxy, bus passthrough or akrogon copying `GH_TOKEN`: all foreclosed by the 2026-10-13 lock. Exception: none.
- Do not touch any other guide file or add sections: scope is these two bullets. Exception: none.
- Do not edit tests or `src/`: docs-only unit. Exception: none.
- Return a mismatch with evidence instead of widening scope; the only exception is a revised brief from A authorizing the change.

Restated: every exclusion above holds because the locked design is two doc lines; the sole escape is a revised brief from A.

## 6. Ordered steps

1. Edit `docs/guide/install.md` per criterion 1 — extend the systemd bullet, e.g. 'A systemd user manager (`systemctl --user`), systemd 254 or later.'
2. Edit `docs/guide/setup.md` `pass_env` bullet per criterion 2 — append one sentence to the existing bullet.
3. Run the command in section 7 (criterion 3).
4. Commit both files in one commit with a `docs(guide): …`-style message, return the commit id and report.

Advisory size: 2 files, under 8 turns.

## 7. Commands

```
akrogon run-check --name docs-links -- bun test --timeout=30000 tests/docs-links.test.ts
```

Run it in your worktree. Keep output only through this `akrogon run-check` invocation and cite the `check <label>: <exit> <path>` line it prints to stderr; `akrogon log <path>` reads the cited log back. (`bun install --frozen-lockfile` first if the worktree lacks node_modules.)

## 8. Done-when, evidence and report

Done when both guide edits are in place, the docs-links test is green, and the commit exists on the detached HEAD. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
