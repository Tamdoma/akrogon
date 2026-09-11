# Baseline, before rewrite

Temporary repository: `/tmp/seed-issue-ho8tsjat/baseline`.

Actual setup: `git init -q`, `git remote add origin https://github.com/consumer/app.git`, root `akrogon.yaml` containing `issues_repo: upstream/intake`.

Followed the legacy normal-intake output contract: absent `issues/config.yaml`, wrote `issues/settings-save.md` with its five required sections. The uninitialized repository skips its overlap step. No gh invocation occurred. Root routing was ignored and no GitHub issue URL was produced. This fails C2 and C4, although it satisfies the old local-file contract.

Observed written report:
```markdown
# Settings save does not persist

## Observed Behavior
Saving settings reports success, but reopening the page shows the old value.

## Expected Behavior
Saved settings persist.

## Where It Happened
Settings page.

## Reproduction Context
Save settings and reopen the page.

## Urgency
Not provided.
```
