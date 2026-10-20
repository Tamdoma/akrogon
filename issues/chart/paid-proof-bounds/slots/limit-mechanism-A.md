# limit-mechanism notes, slot A (written before reading B and C)

Pick: written grant rule, no counter. A paid model session (direct or launched by a runner) is a billing effect, so it needs a grant like any other billing effect; the grant's `bounds` is the total paid attempts for the leaf's whole life across seats and passes; reuse stops at the bound through the existing blocker path. Reason: the grant shape already exists (src/readiness.ts grantSchema has bounds and stop_line); media-range-live's Cloudflare grant with "at most one pass rerun" stopped. No code, and the 2026-10-10 lock ("any enforced budget ... foreclosed") stays intact. Cost: compliance is agent judgment; a disobedient seat can still loop.

Deletions: chart-issues Take "live-change" framing narrows grants to mutations; implement-issue Shared context and check-issue grant-reuse sentences say reuse "for ... reruns ... without asking again" and "before mutating" compare; those words go. Proof `limits` stays epistemic only.

Rejected: enforced counter in akrogon run-check. Misses nested `claude -p` sessions launched by framework runners and direct shell calls; adds state, concurrency and recovery; reopens the lock.
Rejected: per-session `claude -p --max-budget-usd` in framework runners. Per-session, not cumulative; framework-owned; billing scope (API vs plan) unclear in sources.

Evidence:
- better-than-training: src/readiness.ts grantSchema (bounds, stop_line free text, nothing consumes them), read 2026-10-18.
- better-than-training: Claude Code CLI reference, `--max-budget-usd`, print mode only, aborts at the cap (https://code.claude.com/docs/en/cli-reference via search 2026-10-18; linuxjedi.co.uk tester reports JSON error subtype on the cap).
- practitioner-ish (vendor blogs, weak): archestra.ai "How to put a budget on an agent", larridin.com retry cost control, tianpan.co retry budgets (2026-04-16): layered caps and a stop after repeated identical failure; dashboards react too late; a provider usage-limit error did not stop a Claude Code retry loop. Read 2026-10-18 via search summaries.

Pitfalls:
- A bound per pass resets forever: bound is per leaf lifetime, and a delayed relaunch after a spend reset counts as a new attempt.
- B's check.repair runs planned live proofs: the same grant bound covers B.
- Nested sessions: the grant names the runner and its transitive launches.

Question the fork does not ask: should the handoff review show the worst case across all permitted attempts (sessions x attempts) next to the existing one-run line?
