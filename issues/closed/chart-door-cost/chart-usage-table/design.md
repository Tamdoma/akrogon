# Design: chart-usage-table

## Binding decisions, verbatim

### proof-of-saving (issues/chart/chart-cost/forks/proof-of-saving.md)
Operator answer 2026-10-06, verbatim: "1a | 2a |". The round was restated once on an elid request before the answer.

Q1 = 1a. Each chart records its own usage:
1. At open the door writes one line per seat into the chart: pane, harness kind and session id from `herdr agent list`, and the open time. It adds a line whenever a seat's session id changes.
2. When the chart ends, with any marker, the door runs one read-only script under skills/chart-issues/scripts/. It reads those transcripts between the chart's start and end and writes a usage table into the chart: operator wait minutes, usage per seat, the map turn on its own line, model and effort per seat as read from the transcripts, and the count of restatement requests.
3. The handoff review shows this chart's summary next to the summaries of earlier charts.
4. Rows split at operator messages are labelled operator turns and never forks (B).
5. The script prints ids, times and numbers, never message or tool text (B).
6. A transcript the script cannot read gives "usage unmeasured" with the file and field, and never blocks handoff (A).
7. Done-criterion: small fixtures with independently known totals (duplicate Claude blocks, cumulative codex counters, counter reset, missing session) match exactly, and the script reproduces this chart's hand figures (B,C).
8. Held for leaf review: how restatement requests are counted. The door notes each one in the fork file when it records that fork's answer (A), or restatement words recorded per chart at open and counted by the script (C).
9. Held as B's disagreement: no per-chart quality review beside the figures. The table claims nothing about quality and three charts are an observation, not proof of cause.

Q2 = 2a. Tokens by class and minutes only. No model name, price or rate in the script or skill. When a Claude session has ended, the table also shows the dollar total that session recorded, labelled as a whole-session figure. Stated limit: the table shows that usage changed, not that dollars fell (B).

