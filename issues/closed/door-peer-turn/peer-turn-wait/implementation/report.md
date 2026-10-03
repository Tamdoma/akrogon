# Implementation report: peer-turn-wait

Base: `69038ef023a8434104bb9c6335f79daa1a6c2377` · Head: `745413f` (4 commits, delegated mode, 5 workers)

## Changed files and reasons

- `skills/chart-issues/scripts/peer-wait.ts` (new) — foreground wait loop: `herdr agent wait <pane> --timeout <min(10000, remaining)>` on a monotonic deadline; precedence non-timeout error pass-through → `blocked` → file non-empty `done` → `idle`/`done`+missing/empty `failure` → `budget`; one JSON result line; criteria 1–2.
- `tests/fake-herdr.ts` — `agent wait` support + `waitScript` (`status`, `code`, `message`, `stderr`, `sleepMs`, `append`); unscripted `working` sleeps the full requested `--timeout` (real herdr semantics — revised from an initial 50 ms after worker evidence showed the budget-clamp assertion unsatisfiable otherwise); criterion 2 fixture.
- `tests/peer-wait.test.ts` (new) — 9 tests, one per outcome branch + budget clamp + argv validation; criteria 1–2.
- `skills/chart-issues/assets/questions.md` — post-prompt waits are the script in foreground, stay-in-turn, no background waits, end-of-turn rules, fresh return path; two protected sentences verified byte-identical by worker diff against `git show HEAD:`; criterion 3.
- `skills/chart-issues/SKILL.md` — footer-only-on-turn-end sentence; one pointer sentence each in Drain and Take; criterion 4.
- `tsconfig.json` — `include` gains `skills/chart-issues/scripts/**/*.ts`; `package.json` — `format` glob gains `skills/chart-issues/scripts`; criterion 5.

## Commands run

| Command | Result |
|---|---|
| `bun test --changed=$AKROGON_BASE --timeout=30000` | 9 pass / 0 fail (per pick: 0 affected until test file landed) |
| `bun run format` | clean, `peer-wait.ts` unchanged after U5's one-time prettier wrap |
| `bun run typecheck` (`tsc --noEmit`) | clean |
| `bun test --timeout=30000` (full suite) | **404 pass / 0 fail**, 19 files, **12.04 s wall** |

## Done-criteria → evidence

1. Loop/deadline/one-line contract → `budget clamps each wait timeout to the remaining budget` (per-call bound `t_i ≤ budgetMs − Σ prior timeouts`, wall ≥ budget) + `done while herdr still reports working`, `budget keeps the last status` (status-null vs last-status cases).
2. Precedence → `passes a non-timeout herdr failure through unchanged` (byte-identical stderr, code 1, empty stdout), `blocked wins over a non-empty return file`, `done when the return file is written during a timed-out wait`, `done while herdr still reports working`, `failure on idle with the return file missing`, `failure on done with a 0-byte return file`, `budget clamps…`. All in `bun test tests/peer-wait.test.ts`: 9/9.
3. questions.md → prose read against criterion; guarded-prompt and "Pane text…" sentences verified unchanged.
4. SKILL.md → footer rule + two pointers added; nothing else touched.
5. `include` covers the script; `format`, `typecheck`, `test` all pass (above).

## Known limitations

- Budget-clamp test exercises 1–2 wait calls at 0.5 s budget (full-timeout sleeps make calls long); larger budgets exercise more iterations but the invariant is asserted per call.
- Fake `append` writes `<pane_id>\n` — sufficient for "file written during wait" but not arbitrary content.
- No live peer exercised per design (`readiness.yaml` already proved `herdr agent wait` for real at charting).

## Unverified criteria

None — criteria 3–4 are prose-checked per design (no wording-asserting test); all others test-proven.
