# Brief 3: `setup` proposal rule in init-akrogon and guide docs

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/check-setup-u3`

## 1. Goal

`init-akrogon` proposes `setup` only for repos with a committed lockfile; `docs/guide/setup.md` documents `setup` next to `checks`. Plan decisions D8–D9.

## 2. Numbered acceptance criteria

1. `skills/init-akrogon/SKILL.md`: the inspect step already names lockfiles; add a rule that `setup` is proposed only when `git ls-files` names a committed lockfile (`bun.lock`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`), with the matching frozen/immutable install command (`bun.lock` → `bun install --frozen-lockfile`; others → their manager's frozen-install equivalent). No committed lockfile → the key is omitted from the proposal.
2. `skills/init-akrogon/SKILL.md` proposal example gains a commented or conditional `setup` line consistent with the rule.
3. `docs/guide/setup.md`: the "Repo config, the parts you'll care about" list gains a `setup` bullet, and a short paragraph states: `setup` runs before every printed `checks`/`merge_checks`/`advisory` command under a per-worktree lock kept under the git dir (so it never appears in `git status` and is removed with the worktree), and `init-akrogon` proposes it only when a lockfile is committed.
4. `docs/reference-index.md` already links `docs/guide/` — confirm no index or README change is needed; `bun test tests/docs-links.test.ts` stays green.

## 3. Read-first

- `skills/init-akrogon/SKILL.md` (inspect step and the YAML proposal block), `docs/guide/setup.md` (repo-config bullet list), `docs/guide/phases.md` for tone reference, `tests/docs-links.test.ts`, `skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns: `skills/init-akrogon/SKILL.md`, `docs/guide/setup.md`. Wave 1, no prerequisites, no shared test resource.

## 5. Do-not, reasons and exceptions

- No new doc files, no README changes, no `docs/reference-index.md` change: index already links the guide. Exception: a broken link the docs test proves — report it instead.
- Keep the YAML example minimal: one line, matching existing comment style. Exception: none.
- Don't document `setup` behavior beyond criterion 3 (no internal quoting details in the guide). Exception: none.
- Return a mismatch with evidence instead of widening scope; exception is a revised brief from A.

## 6. Ordered steps

Advisory size: 2 files, under 10 turns.

1. init-akrogon SKILL.md: lockfile detection rule + proposal-block `setup` line (criteria 1–2).
2. setup.md: `setup` bullet + paragraph (criterion 3).
3. `bun test tests/docs-links.test.ts --timeout=30000` (criterion 4). Commit.

## 7. Commands

```
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```
with `AKROGON_BASE=923c6c98fac3f051a54ac27168ea024215652602`, plus `bun test tests/docs-links.test.ts --timeout=30000`. Run `bun install` in your worktree first.

## 8. Done-when, evidence and report

Criteria verified by re-reading the diff and the docs-links test; prose verified by inspection, not asserted by test.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
