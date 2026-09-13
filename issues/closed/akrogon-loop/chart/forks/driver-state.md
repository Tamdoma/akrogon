# Driver State

Chart skill version: 4

Status: resolved
Type: grilling

## Question

Retry counts, pane assignments, a merge waiting its turn, and which tab holds which leaf are state wherever they live. # Next Command Owner settled that there is no driver process: `akrogon next` is a stateless command and a herdr hook calls it. So the question narrows to which of these facts live in the issue's own files (retry count, slot that failed, pane to issue mapping, merge order) and how the command finds the issue from a pane id alone.

Includes: what happens to a pane herdr reports as blocked or unknown, and the auto-approval posture per harness so a pane never waits on a permission prompt.

Coverage pass 2026-09-08 adds: where a skill learns its slot, the prompt text or a per-harness marker (intake 191); where the phase-to-skill-and-slot table lives (103); panes per slot, one tab of two panes per leaf against a fixed two-and-two guess (127, 287); whether a reused pane's conversation breaks blindness for a later pass (119, 267); every herdr fact cited from 0.8.2 docs is re-checked on 0.9.0.

## Findings

Research 2026-09-08, tier 2 (better-than-training): herdr socket API doc, CLI reference, session state doc, local herdr 0.9.0 help and `herdr api schema --json`. Changes # Driver State, # Repeat Safety and # Next Command Owner.

- Event stream: `events.subscribe` with type `pane.agent_status_changed`, optional `pane_id` and `agent_status` filter. Subscriptions "start when the request is accepted and do not replay events retained before that point." Payload: pane_id, workspace_id, agent_status (idle, working, blocked, done, unknown), optional agent, title, state_labels.
- Reconnect: no snapshot on subscribe. `session.snapshot` (CLI `herdr api snapshot`) returns every pane and agent record with agent_status and revision. Documented pattern: subscribe first, buffer, snapshot, apply buffered events in order. So a driver that restarts rebuilds pane state from one call, no memory needed.
- Atomic idle check: none. Only `blocked` is refused. "It does not track turns: if the agent is already working, that active turn's completion may match." The caller checks `agent.get` status then prompts, and the small race between them stays. `agent.prompt` with a `wait` object submits and waits in one request.
- Server restart: processes die, layout, tabs, panes and cwd are restored, and panes whose integration reported a native session reference resume the agent conversation. Others come back as plain shells. Subscriptions and in-flight waits are gone, reconnect and retry. Pane id stability across restart is not documented.
- Limits: no documented max panes or tabs, no documented event ordering guarantee beyond per-record `revision` and `state_change_seq`. Socket at `~/.config/herdr/sessions/<name>/herdr.sock`, newline-delimited JSON, protocol 22 locally.

Slot A research 2026-09-08 (herdr 0.9.0 on this machine, harness docs, tier 2). Pane to issue: `herdr pane get` returns cwd, restored after server restart, so a per-leaf tab created with `--cwd <worktree>` maps pane to issue for free; tab labels and pane tokens (max 16, display-only) cost a second write. Minimal state: `phase` written by the lifecycle command and `attempts` written by `akrogon next`, reset when the phase moves; slot and pane derive from the table and the tab. Slot in the prompt text, no marker file. Per-leaf tab: four herdr calls and two agent starts, no documented tab limit. Auto-approval: Claude Code `--dangerously-skip-permissions` with no ask rules loaded and no AskUserQuestion in skills; Codex `-a never -s danger-full-access` (already this machine's config); pi `-a` (pi has no permission prompts at all). Correction: the five-minute cap on `agent prompt --wait` is not in 0.9.0, the wait is indefinite after activity, only a 5-second stall check exists, the 300000 ms cap belongs to `agent start`.

Slot B round 2026-09-08 (blind): routing map in the command; slot and pass in the dispatched prompt; a dedicated two-pane tab per leaf; pane assignments saved in issue state and found by scanning issue roots; keep pass identity, slot and retry progress in state; blocked or unknown goes to the peer; blindness as a reading restriction within a retained conversation.

Operator answers 2026-09-08: 7-A cwd, plus tabs and panes must be created and named automatically with no program to maintain. 8-A tab per issue. 9-B state holds phase, attempts, slot and pane. 10-A slot in the prompt.

Operator answers 2026-09-08 (chat): 6 confirmed, phase and next are agent commands, status is the operator's. 7 design accepted: `akrogon next <leaf|epic-folder|--all>` starts work only when the operator runs it, never at the end of the chart; on an issue with no tab it creates one tab named `<slug>` with cwd the worktree and two agents `<slug>-a`, `<slug>-b`; a merged leaf closes its tab and the command starts the leaves in the same epic folder that the merge unblocked, up to `max_active` in config; an issue folder is nested in its epic folder so `akrogon next <folder>` recurses ("category" retired 2026-09-09, the terms are series, issue, leaf); panes are never reused across issues. The command finds the state file from the pane's cwd (the worktree) and the folder it was given, never from a registry. 9-B note: the stored pane is a hint for status, cwd is the truth. Architecture accepted by the operator, no challenge raised.

Reshape 2026-09-08: 11 open Questions redrawn (config-shape, model-tiering, skill-rewrite, repeat-safety, status-view, handoff-location, peer-questions, parallel-merge, quality-layers, distribution, implementer-brief), none ruled out, no new fork.

## Taken

State lives in the issue's own `state.yaml`: `phase`, `attempts`, `done`, `slot` and `pane` hints. `akrogon next` finds the issue from the pane's cwd, which herdr restores across restarts, or from the folder the operator names. Tabs and panes are created and named automatically by the command from the slug, one tab of two panes per leaf, never reused. Slot is text in the prompt. The phase-to-skill-and-slot table is a constant in the command. Work starts only when the operator runs `akrogon next` on a leaf, an epic folder or `--all`; a merge closes the tab and starts what it unblocked, bounded by `max_active`. Blocked or unknown panes go to the peer wake-up path from # Next Command Owner. Auto-approval per harness is a fact, not a setting: Claude `--dangerously-skip-permissions`, Codex `-a never -s danger-full-access`, pi `-a`. Why: cwd is the one fact herdr owns and restores, so no mapping file, no registry, no program to maintain. Forecloses: a pane registry, tab renaming by hand, a separate `start` verb, pane reuse across issues, marker files for slot, any auto-start after the chart.

From # Config Shape 2026-09-08: `akrogon next` starts a slot by filling the harness launch line from config with the slot model and effort and handing it to herdr; `akrogon config` prints the effective config for a repo.

From # Model Tiering 2026-09-09: `akrogon phase` also appends one JSON line to `issues/log.jsonl` per move, from data it already holds plus `git rev-parse HEAD` and `git diff --shortstat $AKROGON_BASE` in the worktree.

From # Repeat Safety 2026-09-09: `next` and `phase` take `flock` on `<leaf>/.lock` (gitignored) around state read-modify-write; `next` prompts with `--wait --until working` and a short timeout; a `working` event never counts an attempt.

From # Multi Chart Layout 2026-09-09: "series" is now "epic" (two or more issues); the command moves a finished issue or epic to issues/closed under the issue lock; `hand_built: true` leaves are skipped by `next` and `--all`; the authoritative state is the registered checkout, never a worktree copy.

From # GitHub Intake 2026-09-09: state.yaml gains an optional `sources` list; `akrogon phase merged` closes the listed GitHub issues when the owner folder moves to closed, state check first, one retry, failure printed.
