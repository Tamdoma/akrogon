# related-search, slot A

This round settles how filing finds earlier reports that may share a cause, and what it writes about them. It comes now because root-report and chart-grouping both act on these links.

Probes run 2026-10-05, gh 2.102.0, account ivanjuras (scopes repo, read:org), read-only, target Tamdoma/tamdoma-framework (private):
- P1 `gh issue list -R <repo> --state all --author @me --search "created:>=2026-10-05" --json number,title,createdAt` returned #124-#128, all five session issues.
- P2 `gh search issues --repo <repo> "mockup variant chosen early blocks phase close"` returned `[]` for lexical, hybrid and semantic modes. A sentence query finds nothing.
- P3 `gh search issues --repo <repo> mockup` returned #123, #124, #126, #127, #128 in lexical and hybrid. Semantic returned #123, #124, #127.
- P4 `gh issue list -R <repo> --state all --search "mockup variant"` returned #123-#128 plus older #84.
- `gh search issues --state` accepts only open or closed. `gh issue list --state all` covers both.
Limits: one repo, one day, one author. Does not prove recall on repos with hundreds of issues.

### 1 · Which earlier reports does filing look at?

Two kinds of related reports exist. Same-session ones share a cause but often no words (#125 "close on run history" vs #124 "abandoned variants"). Older ones in the repo may already describe the cause, open or closed.

Research: better-than-training · probes P1-P4 above · author+date finds the session set exactly; short keyword search finds older ones; sentence queries find nothing; semantic mode adds nothing here · the search is 2-3 component words, not a sentence. better-than-training · ITIL problem management (secondary summaries) · incidents link to one problem record · links, not merges.

- **1a (recommended)** Two read-only calls on the routed repo: P1 (your own issues since the session began) and one `gh issue list --state all --search "<2-3 component words>"`. The agent lists only matches it can explain, each with a one-line reason. Wins because P1 catches the no-shared-words case that caused #56, and P4 catches older reports including closed ones. Cost: two gh calls per filing.
- **1b** Session issues only (P1). Cost: misses an older report that already names the cause.
- **1c** 1a plus other repos named by the reporter. Cost: cross-repo titles can leak between private repos, and the target set has no bound.

Pitfalls avoided: a noisy list is removed by listing only matches with a stated reason. Private titles leaking is removed by searching only the repo the report goes to.

### 2 · What happens if the search fails?

Example: gh lacks the scope, or the API rate limit hits. The observation is still worth filing.

Research: better-than-training · `skills/seed-issue/SKILL.md:61` · creation failures are shown, never hidden · the same visibility applies to the search. model-knowledge · no practitioner source on enrichment-step failure in bug intake was found.

- **2a (recommended)** File anyway and write "Related search failed: <command and error>" in the report. Wins because the observation is not lost and the gap is visible to the door. Cost: this is a fallback, which your coding rules normally ban unless requested; it is visible, not silent.
- **2b** Stop and report the error, file nothing. Cost: a working observation is lost over a side step.

Pitfalls avoided: a hidden partial result is removed by the failure line naming the command and error.

### 3 · Where do the links go?

The section from cause-section has four lines. #125-#128 put "Related:" at the end of Expected behavior.

- **3a (recommended)** A fifth line in Suspected cause: "Related: #n (reason)", or "none found", or the failure line. Wins because a link is a claim about a shared cause, and it reaches the door in the body (`src/pull.ts:67`). Cost: one placeholder line.
- **3b** A separate `## Related` section. Cost: a seventh heading.

Pitfalls avoided: GitHub shows backlinks on the linked issues automatically for same-repo `#n` mentions, so no comment is written to earlier issues.

Reply `1a 2a 3a`, or a numbered free-text answer.

Challenge check
- P1 also returns issues from your other sessions the same day. The agent judges each by reason, so they are candidates, not links.
- P1 replaces remembering URLs, which fixes compaction losing them. It assumes the filing gh identity is the same across the session.
- 2a contradicts the no-fallback rule. The operator decides.
