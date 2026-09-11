# Repeat Safety

Chart skill version: 4

Status: resolved
Type: grilling

## Question

Which actions are safe to run twice, and what visible fact stops the others? Cases: a prompt accepted while the sender lost its connection, a merge that landed before the phase moved, a retry of the same skill after an unchanged phase, a skill re-entered mid-pass after compaction.  With # Next Command Owner settled, the hook and the finishing skill can both call `akrogon next` for the same step, so the command itself must be safe to run twice.

Reshape 2026-09-08 after # Debate Count, # Turn Within Phase, # Driver State: `akrogon phase` is compare-and-set on the current phase and `akrogon next` reads phase, done and attempts, so both are idempotent by design. New case: two concurrent slots finish the same phase in the same second, both calling `akrogon phase` with the same target; the done-list update must be atomic too.

From # Peer Questions 2026-09-08: a peer finishing a side answer fires the same pane event as a pass ending. `akrogon next` must act only when the idle pane is the current phase's slot, otherwise no-op.
Operator accepted 2026-09-08: this is the rule.

From # Parallel Merge 2026-09-08: if the push to origin main succeeded but the phase write to `merged` failed, the next `akrogon next` on that leaf must see the leaf head as an ancestor of `origin/main` and set `merged` instead of merging again. Also: a lost network reply is not a failed push; check before retrying.

From # Distribution 2026-09-08, operator-accepted: herdr restart recovery is the plugin's `[[startup]]` hook running `akrogon next --all`; the event never moves a phase, an idle without a phase move is a retry of the same pass with attempts plus one, a blocked pane is left for the operator, the attempts cap stops re-prompting.

