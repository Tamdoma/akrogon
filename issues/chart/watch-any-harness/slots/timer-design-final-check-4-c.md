# Final-shape check 4: timer-design (slot C)

1. **Item 4 `[C4]` + Item 7 `[C4]` do not remove the draft-hold replacement-program race (B F2):**
   - Evidence: `hc send` holds up to `draft_wait` (default 60s, `hc --skill` § Talk, wait, and collect results) before pasting text + Enter. Step 7(b) runs inside the `watch-issues` skill *after* delivery. Lock `2a` (`forks/signposts.md` `## Taken`) forbids ticks reaching a terminal after another program replaced the agent, and S2a only exempted the bare shell left behind.
   - Consequence: A non-agent program (e.g., `vim`, `ssh`, `less`) or an agent without `watch-issues` started in that shell during the draft hold cannot run 7(b) and still receives raw input + Enter; even a replacement `watch-issues` agent still receives the tick and runs a turn before 7(b) stops the timer. Dropping the replacement-program caveat from Item 4 overstates what 7(b) guarantees.

2. **Item 5 `[C4]` creates an unbounded tight resend loop when a turn ends without setting `akrogon.watch-due=<n>`:**
   - Evidence: Item 5 resends due `n` "at the next readiness" whenever `turn` advances and returns to `idle`/`done` without `akrogon.watch-due=<n>` on the timer, with no retry cap or backoff (and `skills/watch-issues/SKILL.md` § Observe says a paused repo "acts on nothing", so receipt marking must explicitly run before the paused short-circuit).
   - Consequence: Any unreceipted turn returning to `idle`/`done` (context limit, API/rate-limit error, tool refusal, or a paused check skipping `hc label`) causes the timer to immediately resend due `n` forever, spamming the terminal and burning quota. Cap retries per due (e.g., one retry, then stop or advance) and require setting the receipt before the paused branch.
