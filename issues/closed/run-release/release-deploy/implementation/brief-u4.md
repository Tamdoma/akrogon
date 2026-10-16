# Brief u4: skills and docs wording

## 1. Goal

Update the skill and guide prose for the release-runtime change (plan D13, D15): links resolve through `~/.akrogon/current` to `~/.akrogon/releases/<commit>`, which is not a git checkout (no `.git`).

## 2. Numbered acceptance criteria

1. `skills/seed-issue/SKILL.md`: the akrogon-root resolution (line ~26, today `git -C "$(dirname "$(readlink -f "$(command -v akrogon)")")" rev-parse --show-toplevel`) no longer uses `git rev-parse` on the resolved command path as the mechanism. New wording: resolve the akrogon workspace as the `akrogon` entry of the `repos:` map in the state-home config (`~/.akrogon/config.yaml`, `AKROGON_HOME` when set); fall back to `git rev-parse` on the resolved command path only when no `akrogon` entry exists (development checkout where `.git` exists). The rest of the routing logic (owner test, `akrogon.yaml issues_repo`, origin fallback, stop rule) stays.
2. `skills/chart-issues/SKILL.md`: the presence check (~line 77) still runs `bun -e "import {readGlobal} ... readReadiness ..."` but the akrogon root it resolves is `dirname(dirname(readlink -f $(command -v akrogon)))` — state it explicitly so `cwd` is the release/workspace root, not the entry's directory.
3. `skills/merge-issue/SKILL.md`: read the lesson-helper one-liner (~line 64) and leave it unchanged if the resolved `$(dirname "$(readlink -f "$(command -v akrogon)")")/lessons.ts` path is already correct through `current` (it is: the link target is `current/src/akrogon.ts`, so `dirname(...)/lessons.ts` = `current/src/lessons.ts`). Change it only if that reasoning is wrong; report either way.
4. `README.md` ~line 82 and `docs/guide/install.md` ~lines 37-41: replace "links use this checkout" prose with the release model — the command, skills, slice and plugin links point through `~/.akrogon/current` to `~/.akrogon/releases/<commit>` built by `git archive` plus `bun install --frozen-lockfile`, flipped atomically; deploy is separate from the workspace checkout move; an uncommitted workspace edit never goes live and never blocks a deploy; failed builds keep `current` and print in `akrogon status`; keep the existing `checkout pending`/`akrogon sync` remedies which still apply to the records move.
5. `docs/guide/create.md` ~line 90: "installed Akrogon checkout" → wording that survives releases (e.g. "installed Akrogon root" or "registered Akrogon repository"); keep semantics.
6. No other prose drifts: grep the three files plus README for `git rev-parse`, `this checkout`, `the checkout` afterward and leave only contexts that still mean the workspace checkout.

## 3. Read-first

- `skills/seed-issue/SKILL.md` (lines ~14-30)
- `skills/chart-issues/SKILL.md` (lines ~70-85)
- `skills/merge-issue/SKILL.md` (lines ~60-66)
- `README.md` (lines ~59-85, ~132, ~189)
- `docs/guide/install.md` (lines ~28-45), `docs/guide/create.md` (~line 90)
- skill folder `ponytail.md`

## 4. Change list and needed interfaces

Owns only: `skills/seed-issue/SKILL.md`, `skills/chart-issues/SKILL.md`, `skills/merge-issue/SKILL.md`, `README.md`, `docs/guide/install.md`, `docs/guide/create.md`. Facts to write: release folders are `~/.akrogon/releases/<full commit sha>`; `current` is a symlink there; every installed link (`.local/bin/akrogon`, the four skill-root links, `~/.config/systemd/user/akrogon.slice`, the herdr plugin link) targets `current/...`; a release contains the tracked tree plus `node_modules` and no `.git`; the workspace checkout at the registered `repos:` path still holds issue records.

## 5. Do-not, reasons and exceptions

- Do not touch `src/`, `tests/` or `docs/reference-index.md` — other units own code; wording for them is out of scope.
- Do not document `akrogon rollback` or the hold record — owned by the `release-rollback` leaf.
- Do not remove the `checkout pending` remedy docs — the records move still reports it.
- Do not invent file names: the deploy record file is `deploy.yaml`, the hold file `release-hold.yaml`; only mention them where the old text already described failure reporting.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A.

## 6. Ordered steps

1. Read the six files (criteria 1-6).
2. Edit seed-issue (1), chart-issues (2), merge-issue if needed (3).
3. Edit README + install.md (4), create.md (5).
4. Grep sweep per criterion 6; run `bunx prettier --check` on changed files.

Advisory size: up to 6 files, prose-only, under 16 turns.

## 7. Commands

- `bunx prettier --check skills/seed-issue/SKILL.md skills/chart-issues/SKILL.md skills/merge-issue/SKILL.md README.md docs/guide/install.md docs/guide/create.md` — must exit 0 for files you changed.
- No test command: prose only.

## 8. Done-when, evidence and report

All six files read, edits match criteria 1-6, prettier passes on changed files. Keep command output through `akrogon run-check --name <label> -- <cmd>` and cite its `check <label>: <exit> <path>` line. Commit only the files this brief owns.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
