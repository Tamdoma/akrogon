# Review A: seed-issue

Base: f281241901d0f1c8a2bfd5943be838fb14f5eb9c
Reviewed head: 507aff5d2e9c1b14631a641854308590b557d745
Diff: skills/seed-issue/SKILL.md only, 35 insertions, 134 deletions. Worktree clean.
Debate: no, so no positions or rebuttal artifacts exist, as expected.

## Verdict: ready

## Verification evidence

- Configured checks rerun by A in the worktree on 2026-09-11: `bun run format` exit 0 (unchanged), `bun test` 34 pass / 0 fail / 364 assertions, `bun run typecheck` exit 0. Matches the implementation report.
- Skill caps: 68 lines, 496 words, 3,539 bytes, 12 directive sentences plus one dependency sentence. Under 300 lines, 4k tokens and 20 rule sentences (C1).
- Removed names grep for FIXER, consult-issue, consolidate-issues, create-issue, sync-payload, .scripts, `akrogon phase`, `akrogon next`: no matches (C3, C4).
- Routing (C2, D2): skill lines 14–22 require root `akrogon.yaml` read from the repo root on every harness with no harness-folder read, reject the plan's full invalid-value list without origin fallback, use origin only when the file is absent, accept the three GitHub remote forms, strip `.git`, and reject missing origin, local paths, non-GitHub and lookalike hosts and malformed paths without consulting other remotes or asking. Evidence: V1, V2, V3-https/scp/ssh, V4 (nine cases), V5 (six cases), V6 in `verification/`, each with recorded result and, for positive cases, `calls.jsonl` argv/stdin from the substituted gh.
- Report shape (C3, D3): title plus Observation, Location, Reproduction, Expected behavior, Urgency; `Unverified intake.` marker; `Not provided` for missing details; no diagnosis or planning metadata. V7 calls.jsonl shows a thin report with all five sections and literal `$(touch ...)`, backtick and `$HOME` text preserved. V7 command.sh single-quotes the title and uses a quoted heredoc; replay-result confirms no marker file was created.
- Submission (C4, D4): inline `gh issue create -R "$repo" --title "$title" --body-file -` with quoted heredoc, one creation per positive case (exactly one argv line per calls.jsonl), actual URL returned from substitute stdout, V8 shows exit 1 / HTTP 401 surfaced with one invocation, no retry, no invented URL, footer `Next: none submission failed`.
- C5: all 23 fixtures preserved under the authoritative leaf with `inputs.json`, `boundary-source.txt`, per-case `command.sh`/`calls.jsonl`/`result.txt` and a runnable boundary replay. No real GitHub call, the substitute only appends to calls.jsonl and prints a fixture URL.
- Design compliance: routing file is root `akrogon.yaml` with key `issues_repo` (Operator 2026-09-10), fallback to origin only, visible failure otherwise, no asking where to post (forecloses list). Standalone exceptions from the leaf architecture honored: no `akrogon phase` at the end, footer present, compaction line adapted to the reporter's context.
- Report gap check: report and brief section 8 record checks, evidence path and limitations. No material gap.

## Findings

No Fix findings.

Nits: none. The stated limitations (semantic agent-followed routing, no live gh, unreadable-file and missing-root cases reviewed in text only) are inherent to prose-skill verification within the plan's declared method and do not open repair.

## Merge (slot A, 2026-09-11)

Fetched origin. origin/main is f281241 and already an ancestor of HEAD 507aff5, so the rebase was a no-op and AKROGON_BASE stays f281241. Neither code nor integration changed since A's check run at this head (format exit 0, 34 tests pass, typecheck exit 0), so that run is reused. No advisory commands configured. Pushed HEAD to origin/main fast-forward only.
