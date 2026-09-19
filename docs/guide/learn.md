# Learn

A review can reveal something useful beyond the current fix. Keep that knowledge separate from the leaf's required repairs.

**A fix** is needed for the leaf to meet its contract. For CSV export, losing a field containing a comma is a defect if correct CSV quoting is required.

**A nit** does not block merge. It stays in the review record. Whether a performance concern is a nit depends on the requirements and evidence, not just whether the brief names a row count.

**A lesson** records a reusable finding. The merge skill can turn a reusable nit into a short entry and a supporting history file:

```text
learnings/LESSONS.md
learnings/history/
```

For example, a lesson could record how a tested CSV library handled embedded newlines that an earlier implementation missed. Include the evidence so later agents can check whether it applies.

Plans read the lesson list. Lessons are observations to verify, not permanent rules. Charting can propose removing stale entries.

**A seed** records work to investigate later. If large exports need streaming, file that as a separate observation rather than expanding the current leaf during review:

```text
/seed-issue Large CSV exports may need streaming; include the measured case
```

The seed skill routes reports through the root repository setting when present:

```yaml
issues_repo: owner/repo
```

That setting lives in:

```text
akrogon.yaml
```

Without it, the skill uses the repository's GitHub origin. A report about an Akrogon skill belongs in Akrogon.

New work still needs investigation and a contract. Do not treat every review suggestion as permission to change more code.

## Keep useful evidence without growing every leaf

Lessons help later planning find a proven constraint. Seeds preserve possible work without quietly adding it to the current implementation.

For CSV export, a reproducible memory problem can become new intake. The current leaf still has a clear finish line. Later charting decides whether the new report warrants work.

Previous: [Problems](problems.md) · Next: [Cheat sheet](cheat.md) · [Home](../../README.md)
