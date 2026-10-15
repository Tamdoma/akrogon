# Brief 2: state-home docs (unit U2)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/state-home-u2 (detached at leaf HEAD 16a3bb7).

## 1. Goal

Plan decision D10: documentation names `~/.akrogon/config.yaml` (with `AKROGON_HOME` as override) as the machine configuration location.

## 2. Acceptance criteria

1. README.md: the "Install" section prose "Set the machine's seats, harness commands and registered repositories in the tool-root configuration" is corrected to name `~/.akrogon/config.yaml` (or `AKROGON_HOME`), and the config.yaml link target in the same section is fixed so it no longer implies a file in the checkout.
2. docs/guide/install.md: the "Global config, since you'll stare at it next" section states the machine configuration lives at `~/.akrogon/config.yaml`, selected otherwise by `AKROGON_HOME`.
3. No other doc claims or implies the machine config lives in the checkout root.

## 3. Read-first list

- /home/ivan/.pi/agent/skills/implement-issue/ponytail.md
- README.md lines ~59–70 (Install section)
- docs/guide/install.md lines ~62–75 (Global config section)
- `grep -rn "tool-root configuration\|config.yaml" README.md docs/guide/` for other stale mentions

## 4. Change list

- README.md: rework the two spots above. Keep prose style (terse, second person where present).
- docs/guide/install.md: rework the Global config paragraph.
- Sweep docs/guide/*.md for other claims that config.yaml sits in the akrogon root; fix only sentences that are factually wrong after this change, keep diffs minimal.
- Unit owns: README.md, docs/guide/*.md. No prerequisites, no shared resources.

## 5. Do-not

- Do not edit tests, src/, skills/ or issues/.
- Do not restructure sections or add new prose beyond correcting the config location.
- Do not document release-deploy, cutover internals, or future removal of tracked files — other leaves own those.
- Reason: scope is the config-location wording only. Exception: a revised brief from A.

## 6. Ordered steps

1. Read the named sections.
2. Grep for stale config-location claims in README.md and docs/guide/.
3. Edit the two named spots plus any factual hits.

Advisory: ~3 files, under 12 turns.

## 7. Commands

```sh
akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts
akrogon run-check --name command-reference -- bun test tests/command-reference.test.ts
```

Both from the worktree root (they assert doc/source consistency). No `bun install` needed unless it fails.

## 8. Done-when, evidence and report

Both test files pass (cite the `check` lines), one commit holding only doc files, and:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
