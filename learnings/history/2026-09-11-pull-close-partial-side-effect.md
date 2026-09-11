# Partial side effects in external command retries

Case: pull-close review B, 2026-09-11, reviewed head e58c2445cb38c74a5d5abe253dae555b5754035c.

The close retry checked whether the GitHub issue was CLOSED before retrying `gh issue close --comment`. GitHub CLI 2.100.0 posts the comment before closing the issue in [close.go](https://github.com/cli/cli/blob/v2.100.0/pkg/cmd/issue/close/close.go#L137-L154). A successful comment followed by a failed close leaves the state OPEN, so the retry posts the same comment twice.

Evidence: issues/open/akrogon-loop/github/pull-close/review-B.md F1 and review-B-evidence.txt. A real temp-repo CLI transition with a stateful fake gh exited 0 and recorded two identical comments. No production API was used.

Learning: an external command can contain multiple mutations. Check which individual side effects can succeed before failure when designing retries. Testing only total success, total failure, and lost final responses misses partial success inside the command.

Applied 2026-09-11 in pull-close repair: before retrying an OPEN issue, inspect complete comment history and avoid reposting an existing merged-commit comment.
