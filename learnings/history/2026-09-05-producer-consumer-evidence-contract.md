# Evidence was written in a format its consumer could not use

What failed: a live worker wrote progress messages, but those lines carried no timestamps. The
liveness reader ignored them because it uses each line's embedded time, never the file's modification
time. The worker appeared to follow its instructions while producing no usable heartbeat evidence.

Root cause: the prompt required a progress line but omitted the timestamp that the reader required.
Producer instructions and consumer validation described different contracts.

Fix: `4fefdf90` requires every heartbeat line to start with the current ISO8601 timestamp. A corrected
live worker subsequently wrote a timestamped heartbeat. Receipt and heartbeat parsing remain strict.

Second instance, same day: the implement-chunk packet instructed workers to write a blocking
question to `<slug>-<chunk>-<attempt>.md`, while the reader derived
`<slug>-implement-chunk-<chunk>-<attempt>.md` through its canonical path helper. The prompt built
the path manually instead of calling that helper. The worker obeyed the prompt exactly, so the
reconciler saw no question and would have charged a silent-liveness failure instead of routing the
advice consultant. `639d8c64` makes the packet call the canonical helper and adds a regression that
commits a question at the packet's literal path and reads it back through the real reader.

Third instance, same day: chunk verification bullets. No prompt prescribed the `In <dir>:` prefix
format to planners; it existed only as a parser comment. A worker wrote the directory backticked, as
markdown naturally invites, and the parser captured the backticks into the cwd. Every command then
spawned in a nonexistent directory, and the spawn failure (ENOENT, no exit status) rendered as
"exited signal" — a launch error disguised as a command failure, which pointed diagnosis at the
commands instead of the runner. `0f4b270b` makes the parser accept bare and backticked directories
and adds regressions from the real captured line; `788eb904` reports launch failures distinctly,
naming the command, resolved cwd, and error.

Fourth instance, same day: the verification fingerprint reader ran `git ls-tree -r --full-tree` and
treated any nonzero result as a missing object. On the framework repo the 2.4MB listing exceeded the
subprocess's 1MB default buffer, git died on SIGTERM with error ENOBUFS, and the reader reported the
artifact's legitimate revision as "unknown revision" — a reader fault disguised as bad evidence,
which pointed diagnosis at the artifact and blocked the item for hours. `c42739ad` lists only
top-level tree entries (each tree hash commits all descendant content, so the comparison is
equivalent and the output is bounded regardless of repo size — not a raised buffer, which would only
move the cliff), throws with full context on subprocess errors and non-missing git failures, and
returns undefined only for a genuinely missing object. A regression builds a >1MB tree via mktree.

Fifth instance, same day: the framework repair proof. The repairStatus reader requires each checkbox
row's third token to be one exact 40-hex SHA and requires a row for every accepted finding, including
accepted CHECKED findings whose verdict demands no code change. Neither rule was stated to the repair
worker. The worker wrote comma-joined SHAs in one token and omitted rows for seven accepted CHECKED
findings, so the engine rejected a finished repair's proof, idled the seat, and charged "no heartbeat
for 3601s" to workers that had finished at 14:28:56Z and 15:30:56Z — attempt 007 records a
silent-liveness failure for a worker that was not silent. `29693ce8` repaired the artifact to the
exact format (one canonical SHA per token, explicit no-code-change rows citing the committed
verdict); the false failure records stay untouched as evidence.

Sixth instance, same day: observation executed mutations. A chunk's Verification bullet was a live
end-to-end test that published to the production Discord webhooks with real credentials. The chunk
gate reruns every verification bullet on any cold proof evaluation (its result cache is per-process
memory), and the read-only `why` command evaluated proofs through the same executor, so each lane
restart and each status query re-published the same announcement. Fixes: a typed verification policy
(read-only inspection never executes commands and reports a distinct unverified verdict, a9c9e0e2),
first-failure short-circuit as secondary containment — it bounds cost, it is not delivery
deduplication — and the E2E rebuilt to deliver to a local capture sender inside its isolated
worktree (b4b5ff43), with the packet prose repaired to mandate no network sends (cf91ef40).
Repeatable verification must isolate publication: any command the machinery may rerun must be free
of external side effects.

