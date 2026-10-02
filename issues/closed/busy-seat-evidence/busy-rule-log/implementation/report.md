# Implementation report: busy-rule-log

Base: bf88de02b3d4541accb6045e9bced3feb45355b4 · Head: 84137d0 (lane branch busy-rule-log, 2 commits: d9184aa SKILL.md, 84137d0 join test; worker commits af465a1, ae14452 cherry-picked).

## Changed files and reasons

- `skills/watch-issues/SKILL.md` (d9184aa) — closer-look line reads a `working` seat with `--source visible`, `--lines 80` otherwise (D1); Busy bullet judges each busy seat from `log-tail.ts <path>` output with `--source visible` secondary, covering `log<seat>=-` ("no log"), non-zero exit ("log unreadable: <stderr message>"), `#`/`old#`/`new#`/`#-` identity semantics, read-failure-never-steers and other-seat judging (D2, D3); bar, resteer and "insufficient evidence" sentences verbatim, no elapsed limit (D4). Worker: sa-1.
- `skills/watch-issues/scripts/observe-log-tail.test.ts` (84137d0, new) — join test: real observe.ts (stub akrogon/herdr, temp HOME, `path`-kind pi session) prints `logA=<copied fixture>`; real log-tail.ts on that path prints the six pi-session lines with `sha8` computed in-test over fixture strings. Header states wiring-only scope and fixture provenance (D5, D6). Worker: sa-2.

No other file touched; no doc outside SKILL.md made stale (`skills/AREA.md`, `docs/guide/` remain accurate).

## Commands run

| Command | Result | Wall time |
|---|---|---|
| `bun run format` (root) | all files unchanged | seconds |
| `bun test --timeout=30000` (root) | 357 pass, 0 fail, 16 files | 11.18s |
| `bun run typecheck` (root) | `tsc --noEmit`, exit 0 | seconds |
| `bun test --changed=bf88de0 --timeout=30000` (root) | "2 changed files, but no test files are affected" — see limitation | seconds |
| `bun test --changed=bf88de0 --timeout=30000` (`skills/watch-issues`) | 1 pass, 0 fail — the new join test | seconds |
| `bun test scripts` + `bun run typecheck` (`skills/watch-issues`) | 48 pass / exit 0 (worker evidence; root `watch-issues-scripts.test.ts` reran both green inside the 357-test run) | seconds |
| grep proof (criterion 1) | `--lines 80` survives only as non-working-seat fallback at :30; `log-tail`, `no log`, `log unreadable`, `--source visible` present at :30/:40 | seconds |

## Done-criteria → evidence

1. SKILL.md statements: diff of d9184aa + grep lines 30/40 (pasted above).
2. Join test: `observe-log-tail.test.ts`, green under `bun test scripts` and skill-local `--changed`.
3. Blocking `test`: `bun test --timeout=30000` 357 pass incl. `tests/watch-issues-scripts.test.ts` (1236ms).

## Known limitations

- `bun test --changed` at the repo root does not resolve tests inside `skills/watch-issues` (nested package); it reports "no test files are affected". The leaf's own changed test was proven with the same command run inside `skills/watch-issues`, and the nested suite also runs inside the blocking root test.

## Unverified criteria

None.
