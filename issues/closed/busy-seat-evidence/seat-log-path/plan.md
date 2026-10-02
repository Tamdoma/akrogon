# Plan: seat-log-path

Debate off (`debate: "no"`); synthesized from brief.md and design.md against the live worktree.

## Decisions

- D1: All changes stay inside `skills/watch-issues`. `src/session-file.ts` is not reused: it resolves only pi `kind:id` under `~/.pi/agent/sessions`, its zero/multi-match semantics differ from this leaf's contract, and the subpackage `tsconfig.json` includes only `scripts/*.ts`. Resolution lives in `observe.ts`.
- D2: Extend `herdrListSchema`'s agent entry to `{pane_id, agent_status, agent: z.string().optional(), cwd: z.string().optional(), agent_session: z.object({kind: z.enum(['id','path']), value: z.string()}).optional()}`. Plain `z.object` (non-strict): live entries carry extra keys (`source`, `tab_id`, `revision`, ...). `agent` stays a loose string so a future harness name degrades to `-` instead of failing the whole list.
- D3: `agentStatuses` returns `Map<pane_id, AgentEntry>` where `AgentEntry` is the full parsed row. In `main`, after sorting leaves, resolve every referenced pane whose status is `working` into a `Map<pane_id, string>` of log paths before any line prints. This scopes filesystem touches and the codex multi-match failure to leaf seats only, and keeps a failure from emitting partial stdout. `formatLeaf` takes both maps and stays lookup-only. `HOME` is read once in `main` (`process.env.HOME ?? ''`) and passed down.
- D4: One path-resolution function `resolveLog(paneId, entry, home): string`:
  - no `agent_session` → `-`
  - `kind === 'path'` → `session.value` (any agent, per brief's unconditional `path` rule)
  - `kind === 'id'` and `agent === 'claude'` → `join(home, '.claude', 'projects', entry.cwd.replaceAll(/[^A-Za-z0-9]/g, '-'), session.value + '.jsonl')`
  - `kind === 'id'` and `agent === 'codex'` → scan `join(home, '.codex', 'sessions')` exactly three directory levels deep (`readdirSync` with Dirents, missing directory yields no matches, mirroring `src/session-file.ts` style) for files matching `rollout-*-<value>.jsonl`; zero matches → `-`, more than one → throw `Error` naming the pane and every match (message content pinned: pane id plus each matched path; exact wording free)
  - any other `agent` or `kind` → `-`
  - every resolved candidate passes through `existsSync`; absent → `-`
  - `home === ''` with `kind === 'id'` → `-` (an unwritten-path state, design Q2 2a)
- D5: `formatLeaf` appends ` logA=<path|->` / ` logB=<path|->` immediately after that seat's `[ busy=HhMMm]` suffix, only when that seat's herdr status is `working`. All other statuses and absent panes get no field. Seats whose pane id is not in the herdr list keep `-` status and get no field.
- D6: Recorded-schema proof uses a verbatim capture at `skills/watch-issues/scripts/fixtures/herdr-agent-list.json` (captured with `herdr agent list > <fixture>`, herdr 0.9.3, 2026-10-02 — version, date and command noted in a comment in the test file). The test parses it with `herdrListSchema` exported from `observe.ts` (`import.meta.main` already guards side effects) and asserts success.
- D7: `herdrOk` generalizes to accept full agent entries (pass `agent`, `cwd`, `agent_session` through verbatim). Existing tests that stub a `working` seat gain ` logA=-` in their exact line expectations (`mixed A working and B idle`, `busy with and without busy_notified`, `unparsable busy_since`, `future busy_since`). New tests set `HOME` via the existing `envExtra` spread in `runObserve`, so resolution lands inside the temp directory only.
- D8: `skills/watch-issues/SKILL.md:28` format line gains `[ logA=<path|->]` and `[ logB=<path|->]` inside each seat's group after `[ busy=HhMMm]`, plus one clause: the field appears only when the seat's herdr status is `working` and `-` means no usable log. Doc sweep found no other copy of the format (`skills/AREA.md:15` mentions observe without the format). No other doc affected.

## Read-first

- `skills/watch-issues/scripts/observe.ts` — the file being changed; `herdrListSchema`, `agentStatuses`, `formatLeaf`, `main`
- `skills/watch-issues/scripts/observe.test.ts` — `runObserve`/`envExtra` seam, `herdrOk`, exact line expectations to update
- `skills/watch-issues/SKILL.md` — line 28, the only format documentation
- `tests/watch-issues-scripts.test.ts` — the blocking gate: runs `bun test scripts` + `bun run typecheck` in the subpackage
- `skills/watch-issues/package.json` / `tsconfig.json` — subpackage scripts and include scope
- `src/session-file.ts:11-34` — style to mirror for bounded `readdirSync` walking (not imported)
- `src/shell.ts:74-85` — `paneSchema`, the existing shape of `agent`/`cwd`/`agent_session`

## Interfaces

- observe stdout: `... A=<pane|->/<status|->[ busy=HhMMm][ logA=<path|->] B=<pane|->/<status|->[ busy=HhMMm][ logB=<path|->] notified=...`; `logA=`/`logB=` present iff that seat's `agent_status` is `working`.
- codex multi-match: observe exits non-zero; stderr names the pane id and every matching path.
- `herdrListSchema` is exported for the recorded-fixture parse test.
- `OBSERVE_HERDR`, `OBSERVE_AKROGON`, and `HOME` are the test seams; tests touch nothing outside their temp directory.

## Checklist

Wave 1 (2 units, disjoint paths):

- U1 `skills/watch-issues/scripts/observe.ts`: D2 schema extension + export, D3 entry map + pre-print resolution pass, D4 `resolveLog`, D5 `formatLeaf` field append. No shared test resource. No prerequisites.
- U2 `skills/watch-issues/SKILL.md:28`: D8 format line and clause. No prerequisites.

Wave 2 (1 unit, depends on U1):

- U3 `skills/watch-issues/scripts/observe.test.ts` + `scripts/fixtures/herdr-agent-list.json`: D6 recorded-parse test (capture fixture live with `herdr agent list`, note version/date/command in the test), D7 generalized `herdrOk` + updated expectations, and the criterion-2 cases:
  1. working claude seat: `agent_session {kind:'id'}`, `cwd` with mixed chars; temp `HOME` holds `.claude/projects/<sanitized-cwd>/<value>.jsonl` → ` logA=<built path>`
  2. working codex seat: temp `HOME` holds `.codex/sessions/<d1>/<d2>/<d3>/rollout-<x>-<value>.jsonl` → ` logA=<path>`
  3. working pi seat: `kind:'path'` value pointing at a real file inside temp → ` logA=<value>`
  4. working seat with no `agent_session` → ` logA=-`
  5. working seat whose resolved file is absent → ` logA=-`
  6. two codex rollout matches → exit non-zero, stderr contains pane id and both paths
  7. idle seat with an `agent_session` → no `log` field on its line
  stderr assertions use `toContain` on pane id and paths, never exact wording; stdout stays exact `toEqual` (the line is the contract).

## Verification

| Criterion | Proof command | Failure it catches | Size | Rerun trigger |
|---|---|---|---|---|
| C1 recorded list parses | `bun test scripts` in `skills/watch-issues` | schema drift vs real herdr output | seconds | fixture or schema change |
| C2 resolution cases (7) | same `bun test scripts` run | wrong path, missing `-`, missing error, log on idle seat | seconds | `resolveLog`, `formatLeaf`, or `herdrOk` change |
| C3 blocking test | `bun test --timeout=30000` at worktree root (runs `tests/watch-issues-scripts.test.ts`: `bun test scripts` + `bun run typecheck` in the subpackage) | subpackage regressions, typecheck | minutes | any change in the leaf |
| C4 SKILL.md doc | read `skills/watch-issues/SKILL.md:28` | undocumented field | seconds | format line edit |

Credentials: the design names no env variables; nothing to check, no blocker.

## Notes for review

- `blocked-by: watch-scripts-check` still reads `phase: implement` in `issues/open`, but its deliverable `tests/watch-issues-scripts.test.ts` is already in this worktree's HEAD (commits `7000b6a`, `5bb552d`), so C3's gate exists here. The dependency record stands; the code needed is present.
- Eager per-leaf-seat resolution (D3) instead of resolving every herdr entry: panes from other repos appear in `herdr agent list`, and an unrelated pane's ambiguous codex session must not break this repo's fire.
- `kind:'path'` resolves for any agent name (brief wording); a `kind:'id'` entry for a non-claude non-codex agent yields `-`.
