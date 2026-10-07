# Leaf review C, chart-door-cost handoff, 2026-10-06

Read as the implementer: ISSUE.md, both briefs, designs, readiness and state files, shapes.md (Leaf files, Preflight and validation), standing-design.md test lines, the fork files, SKILL.md:37/:49/:67, questions.md:27/:44-50, docs/guide/chart.md:162 and :201, tests/ (peer-wait.test.ts, chart-shapes.test.ts, docs-links.test.ts), and one record of my own transcript for field names. Disagreements only, with replacement text. Both held points settled at the end.

## peer-notes-single-writing

F1. brief.md:14, criterion 5, and design.md:80. The held point is left open inside the criterion ("holds what the peer is to receive plus the exact return path") while questions.md:46 still says "Every peer prompt gives the exact output path". An implementer cannot satisfy both without choosing. Settled below as the brief alone. Replacement, appended to criterion 5: "The sentence 'Every peer prompt gives the exact output path' becomes 'Every peer brief gives the exact return path; the prompt names only the brief's absolute path and the slot letter.'"

F2. brief.md:14, criterion 5, misses design.md:14 decision 5 ("peer briefs point at questions.md and do not restate the parts"). Without it the note shape is copied into every brief, which is how this chart's briefs did it, and the copies drift from questions.md. Replacement, appended to criterion 5: "A brief names the note shape by pointing at the Blind peer exchange paragraph of questions.md and does not restate its parts."

F3. brief.md:13, criterion 4, "money and time in dollars and minutes where they are the point". The sibling leaf forbids any price or rate in the skill text (chart-usage-table criterion 4) and its table shows tokens only. A round can state dollars only where the door has a figure, which after this handoff it will not have. Replacement: "money and time in minutes, and in dollars only where a recorded figure exists, never from a rate the door assumes".

No other disagreement on this leaf. Criterion 7's line references (docs/guide/chart.md:162 and :201) exist; criterion 9's proof is tests/docs-links.test.ts and tests/chart-shapes.test.ts, both present.

## chart-usage-table

F4. brief.md:12, criterion 3, "the seat's first turn (the map turn) on its own row". A's session can predate the chart (design.md:22 opens the window at the operator's message, not at session start), and a peer pane reused from an earlier chart has an earlier first turn. Replacement: "the first turn of each seat that starts inside the window, labelled first turn".

F5. brief.md:12, criterion 3, and design.md:60. A Claude "turn" is not defined, and the operator-turn row depends on it. Transcript facts (inspected 2026-10-06): a user record that is not a tool result starts a turn; `isSidechain` marks subagent records; `effort` is a top-level field of each assistant record, not inside `message`. Replacement for design.md:60: "A Claude turn runs from a user record that is not a tool result to the last assistant record before the next such user record; a codex turn runs from `task_started` to `task_complete`. Working minutes are the sum of those spans. Records with `isSidechain: true` and files other than `<session>.jsonl` are excluded and USAGE.md states that subagent usage is not counted." The reference figures were taken from main files only (design.md:22), so this keeps criterion 10 honest; counting subagents is a later change.

F6. brief.md:11, criterion 2, and design.md:58, "finds each seat's transcript by session id under that harness's own home directory" and "`<claude home>/projects/<project>/<session>.jsonl`". `<project>` is derived from the seat's cwd by the harness, and a peer's cwd can differ from the registered root. The id is unique, so no derivation is needed. Replacement for design.md:58, second sentence: "The script locates `<session>.jsonl` by searching `<claude home>/projects/*/` and `<codex home>/sessions/*/*/*/rollout-*-<session>.jsonl`, and fails with the id when it finds none or more than one."

F7. brief.md:12, criterion 3, "each model and effort value found in the transcript". The field path differs per harness and is not written anywhere in the leaf. Replacement, appended to design.md:59: "Claude: `message.model` and the record's top-level `effort`. Codex: `turn_context.payload.model` and `turn_context.payload.effort`."

F8. brief.md:15, criterion 6, "the script exits non-zero" while criterion 2 says it prints the sibling summaries and SKILL.md says the door continues. peer-wait.ts prints an outcome word and exits 0 on a reported condition; a non-zero exit from `bun` in the door's foreground reads as a failed tool call and invites a retry. Replacement: "the script prints that row, writes USAGE.md with it, prints `outcome partial` as its last line and exits 0; it exits non-zero only when seats.yaml does not parse or the chart folder is missing."

F9. brief.md:17, criterion 8, settled below (restatement count). Replacement: "the door adds one to `restatements` in `seats.yaml` for each restatement request it answered in that round, at the moment it records the fork's answer, and the fork's Taken keeps the sentence it already writes today ('The round was restated once ...'). Restatement requests on rounds that record no fork answer (map, handoff review) are not counted and USAGE.md says so."

No other disagreement on this leaf. Criterion 5's method (largest `output_tokens` per `message.id`, other classes from the last record) matches what I measured today; criterion 7's marker test is the right proof for the privacy line.

## Held points, settled

H1 (peer-packet 6, return path). The brief alone carries it. Reason: every prompt on this chart was one line under 200 characters and started both peers at once; repeating the path puts the same fact in two files, and peer-packet rejected two copies for exactly that (O3). The rule's purpose, a peer never guessing where to write, is met because the brief is finished before the prompt (decision 1). Text in F1.

H2 (proof-of-saving 8, restatement count). The door's counter at answer time, not operator words in seats.yaml. I argued for the words in my rebuttal; two facts in the drafts turn it. Criterion 1 says the door asks the operator nothing new, and the words would have to come from the operator or from parsing a private file. And every fork Taken on this chart already carries "The round was restated once on the operator's elid request before the answer", written when the answer is recorded, so the counter is that sentence turned into a number at the same moment, with nothing to remember at handoff. Its cost is the uncounted restatement on a non-fork round, stated in F9.