Seventh instance, same day: the packet repair for the sixth instance missed its own acceptance
gate. The prose edit that added the no-network mandate grew the packet's author half to 4139 bytes,
past the 4096-byte plan budget the engine enforces, so the corrected packet would have regressed the
item to plan-synthesis and risked replanning away the accepted implementation. The peer's read-only
inspection caught it before activation; the wording was shortened and committed at 4090 bytes
(cf91ef40) with the budget check run on the committed tree. An edit to an artifact must be checked
against every gate its consumer applies before it lands, including gates the edit was not aimed at.

Eighth instance, same day: the broadcast judge-report template. A judge wrote a substantive
8-finding report and the proof rule rejected it twice over: the anchored Verdict regex refused a
trailing explanation after `FINDINGS (8)`, and the defect blocks carried the two semantic halves as
separate `- Smallest safe fix:` / `- Acceptance check:` labels where the rule knew only the combined
`- Fix and acceptance:`. Report commits are append-only and the section reader takes the first
matching heading, so the seat could not self-repair: one off-template report permanently rejected
the lane, which sat idle with fresh heartbeats. `ad483a67` accepts a suffix after the findings
count and accepts the split pair when both fields are non-empty on their own lines (horizontal
whitespace only, so a blank field cannot consume the next line), with regressions built from the
rejected report's literal Verdict line and finding block.

Ninth instance, same day: the framework verdict parser. readVerdict treated every nonblank line
under `## Verdict` as a table row, so a valid nine-row verdict followed by a four-line narrative
parsed as malformed rows and stalled the lane. Repair `6b21697a` inserts a `## Repair routing`
heading before the narrative so the section boundary matches what the parser assumes; tolerant
parsing that skips non-row lines was deferred to a consulted decision rather than silently dropping
malformed rows.

Tenth instance, same day: the spend/v1 completion format. The in-flight spend-cost-recording item
teaches producers to write spend/v1 mappings that main's completion gate could not yet parse, so
every completion written to the new contract would fail the gate until the item merged. `d32a18b3`
lands the item's canonical parser verbatim on main as `spend-schema.ts` (the parse-only dependency
closure of parseSpendField, zero body differences verified independently by both agents) ahead of
the merge; the item resolves the temporary duplication by importing and re-exporting that module at
its next rebase, so one definition validates on both sides.

Lesson: review evidence generation and consumption together. Every required field and its meaning
must be explicit to the producer. Include a real generated sample in verification, not only samples
constructed by the test author. Prefer one shared protocol definition over divergent instructions
spread across workflow stages: a path or format a prompt names must come from the same function its
consumer calls, never from a hand-built copy. When a consumer runs producer-supplied commands, a
failure to start must be reported distinctly from a failure of the command itself, or the error
points diagnosis at the wrong party. The same rule applies to a reader's own subprocess faults: a
read that fails for capacity or launch reasons must never be reported as the evidence being absent
or invalid, and where output scales with repo size, prefer a representation with a bounded size over
a larger limit. When a consumer rejects a proof, the diagnosis must say the proof was present but
unacceptable and name the failing rule; charging the producer with silence when its work exists in
the artifact points repair at liveness instead of at the format contract. A format validator must be
tested against real accepted artifacts, not only author-constructed samples, and must tolerate
semantically equivalent shapes it will plausibly receive; where an artifact is append-only and its
reader takes the first match, a rejection is unrecoverable by the producer, so the validator's
strictness is a permanent lane-death risk, not a style preference. When a format contract changes
ahead of its consumer, land the consumer's shared definition first. The shared-protocol process
improvement still needs issue-workflow enforcement.
