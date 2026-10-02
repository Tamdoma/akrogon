# Review A: seat-log-path

Base `5bb552d0e2726cab6469699541317fe53053bd6c`, reviewed head `29861c0` (commits `543d5fa`, `99d1938`, `29861c0`). `debate: no`, so no positions/rebuttal files expected — confirmed absent.

## Verification evidence

- `bun test scripts` in `skills/watch-issues`: 30 pass / 0 fail / 74 expects (856ms).
- `bun run typecheck` in `skills/watch-issues`: clean.
- Root `bun test scripts` sanity + `tsc --noEmit`: clean.
- Fixture `fixtures/herdr-agent-list.json`: parses as JSON, `result.agents` has 14 real entries spanning `claude`/`codex`/`pi` and `kind` `id`/`path`/absent — consistent with a verbatim live capture, not handcrafted.
- Diff inspected in full against plan D1–D8 and brief contract: field placement after `[ busy=HhMMm]`, `working`-only gating, `-` semantics, codex multi-match throw naming pane + paths, resolution scoped to leaf-referenced panes (no unreferenced-pane failure path), `HOME` read once from env, `existsSync` gate on every candidate.
- Docs: no AREA.md touched; `skills/watch-issues/SKILL.md:28` is the only format copy (sweep repeated) and now documents the field accurately. No documented behavior elsewhere changed.

## Fixes

None.

## Nits

- N1: No test covers a working seat whose `agent_session.kind` is `id` with an `agent` other than claude/codex, nor a `kind` value outside the enum — both resolve to `-` in `resolveLog`'s final `else`. Deferred: the code path is reached only by entries herdr does not emit today (recorded fixture shows claude/codex/pi only), and the `-` fallthrough is a single line; promotion evidence would be a live herdr release adding such an entry.
- N2: No B-seat log case (`logB=`). Deferred: the code builds `logA`/`logB` through the identical branch; the line-format asymmetry risk is nil. Promotion: a consumer defect showing B-seat paths resolving differently.

## Verdict

`nits` — implementation matches plan, design and brief contract; every done-criterion has a passing proof; no defect with a realistic source and a consequence today.
