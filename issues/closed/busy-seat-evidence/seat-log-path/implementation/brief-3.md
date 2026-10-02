# Brief-3: observe tests for session log paths

## 1. Goal

`skills/watch-issues/scripts/observe.test.ts` proves the new ` log<seat>=` field end to end through the `OBSERVE_HERDR`/`HOME` seams, including one recorded real `herdr agent list` fixture. Plan decisions D6, D7; done-criteria 1 and 2.

## 2. Acceptance criteria

1. A recorded-parse test reads `skills/watch-issues/scripts/fixtures/herdr-agent-list.json` (verbatim output of a real `herdr agent list` you capture during this work) and asserts `herdrListSchema.safeParse` (imported from `./observe.ts`) succeeds. A comment in the test file notes herdr version, date and the capture command.
2. `herdrOk` generalizes so a stub agent entry can carry `agent`, `cwd`, `agent_session` verbatim; keep accepting `{pane_id, agent_status}` bare entries.
3. The four existing tests that stub a `working` seat now expect ` logA=-` in their exact lines: `mixed A working and B idle`, `busy with and without busy_notified` (both lines), `unparsable busy_since prints no suffix`, `future busy_since prints busy=0h00m`.
4. New tests set `HOME` through `runObserve`'s `envExtra` (never touch a real home dir) and cover, each as its own assertion or test:
   - working claude seat: entry `{agent:'claude', agent_session:{kind:'id', value:'<id>'}, cwd:'<a cwd with mixed chars like /tmp/My.Dir>'}`; create `<tempHOME>/.claude/projects/<cwd with every char outside A-Za-z0-9 replaced by ->/<id>.jsonl` → line has ` logA=<that absolute path>`
   - working codex seat: `{agent:'codex', agent_session:{kind:'id', value:'<id>'}}`; create `<tempHOME>/.codex/sessions/<d1>/<d2>/<d3>/rollout-<anything>-<id>.jsonl` → ` logA=<that path>`
   - working pi seat: `{agent:'pi', agent_session:{kind:'path', value:'<path to a real file inside temp>'}}` → ` logA=<that path>`
   - working seat, entry has no `agent_session` → ` logA=-`
   - working seat whose resolved file does not exist → ` logA=-`
   - working codex seat with two matching rollout files → observe exits non-zero; stderr contains the pane id and both file paths
   - idle seat with an `agent_session` → its segment has no `log` field at all
5. Stdout line assertions stay exact (`toEqual`); stderr assertions use `toContain` on the pane id and each matched path, never exact wording.
6. No test touches a file outside its `mkdtempSync` tree.

## 3. Read-first list

- `skills/watch-issues/scripts/observe.ts` — the landed implementation: `herdrListSchema` (exported), `resolveLog`, `codexSessionPaths` (3-level walk), `formatLeaf`, `main`
- `skills/watch-issues/scripts/observe.test.ts` — the file you edit; `runObserve` already merges `envExtra` over `process.env`, so `HOME` override is free
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and interfaces

Owns: `skills/watch-issues/scripts/observe.test.ts` and new file `skills/watch-issues/scripts/fixtures/herdr-agent-list.json`. Lands first: U1 (`observe.ts`, already landed in this worktree's HEAD). Shared test resource: none.

Contract already landed (verify against the file, these are the binding facts):

- `logA=`/`logB=` appears after that seat's optional ` busy=HhMMm`, only when `agent_status === 'working'`.
- `kind:'path'` → the value as-is, gated by `existsSync` (absent → `-`).
- `kind:'id'` + `agent:'claude'` → `$HOME/.claude/projects/<sanitized cwd>/<value>.jsonl` gated by `existsSync`.
- `kind:'id'` + `agent:'codex'` → unique `rollout-*-<value>.jsonl` at depth 3 under `$HOME/.codex/sessions`; zero → `-`, several → non-zero exit naming pane + matches.
- anything else (no session, other agent, other kind) → `-`.
- `HOME` unset with `kind:'id'` → `-`.

Capturing the fixture: run `herdr agent list > skills/watch-issues/scripts/fixtures/herdr-agent-list.json` and `herdr --version` (currently 0.9.3); paste the raw JSON unmodified. The parse test does not resolve paths from the fixture.

## 5. Do-not

- Do not edit `observe.ts`, `SKILL.md` or anything outside your owned paths; an impl defect returns as a mismatch with evidence.
- Do not weaken existing exact stdout assertions to substring/regex — the line is the contract.
- Do not create files under the real `$HOME`, `~/.claude`, `~/.codex`, `~/.pi`.
- Do not hand-patch the recorded fixture; it stays verbatim. A parse failure on the real capture is a mismatch, not a fixture edit.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

## 6. Ordered steps

1. Read `observe.ts` landed version and the existing test file fully (AC2, AC3).
2. Capture the fixture and write the recorded-parse test (AC1).
3. Generalize `herdrOk` (AC2).
4. Update the four existing expectations with ` logA=-` (AC3).
5. Write the criterion-2 tests (AC4, AC5, AC6); use a shared temp-HOME builder helper rather than duplicating mkdir chains.
6. Run the commands below until green.

Advisory size: 1 file edited + 1 fixture, under 40 turns.

## 7. Commands

```
cd /home/ivan/Work/infra/akrogon/issues/worktrees/seat-log-path-u3 && bun install && (cd skills/watch-issues && bun install)
cd /home/ivan/Work/infra/akrogon/issues/worktrees/seat-log-path-u3 && AKROGON_BASE=5bb552d0e2726cab6469699541317fe53053bd6c bun test --changed=5bb552d0e2726cab6469699541317fe53053bd6c --timeout=30000
cd /home/ivan/Work/infra/akrogon/issues/worktrees/seat-log-path-u3/skills/watch-issues && bun run typecheck && bun test scripts
```

## 8. Done-when

All criteria proven, `bun test scripts` fully green including the recorded-parse test, typecheck passes, and the commit covers only `observe.test.ts` + the fixture. Return the commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
