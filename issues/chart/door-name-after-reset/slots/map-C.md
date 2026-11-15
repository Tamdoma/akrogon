# Opening map, slot C

Read: INTAKE.md, signposts.md (Taken, Needs), door-reset.ts, src/hc.ts, src/transcript.ts, tests/door-reset.test.ts, tests/door-agent.ts, handover.md. Grepped only: tests/hc-fixture.ts. Skipped: SKILL.md Handover, other slots' files. Inspected live, read-only: t126 and t3k with `hc get`, `~/.claude/sessions/*.json`, A's transcript, codex binary strings, `~/.codex/session_index.jsonl`, pi 1.5.2 docs, `hc keys --help`. No keys typed, no sessions started.

## Forks

M1. Where the helper reads the session's own name.
- O1. The last `custom-title` record in `pre`, through the `transcriptRecords(pre, 0)` the helper already imports. Pick.
- O2. Claude's per-process record `~/.claude/sessions/<pid>.json`. It holds `name` and `nameSource`. Seen: t126 (pid 390129) `name: c-akrogon, nameSource: user`. t3k (pid 159509) `name: framework-15, nameSource: derived`. Across 13 live records: 7 `user`, 6 `derived`.
- O3. The hc `title`. Ruled out: t3k's title is the auto title `Chart-issues skills-typecheck handover`.
- Evidence for O1: A's transcript holds 15 `custom-title` records, all `c-akrogon`, line 1 included. t3k's chain holds none (F4). O1 needs no new export. O2 needs the pid and config folder that `claudeTranscript` keeps private in src/transcript.ts.
- Take the last record, not the first. Claude writes one per turn, and an operator `/rename` mid-session appends a newer one.
- O2 is a second signal that agrees with O1 on both doors. Use it only if a probe shows a named session with no `custom-title` record.

M2. Where the helper reads the tab name.
- O1. The terminal's `herdr.tab` label, then `docGet(session)` and the tab with that id. Pick. Both exist: `Seen.labels` and `docGet` in src/hc.ts return `tabs: {id, name}`. t126 carries `herdr.tab: tbfce21c…`, t3k `tbe4ff0f…`.
- O2. Split the `where` label (`akrogon / c-akrogon`) on ` / `. It is display text, and a space or tab name containing ` / ` splits wrong.
- Failure cases for O1: no `herdr.tab` label (door outside herdr-app), or the id is not in the document. Both end in the logged skip.

M3. Order of steps.
- O1. Before the reset, and only when M1 finds no own name: after `input-check`, type `/rename <tab name>` into the old idle session, then `/clear` as today. Pick.
- O2. After `/clear`, before the start prompt.
- O3. After the start prompt, or both sides.
- Evidence for O1: F3 shows an unnamed session renamed by keys keeps the name across `/clear`. F2 shows a named session needs nothing typed, so the common case adds zero keys.
- Against O2 and O3: the `/clear` to start-prompt stretch is the timing-sensitive part. tests/door-agent.ts records that on t3k the clear turn ended 2 ms after the next input went in. A rename there lands inside claude's clear turn and changes what `send` reports as `started`.
- What O1 could break later: codex and pi names live per thread or session file (M6), so a future extension to them must rename after `/new`. O1 does not generalize. Accepted under signpost 4a.

M4. Does the helper check that the name landed?
- O1. No. Log what it typed and move on, like every other stage. Pick. handover.md already says the helper confirms nothing.
- O2. Re-read `pre` for the new record before `/clear`. It adds a wait on claude's write timing, which is a flake source.

M5. The log line.
- O1. One new stage `name` between `input-check` and `reset-keys`, always logged, with result `kept` (own name found), `sent` (tab name typed, plus `name`), or `skipped` (plus `reason`). Pick. The log then always says what happened to the name.
- O2. Log only when keys were typed.
- Cost of O1: `STAGES` in tests/door-reset.test.ts is compared with `toEqual`, so every stage-order test gains the entry.

M6. Codex and pi (out of scope by 4a, recorded for the limit text).
- codex 0.169.0: thread names exist. `~/.codex/session_index.jsonl` rows carry `thread_name` (auto names, such as `Read signposts brief B`). The binary holds `Rename thread`, `Name thread`, `Type a name and press Enter`, and `codex resume <thread name>`. So a rename exists as a prompt in the TUI. Not observed: whether it takes the name inline, and whether `/new` carries it. A name tied to a thread id suggests `/new` drops it.
- pi 1.5.2: docs name `/name`, `--name`/`-n`, and a transcript record `{"type":"session_info","name":…}`. Two real transcripts hold that record. Not observed: behavior across `/new`. The record sits in the session file, and `/new` writes a new file, so expect a drop.
- Both need a paid probe to settle. Neither blocks this chart.

## Questions a practitioner would ask

- Q1. Does `/rename <name>` on claude run a turn (status working, hc turn count moves)? If yes, the helper must wait for idle before `/clear`. One paid probe answers it.
- Q2. How does `hc keys` take characters that are not plain letters? Its help lists key names (`enter`, `tab`, `a`). The current code splits `clear` into letters. A tab name with a space, or a multi-letter chunk equal to a key name, needs a checked spelling. `c-akrogon` and `c-framework` need only letters and `-`.
- Q3. Always pass the name with `/rename`. A bare `/rename` may ask the model for a name, which is a paid call.
- Q4. Which errors become the logged skip? Today any thrown `HcError` ends the helper before `/clear`. The name step needs its own catch of `HcError` and of the missing-tab cases, and nothing wider.

## How the stand-in test proves it

- tests/door-agent.ts, claude kind: handle a `/rename <name>` line by appending a `custom-title` record to the current transcript with no turn, and copy the last title to line 1 of the new transcript on `/clear`.
- tests/hc-fixture.ts already writes a herdr-app document (`doc.set`) and places labelled terminals by `herdr.tab`, so a tab name can exist in the test core.
- T1. Named claude A (the test appends a `custom-title` record to `pre`, as the superseded test appends its record): inputs stay `[first, /clear, start]`, log shows `name kept`.
- T2. Unnamed claude A in a named tab: inputs are `[first, /rename <tab>, /clear, start]`, nothing received while busy, log shows `name sent`.
- T3. Unnamed claude A with no tab: log shows `name skipped`, the other stages run, the start prompt arrives.
- T4. Codex, pi, agy: `name skipped`, no rename input.
- Limit: the stand-in proves the helper's keys and order. Claude's own behavior is proven only by A's paid probe. That probe needs a throwaway terminal with a `herdr.tab` label pointing at a real tab.

## Pitfalls over the work's lifetime

- P1. Once the helper types the tab name, it is a `custom-title` like any operator name. A later tab rename is not followed. This matches "session name wins".
- P2. A claude update could stop carrying the title across `/clear` (seen on 2.1.323 and 2.1.325). With M3 O1 a named door would then lose its name at one handover and get the tab name at the next. The `name` log line shows `kept` then `sent`, which makes the change visible.
- P3. A door in a tab with a generic name gets that generic name. Harmless.
- P4. `seats.yaml` `name: null` is the hc terminal name, a different field. Leave it.
- P5. Text to update with the code: the header comment of door-reset.ts, handover.md (the stage list and the supported-harness limit), and SKILL.md Handover if it lists stages.
