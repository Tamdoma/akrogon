# Design: status-json

## Binding decisions, verbatim

### Where the Tasks board gets its data (`issues/chart/tasks-panel/forks/status-json.md`)

Operator, verbatim: "go, but consult with consultants first. | 2 - 2a"

Settled: akrogon gains `akrogon status --json`; the Tasks board reads only that and shows everything `akrogon status` shows, so the operator never needs to run the command. The text command stays. Foreclosed: the mod parsing akrogon's files (2b).

### Tasks board (A4) (`issues/chart/tasks-panel/forks/tasks-panel.md`)

Operator, verbatim: "1b - because it's not unusual for the agents to work for more than 1h. The red is when something's really blocked, not time-dependent | 2a | 3a - ... | 4a | 5a | File the seed." Round 3b: "1a | 2a".

- Red marks real blocks only, never time: failed, prompt not delivered, Missing key, deploy failed, unreadable repo; after the herdr-app port also a seat `blocked` on a prompt. Time shows uncolored. Slow merge stays an amber alert line.
- 2a: a click expands the row (history, seats, plan path, kept paths) with buttons that point Files and Changes at the leaf's worktree. Go to A / Go to B wait for the port.
- 3a + 3b 1a: closed until opened; Tasks button in herdr-setup's top bar; `ctrl-b t` opens Tasks and closes it when Tasks shows.
- 4a: folded "Last merges (5)" across repos with age and total time. 5a: open charts folded under each repo.
- Defaults: `--json` always covers all registered repos; each leaf's detail is embedded; read-only; repo groups with epic/issue folders; alerts on top and tagged on their row; two-line rows with Program logos; current space's repo first; a 60 s redraw while visible; watch each repo's `issues/` plus `~/.akrogon` control paths only.


Excluded here: rendering (`tasks-mod`); Go to A/B and port-time seat `blocked` red (akrogon's herdr-app port).

Standing design: `~/.akrogon/current/skills/chart-issues/assets/standing-design.md`. Applied here: real fixture repos inside the existing test setup; no new machinery; the JSON is a serialization of the existing scan, never a second scan.

## Leaf architecture

Envelope names, verbatim in `status-json` and `tasks-mod` (D):

```text
{ schema: 1, generated: <ms>, red: <n>,
  watch: { folders: [<path>], files: [<path>] },
  deploy: { failed: bool, attempted, active, step, error } | null,
  run: <run line text> | null, kept: [{ path, reason }] (host),
  merges: [{ repo, slug, merged: <ms>, total_ms }] (5),
  repos: [{ name, root, paused, error | null, unreadable: [{ path, error }],
            slow: { leaf, run, ms, normal_ms } | null, unpacked: [{ path, command }],
            queue: [{ slug, place }], kept: [{ path, reason }], charts: [<--charts row cells>],
            leaves: [{ slug, group: [<folder>], phase, phase_since, first_prompt, stopped, blocked_by: [{ slug, label }],
                       broadcast_pending, land, busy_since: { a, b }, done, attempts, fix_rounds, verdict,
                       delivery_errors, failure, missing: [{ kind, name, holder, steps }], worktree, plan,
                       red: bool, seats: { a: { harness, command, source }, b: { harness, command, source } },
                       history: [<line>] (10) }] }] }
```

Owned: `src/status.ts` (`statusCommand` gains the JSON path; `scanRepo`, `note`, `cells`, `chartRows`, `unpackedLines` stay the source of every fact they hold) and `src/akrogon.ts` (the `status` verb's `json` flag). The text output is unchanged byte for byte. Two facts come from outside `scanRepo` (D): merged leaves in `issues/closed/` (`scanRepo` keeps only `issues/open`, so last merges read the repo inventory and log), and each leaf's worktree path (`resolve(worktreeStore(), repo, slug)`, `src/config.ts` `worktreeStore`).

- `red` is computed from the same predicates the text alerts use (`Failed:`, delivery errors, `Missing:`, `deploy failed`, unreadable); the panel never recomputes it.
- Harness first word: from `config.harnesses[slot.harness]` (`src/config.ts`), so `agy` maps to herdr's `antigravity` Program by `run[0]`.
- Last merges: merged leaves across repos, total time per repo from that repo's timings before sorting (tasks-panel final check D F2).
- Open for the plan: whether leaf detail reuses `statusCommand`'s slug branch through a shared function.
