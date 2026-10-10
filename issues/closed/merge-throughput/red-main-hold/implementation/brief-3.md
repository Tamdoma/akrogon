# Worker brief U3: status and unpause hold surface

## 1. Goal

Implement plan decision D6 for leaf `red-main-hold`: `akrogon status` marks held repos independently of paused (board, `--charts`, slug form), and `akrogon unpause` prints an existing hold. Done-criterion proven: 6 (plus the `unhold`/`unpause` half of 5).

## 2. Numbered acceptance criteria

1. With a `held.yaml` entry for `repo`, `akrogon status` heading shows `repo (held)`; with the repo also paused, `repo (paused) (held)`; `status --charts` marks it the same way. After `akrogon unhold` the marker is gone.
2. `akrogon status <slug>` on a leaf of a held repo prints a `held:` line naming sha and command, only while held.
3. `akrogon unpause` on a held repo prints `unpaused` and the hold line `held <repo> on <sha>: <command>`; with no hold it prints as before.
4. An invalid `held.yaml` fails `akrogon status` naming the file, mirroring the paused.yaml behavior.

## 3. Read-first list

- `src/status.ts` — `statusCommand`: `const paused = readPaused()` at the top, slug-form `paused:` print (~line 285), board heading `paused.has(...) ? \`${name} (paused)\` : name` (~line 330) used for both board and `--charts`.
- `src/pause.ts` — the read/schema/error shape `src/hold.ts` mirrors.
- `src/hold.ts` (landed by U1): `readHeld(): Record<string, Hold>` lock-free (`ENOENT` → `{}`, invalid → `HoldStateError` naming the file); `heldFor(name): Hold | undefined`; `holdSchema` fields `sha, command, holder, attempt, at, evidence, fix?`.
- `src/akrogon.ts` — `case 'unpause'` block: `pauseCommand` prints then `unpausePass` runs.
- `tests/pause-status.test.ts` — `secondRoot`, `heading()` helpers and the invalid-pause-file case your invalid-held case mirrors; `tests/helpers.ts` — `yaml()`, `cli`, `fixture`, `leaf`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns: `src/status.ts`, `src/akrogon.ts` (only the `unpause` case), `tests/pause-status.test.ts` (append). Depends on U1's `src/hold.ts` — already landed on your branch base.

`src/status.ts`:
- `import { heldFor, readHeld, type Hold } from './hold';`
- In `statusCommand` read the holds once: `const held: Record<string, Hold> = readHeld();` beside `readPaused()`.
- Board/`--charts` heading: build the annotation as a suffix — e.g. `const marks = [paused.has(name) ? 'paused' : '', held[name] !== undefined ? 'held' : ''].filter(Boolean)` → `` `${name}${marks.length ? ` (${marks.join(') (')})` : ''}` `` producing `repo (paused)`, `repo (held)`, `repo (paused) (held)`.
- Slug form: after the `paused:` print add `const hold = heldFor(repo.name); if (hold !== undefined) console.log(\`held: ${hold.sha} ${hold.command}\`);`

`src/akrogon.ts` `unpause` case: after `pauseCommand`, resolve the repo once (it already calls `requireRepo` for `unpausePass`), `const hold = heldFor(repo.name); if (hold !== undefined) console.log(\`held ${repo.name} on ${hold.sha}: ${hold.command}\`)` before `unpausePass`.

`tests/pause-status.test.ts` additions (write `held.yaml` via `yaml(resolve(f.home,'held.yaml'), {repo: {sha:'<40 hex>', command:'bun test', holder:'hold', attempt:'a1', at:'2026-10-10T00:00:00.000Z', evidence:'/x/review-B.md'}})`):
- heading shows `(held)` alone and `(paused) (held)` with `cli(f,['pause'])` first; after `cli(f,['unhold'])` the marker is gone.
- `status <slug>` prints a `held:` line while held and none after `unhold`.
- `unpause` on a held repo: stdout contains `unpaused` and `held repo on`.
- invalid `held.yaml` (e.g. `'["just","a","list"]'` or `'not: [valid'`) fails `akrogon status` with stderr naming the file path — mirror the paused.yaml case.

## 5. Do-not, reasons and exceptions

- Do not change `paused` semantics, ordering of `Missing:` lines, or any other status field — only the two insertion points above; the paused tests must keep passing unchanged.
- Do not edit `src/hold.ts`, `src/next.ts`, `src/phase.ts` or the phase options in `src/akrogon.ts` — other units own them; your only `akrogon.ts` edit is inside `case 'unpause'`.
- Do not print hold details from `unpausePass` in `src/next.ts` — the print lives in the `akrogon.ts` case so `unpausePass` stays callable without it (mergeTurn's own guard prints held lines on its own).
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A. Restating: these exclusions keep one owner per file and the hold surface identical to the plan; only a revised brief from A authorizes a change.

## 6. Ordered steps

1. Write the heading + `unpause` tests first (criteria 1,3).
2. `src/status.ts` changes; `src/akrogon.ts` unpause print.
3. Slug-form and invalid-file cases (criteria 2,4).
4. Run the changed-test command until green; run `bun test tests/pause-status.test.ts tests/status.test.ts` directly.

Advisory size: 3 files, under 30 turns.

## 7. Commands

```sh
AKROGON_BASE=547063c52e068702aaa9e77117b749e9d1341275 bun test --changed="$AKROGON_BASE" --timeout=30000
```

`bun install` first if `node_modules` is absent. `bun test tests/pause-status.test.ts` is the tight loop.

## 8. Done-when, evidence and report

All criteria pass with pasted outputs; commit ID returned. Your commit edits the existing `tests/pause-status.test.ts`, so it must carry the trailer `Test-Change: tests/pause-status.test.ts <what was added; no existing expectation changed>` in its final trailer block (no source citation needed for added cases).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
