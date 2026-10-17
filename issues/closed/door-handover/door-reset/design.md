# Design: door-reset

## Binding decisions, verbatim

Source: issues/chart/door-handover/forks/handover.md. Operator answers 2026-10-17 in the door pane: "1a 2b | 3a - Are you sure this is gonna be valid 100 percent of the time? Do we need something deterministic or not? You tell me and challenge me | 4c | 5 - I don't want to limit myself to only one slot A harness or model, so presume and fix it so it works for any harness and any model. I'm mostly using Claude, Codex and Pi like I'm using now. So maybe focus on these thee only for now. |", then "4b |", then "reset". The later "reset" replaces 2b and 4b.

- **1a. When.** Hand over only when switching to the next runnable handed chart, after the outgoing chart's records are written, every consultant return is collected and its span is closed. The fresh A enters that chart directly and does not hand over on entry. Foreclosed: mid-chart, every chart entry, every pass end.
- **reset (replaces 2b and 4b).** There is no process stop and no relaunch. Steps:
  1. The helper waits for A's proven turn end.
  2. It rechecks the pane's session.
  3. It sends the kind's new-conversation command (`/clear` for claude, `/new` for codex and pi) through herdr.
  4. It confirms a new conversation, then sends the start prompt. Old A ends its turn normally. A reset that is not confirmed is logged, and no start prompt is sent.

  Codex shows a new session only after an exchange, so for codex the helper first sends one harmless check prompt (no chart work) and confirms the session change before the start prompt. (A,B: B leaf review F7, keeping the binding "no start prompt when unconfirmed") Reason: the process, model, flags and in-session settings stay as they are, with no argv parsing (B F4/F5) and no kill. Foreclosed: idle-wait kill (2a), kill and relaunch with plain argv (4a, 4c), and kill and relaunch with argv minus history (4b).
- **Next chart folder (A,B: B leaf review F1).** When the next handed item has no chart folder, old A creates it before the handover (INTAKE.md and CHART.md with its mode record, as at chart creation). The fresh A writes its seats.yaml and opens its first span on entry, so `opened` stays the time the door began its first pass there.
- **3a. Continuation record.** Old A appends `handover <time> <log>: handed <remaining list>; consultants <surviving>` to the mode record of every handed chart still open. The start prompt names the pane, the time, the next item and the absolute skill path. A session in that pane whose latest mode entry is that handover appends `continue autopilot (handover <time>)` and continues as after the operator's words. Every other new session starts attended as today.
  - Reason given to the operator: every exact step (which pane, which session, one reset, the handover time) is code in the helper. The fresh A's only judgment is reading the line, and a misread falls back to today's attended start, so no checker script is added.
  - Foreclosed: a separate one-use transfer record (3b), and inheriting the latest `on`.
- **5. Harnesses.** Claude, codex and pi, each proven live. Other kinds keep today's same-session behavior: no handover and no inherited authorization.
- **Operator scope (switch-on words, INTAKE.md).** "every change needs to be minimal, and the entire system has to be taken into context without breaking anything. The manual mode still has to work the same." Also: "this is only in autopilot mode", confirmed by A in the door pane on 2026-10-17.

## Standing design

/home/ivan/.akrogon/releases/25fec20069ad59bbebe7dc36e4ff67e507427eb7/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf:
- Criteria 2–5 are helper logic at the herdr CLI boundary. They are proven by own tests that run the script against `tests/fake-herdr.ts` with fixture transcripts, rollouts and pi rows. Each new behavior is shown by one deliberate break turning its test red.
- Criterion 1 is runtime behavior across herdr, three real harnesses and the skill text, which no smaller test can show. It is a live run using existing machinery only (herdr panes, the harness CLIs, scratch git repos), with the three sessions side by side, each with its own root and log.
- No machinery is built. A test reads sources rather than copying lists.

## Leaf architecture

Owned surfaces:
- `skills/chart-issues/scripts/door-reset.ts` (new).
- `skills/chart-issues/scripts/peer-wait.ts`: export only the per-kind turn-end readers the helper reuses (`claudeTurnOpen`, `codexRollout`/`codexEnded`, `piAuthority`), with no behavior change.
- `skills/chart-issues/SKILL.md` `## Autopilot` and `## Printed footer`.
- `skills/chart-issues/assets/shapes.md` mode-record line and its paragraph.
- `docs/guide/chart.md` `## Autopilot`.
- `tests/door-reset.test.ts` (new), and `tests/fake-herdr.ts` where it needs to answer `agent prompt` with a reset effect.

Interface: `bun <skill-folder>/scripts/door-reset.ts <A pane> <A session> <log> <start prompt>`.
- Parent: reads `herdr agent list`. It refuses (exit non-zero, nothing sent, no log line) unless the pane's agent is claude, codex or pi and its `agent_session.value` equals `<A session>`. It then re-spawns itself detached in a new session with stdout and stderr appended to `<log>`, prints `queued` and exits 0.
- Child steps, the first failure stopping:
  1. Wait for the proven turn end (criterion 3), bounded.
  2. Recheck kind and session.
  3. `herdr agent prompt <pane> <reset command>`.
  4. Codex only: `herdr agent prompt <pane> <check prompt> --wait --until working --timeout 5000`, then wait for idle or done. (A,B)
  5. Wait for a session different from `<A session>`, bounded. If none appears, log `reset unconfirmed` and stop.
  6. `herdr agent prompt <pane> <start prompt> --wait --until working --timeout 5000`.
  Each step is one JSON line in `<log>`.
- Prior art, not product: the scratch prototype in issues/chart/door-handover/slots/reset-probe/proto.ts.

States this change alters, and the consumers that rely on them:
- The mode record gains `handover` and `continue autopilot (handover <time>)` entries. The `handover` entry goes to every handed chart still open, the next chart included, whose folder old A creates when absent. The start prompt names that folder.
  - SKILL.md `## Autopilot` reads the latest entry before continuing. Decision 3a gives the one added clause.
  - No script parses `- mode` lines (checked 2026-10-17 with `grep -rn` over skills/chart-issues/scripts and src). `chart-usage.ts` reads seats.yaml, not the mode record.
- A's session changes inside one pane. seats.yaml gets a new A entry with the same seat letter and pane by the existing rule (SKILL.md `## Open` seat record), appended when herdr shows the session. The "another door's open chart" hold check compares A's pane, which is unchanged. `chart-usage.ts` locates and counts each seat entry by its session (`locate`, `claudeSession`, `codexSession`, `piSession`), not by pane, so two A sessions on one pane count separately (checked 2026-10-17).
- Spans: the outgoing span is closed before the handover. The fresh A opens the next chart's span on entry.
- Consultants: the fresh A runs the normal consultant restart at chart entry (`peer-restart.ts`, in place), and losses stay lost through the `handover` line's consultants list.
- Footer: old A's last footer reads `Next: none handover queued to a fresh A in <pane>`. Elsewhere it is unchanged.

Exclusions:
- No change to attended mode, consultant creation or restart, approvals, the handed list or the lifecycle commands.
- Kinds other than claude, codex and pi.
- Context-size triggers.
- Handover mid-chart or at pass end.

Stated limits:
- A one-off harness notice can swallow the start prompt. The probe hit codex's "Set up security for Daybreak mode". It is logged as stalled, and the operator sees the pane.
- A turn-end signal that never arrives within the bound leaves A untouched and logs it.