Operator explanation 2026-09-08 (chat, recorded for handoff): what happens when a pass stops without moving the phase. The event fires when the pane goes idle. `akrogon next --pane` reads the phase file: if the phase is unchanged, the pass did not finish, so it writes attempts plus one and re-prompts the same slot with the same pass. Two failures of the same pass by the same slot, then the hook prompts the other slot once with one line to look, unblock or take the pass; if that fails too the leaf is `failed`. A `blocked` or `unknown` pane is never re-prompted by the command; it goes to the peer the same way, since only an agent can answer a dialog. (Corrected 2026-09-09 to match # Next Command Owner; the earlier wording, three attempts then stuck for the operator, is withdrawn.) Herdr down means every agent is down with it; after restart the plugin startup hook runs `akrogon next --all`, which restarts missing agents per unfinished leaf and prompts the slot whose turn it is. Attempts reset when the phase moves.

From # Distribution 2026-09-08: `akrogon install` and `akrogon init` are idempotent and print what they did and skipped; rerunning either after a partial failure is the repair.

## Findings

Slot A (Claude, blind): safe by design list (CAS, ancestry check); flock on a sibling lock file around read-modify-write and the whole `next` pass; stalled prompt gets one inline resend then peer wake-up; `--all` is pane-guarded. Slot B (Codex, blind): flock, Featonby AWS 2021-01-15 tier 1 (duplicate check and mutation as one atomic step), flock and rename man pages tier 2; invocation id per pass visit (Joshi, Idempotent Receiver and Generation Clock, 2023-11-23, tier 1); herdr 0.9.0 prompt help and API schema have no idempotency key, stall detection exists only with `--wait` (tier 2, 2026-09-09); resume-not-redo on re-prompt (git-status docs tier 2); broadcast retry tolerates a duplicate; log diagnostic, state authoritative; both slots found the retry contradiction with # Next Command Owner (corrected in this file and in # Distribution before the batch).

Merged 2026-09-09 into six questions with tags. Rebuttal, slot B: Q1 a bumped attempt count does not prove a prompt was accepted; Q2 counters can recur; Q3 stall detection needs `--wait` (accepted into the wording); Q4 rerun checks only on changed code, missing evidence or a concern (accepted).

Operator answers 2026-09-09: 1, asked for something more elegant than a lock ("Do we really have to add another point of failure?"). Slot A offered sequential passes plus hook-only calling, which removes the race class at a cost of twenty to thirty minutes per debated leaf. Operator: 1-B, "Speed is very important to me", lock file accepted after honest sizing (about eight lines, kernel `flock` via the system binary, one `.lock` per leaf folder, released on process death, one bounded failure mode). 2-A. 3-A. 4-A. 5, operator rule: one broadcast per issue, never per leaf; an issue broadcasts after its last leaf merges; an epic broadcasts once per issue it contains; 5-A: one immediate retry, no success record, a crash in the window loses the message. 6-A. Challenge confirmed.

Operator explanation recorded for handoff. Lock: `akrogon next` and `akrogon phase` run every read-modify-write of state, and the whole `next` pass for a leaf (read state, check the pane is idle, prompt, write attempts), under `flock` on `<leaf>/.lock`, spawned as the system binary so the kernel releases it when the process dies; agent work and git stay outside the lock. Single caller: skills end with `akrogon phase` and stop; the herdr hook is the only caller of `next`; `next --pane` maps the pane to its leaf, reads whose turn it is, and prompts that pane if idle, otherwise exits; a `working` event never bumps attempts; an idle event with the phase unchanged for the pane that was prompted is an attempt. Stall: `next` prompts with `--wait --until working` and a timeout of a few seconds; `agent_prompt_stalled` gets one resend, then the peer wake-up from # Next Command Owner. Broadcast: `akrogon phase <slug> merged` reports when every leaf of the leaf's issue is merged (the issue is the leaf's parent folder, see # Multi Chart Layout); the merge skill then spawns the cheap writer once with the issue's briefs for one message; one immediate retry on a failed send; nothing recorded.

## Resolution

Safe twice by construction: `akrogon phase` is compare-and-set on phase, fix round and attempts, so a repeated or late move is refused; a merge that landed without the phase written is detected by ancestry and set to `merged`. Concurrency is serialized by a kernel `flock` on `<leaf>/.lock` around every state read-modify-write and around the whole `next` pass for that leaf; skills never call `next`, the herdr hook is the only caller. A stalled prompt is resent once, then handed to the peer; a re-prompted pass inspects the worktree and finishes what remains, rerunning checks only on changed code, missing evidence or a concern. Broadcast is one message per issue, sent by the merge skill when the command reports the issue's last leaf merged, one immediate retry, no success record. State is authoritative and the log is diagnostic; state is written first, a log failure never reruns a move. Retry policy is # Next Command Owner's: same slot twice, peer once, then failed; blocked or unknown panes go to the peer. Why: compare-and-set and one kernel lock cover every duplicate without a process, a timer or a second store, and the operator ranks speed above the sequential alternative. Forecloses: invocation ids, a herdr idempotency feature, per-leaf broadcasts, the term "category" (retired), recoverable logging, any operator wait.

Operator confirmation 2026-09-09: "When we say issue series ... consists of more issues that are sub issues, they are the categories ... broadcasting happens when the entire issue is done, which in the simple issue is just one issue, one category, and with the series it's as many broadcasts as there are issues that are part of it." Confirmed by slot A: series folder, one folder per sub-issue (the category), leaves inside; one broadcast per sub-issue when its last leaf merges; a simple issue is one category.

Operator correction 2026-09-09: the category is the issue. A series is a group of issues; an issue has one or more leaves; the broadcast for an issue fires when its last leaf merges, so a series broadcasts once per issue, and a simple issue broadcasts once. "Category" in this file means "issue".

Operator, 2026-09-09, locked vocabulary: "the category doesn't even have to exist as a term ... It's either one issue or a series of issues if it's a complex thing that we are doing. And every issue has either one leaf or multiple leaves." Three terms only: series, issue, leaf (series renamed epic later the same day in # Multi Chart Layout). Every earlier "category" in the chart files was rewritten to "issue" the same day.

From # Multi Chart Layout 2026-09-09: the term "series" is retired for "epic". The merged transition holds `<issue>/.lock` around the state write, the completion check and the move to issues/closed; a failed move is retried by the next run.

From # GitHub Intake 2026-09-09: GitHub close runs inside the owner-close transition under the issue lock, checks the issue state before acting, one retry, so a repeated transition never double-comments.