### Reference figures (same file)
Hand totals for this chart, window 2026-10-06T16:34:47.701Z (the operator's opening message) to 2026-10-06T20:16:00Z, main transcript files only.
- A, claude session 1ce71920-4c64-414b-ac1c-af56890a1c4b: 151 assistant messages, output 268,671, input 324, cache read 19,653,997, cache write 635,593.
- C, claude session 14a11404-8a8d-482e-b5ca-0fdb6ae0f864: 116 assistant messages, output 111,968, input 250, cache read 14,434,644, cache write 336,356.
- B, codex session 01a10f8a-d864-7f20-b425-d2fc02d57295 (first record 16:35:54Z): 19 turns, input 12,716,484, cached input 12,255,616, output 49,427, reasoning output 9,681.
- Method. Claude: assistant records grouped by `message.id`, output is the largest `output_tokens` in the group, the other classes are the group's last values, summed over groups. Codex: `total_token_usage` of the last `token_count` event in the window minus that of the last one before the window, turns counted by `task_started`.

### Locks from other forks
- cut-boundary, operator 2026-10-06, verbatim: "2a - But don't hard code it anywhere, this is what I will do internally moving forward."
- peer-effort, operator 2026-10-06, verbatim: "1 - okay, But we are not hard coding into the Acrogon system any models, so I will just remember to do it when I tell you what slot B should be, okay? | 2a"
- peer-packet (forks/peer-packet.md): peers keep one session per chart, so a peer's session normally belongs to one chart.

### Exclusions
- cut-boundary, round-writing, peer-packet Q1 and handoff-script: owned by the leaf peer-notes-single-writing.
- map-size: no change to the map rule.
- No per-fork rows, no stage boundaries kept by hand, no quality grade, no dollar estimate, no cost tracking in akrogon core (`src/`), no dashboard or background watcher.
- Characters of leaf files written before and after peer review are not measured by the script. The handoff's operator turns show the door's output there.

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: the script is tested at its real boundary, the command line, the way `tests/peer-wait.test.ts` runs peer-wait.ts, against fixture transcripts in temporary harness homes. Fixtures keep the real record structure and field names of both harnesses, captured from real transcripts with every message and tool body replaced, and state the harness versions and capture date. Edge inputs (repeated message id, counter reset, missing field, record outside the window) are written by hand, which the rules allow for negative and edge inputs. Each done-criterion gets the cheapest test that catches its failure: fixtures for 2 to 7, reading for the skill and guide text in 1, 8 and 9, and one live run for 10, which proves what no fixture can: that the script's totals on real transcripts equal an independent hand count. New behavior shows one deliberate break turning its test red. No secret is read, no auth is involved and no outside service is called. Leaf work is agent-owned.

## Leaf architecture
- Owned surfaces: `skills/chart-issues/scripts/chart-usage.ts` (new), its test and fixtures under `tests/`, `skills/chart-issues/SKILL.md` (Open and Handoff sentences named in the criteria), `skills/chart-issues/assets/shapes.md` (chart records tree), `docs/guide/chart.md` and `docs/guide/files.md` where they list chart files.
- `seats.yaml`, written by the door and read by the script, is the one strictly formatted record:

```yaml
opened: '2026-10-06T16:34:47Z'
restatements: 0
seats:
  - seat: A
    pane: w8:pCT
    harness: claude
    session: 1ce71920-4c64-414b-ac1c-af56890a1c4b
```

  A seat with a second session gets a second entry with the same seat letter. The script parses the file once with a schema and fails with the field name on a mismatch.
- Transcript location, inspected 2026-10-06: a Claude session is `<claude home>/projects/<project>/<session>.jsonl`, and a codex session is `<codex home>/sessions/<yyyy>/<mm>/<dd>/rollout-<time>-<session>.jsonl`. The project folder is derived by the harness from the seat's working directory, so the script searches `<claude home>/projects/*/` and `<codex home>/sessions/*/*/*/` for the id and reports the seat as unmeasured, naming the id, when it finds none or more than one (C). The homes default to `~/.claude` and `~/.codex`. The implementer checks which variable each harness itself uses to move its home and uses that for the tests, adding no variable of its own if one exists.
- Record fields, inspected 2026-10-06. Claude: assistant records carry `timestamp`, `message.id`, `message.model`, `message.usage` (`input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`) and a top-level `effort` value on the record (C); operator messages are `type: user` records; an ended session holds one `cost-state` record with `totalCostUSD`. Codex: `turn_context.payload.model` and `turn_context.payload.effort` carry model and effort (C), `task_started` and `task_complete` bound a turn, and `token_count.info.total_token_usage` is cumulative. Tool results are also `type: user` records in a Claude transcript, so an operator turn is a user record that is not a tool result.
- Counting method: tokens follow the method recorded with the reference figures. A Claude turn runs from a user record that is not a tool result and not harness-generated (compaction summaries and other injected context) to the last assistant record before the next such user record. A codex turn runs from `task_started` to `task_complete`, and a turn with no completion is labelled incomplete. Working minutes are the sum of those spans. By this definition operator turns in A's transcript cannot overlap, so the operator wait is their sum inside the window. Records with `isSidechain: true` and files other than `<session>.jsonl` are excluded, which matches how the reference figures were taken. The implementer confirms on a real transcript which fields mark harness-generated user records (B,C).
- `opened` is the time the door began its first pass on the chart. The reference run uses the operator's opening message time instead, which is a few seconds earlier and holds no assistant record in between.
- `USAGE.md` starts with one summary line (operator wait minutes, operator turns, restatements, output per seat) so that sibling summaries can be printed by reading first lines.
- Script contract: follows peer-wait.ts for argument checks and for reporting a condition as a printed outcome word with exit 0: `outcome done`, or `outcome partial` when a seat is unmeasured. Non-zero exit only for a `seats.yaml` that does not parse or a missing chart folder (C). It is a pure reader apart from writing `USAGE.md`.
- Live run for criterion 10: a temporary chart folder outside the repository with a `seats.yaml` naming the three sessions and `opened: '2026-10-06T16:34:47.701Z'`, run with `<until>` 2026-10-06T20:16:00Z.
- Settled in the peers' leaf review (A,B,C), slots/leaf-review-B.md R1 and slots/leaf-review-C.md H2: the door counts restatement requests by meaning when it records a fork's answer, one per request, and no word list or message matcher is added. C withdrew the word list because the door asks the operator nothing new at open. Stated limit, carried from C's F9: requests on rounds that record no fork answer (map, handoff review, a chart held before an answer) are not counted, and `USAGE.md` says so. Held disagreement (B): B wants each request recorded with its operator-message time in the fork file so those requests count too. Not built, because the door has no cheap way to read a message's time.
- Held disagreement (B): the table cannot show a lost decision or a weaker contract, and B wants a per-chart quality review shown beside the figures. Not built. The table claims nothing about quality, and three charts are an observation and not proof of cause.
- The sibling leaf peer-notes-single-writing also edits SKILL.md, in other sentences. Neither leaf waits on the other.
- Exclusions: `src/`, config, other skills and `issues/`.
