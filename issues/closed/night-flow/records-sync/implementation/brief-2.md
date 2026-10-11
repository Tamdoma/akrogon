# Worker brief 2: docs for per-repo self-update record sync (unit U2)

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/records-sync-u2`

Read the brief before editing, follow sections 5 and 6, reread section 8 and fill its report before returning.

## 1. Goal

Update `docs/guide/install.md` and `README.md` so the self-update description matches the new behavior: self-update runs for every registered checkout's root checkout on its default branch, replays record-only local commits onto the fetched remote tip and pushes them, then moves the checkout. Install and skill links stay akrogon-only. Implements plan D8 and done-criterion 7.

## 2. Acceptance criteria

1. `docs/guide/install.md` (~line 36-40 region, the "Landed work deploys itself" paragraph and the remedy paragraph after it) describes: self-update on every registered checkout; record-only local commits replayed and pushed in a temporary worktree, never staged, never stashed; `git reset --keep` semantics for the move; the three git outcomes (moved; pushed with the checkout pending when an incoming change touches a dirty file, naming the path; not pushed with `record conflict: <paths>; run akrogon sync` when a record changed on both sides); hazard refusals reuse `akrogon sync` refusal wording. The manual `akrogon sync` remedy is dropped only for record-only ahead/diverged history; wrong branch, detached HEAD, local code commits and overlapping edits keep their operator actions.
2. `README.md` self-update paragraph (~line 82, "The links use this checkout. Landed work deploys itself...") updated to say the record sync runs for every registered checkout and install/links stay akrogon-only; the remedy sentence updated the same way (no `akrogon sync` remedy for record-only ahead/diverged, keep it for code commits).
3. `bun test tests/docs-links.test.ts tests/red-docs.test.ts --timeout=30000` passes (all links and anchors resolve).
4. No other file edited. `bun run format` applied if prettier formats these files (check `package.json` format script globs; `docs/` and `README.md` may not be covered — apply only if matched).

## 3. Read-first list

- `docs/guide/install.md` lines ~30-45 — the text being changed.
- `README.md` lines ~75-90 — the paragraph being changed.
- `docs/guide/files.md` sync section — verify it stays accurate (it does; `akrogon sync` is unchanged), do not edit it.
- `/home/ivan/Work/infra/akrogon/issues/open/night-flow/records-sync/design.md` decisions 1-8 — the wording source.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

Existing pattern to copy: the surrounding guide's sentence style — short declarative sentences, command names in backticks.

## 4. Change list and needed interfaces

Owns: `docs/guide/install.md`, `README.md`. No other file may be edited.

Depends on: nothing (wave 1); wording follows the design, not the in-flight code. Vocabulary to use verbatim where the line is quoted: `record conflict: <paths>; run akrogon sync`; `checkout pending`; `pushed <n> record commit(s)` — describe, don't fabricate exact line formats beyond these tokens.

## 5. Do-not, reasons and exceptions

- Do not edit code or tests: other units own them.
- Do not document behaviors outside the design: no new triggers, no auto-committing of uncommitted records, no systemd timers — each is foreclosed in the design.
- Do not drop operator remedies the design keeps: wrong branch, detached HEAD, local code commits, overlapping edits (brief criterion 7).
- Do not break links or anchors: `tests/docs-links.test.ts` checks them mechanically.
- Do not write or edit tests: tests are locked; a red test is a mismatch returned to A.

Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

## 6. Ordered steps

1. Read the design file's decisions 1-8, `docs/guide/install.md` and `README.md`.
2. Rewrite the two paragraphs/regions per section 2.
3. `bun install --frozen-lockfile` in the worktree, then `bun test tests/docs-links.test.ts tests/red-docs.test.ts --timeout=30000`.
4. Commit one commit on the detached HEAD; report the sha.

Advisory size: 2 files, under 10 turns.

## 7. Commands

Changed-test command (AKROGON_BASE supplied): run in the worktree

```sh
bun install --frozen-lockfile
bun test --changed=c53f6196533289555518577f08907ec9c713721c --timeout=30000
bun test tests/docs-links.test.ts tests/red-docs.test.ts --timeout=30000
```

`tests/self-update.test.ts` is expected red (7 planned failures) — not your scope.

## 8. Done-when, evidence and report

Done when: both files updated, docs tests green, single commit containing only the two docs. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
