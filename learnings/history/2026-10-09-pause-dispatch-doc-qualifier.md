# Conditional dispatch descriptions

## Case

Review A of pause-dispatch deferred N1: docs/guide/merge.md and the merge-turn paragraph in docs/guide/next.md describe automatic wake behavior without an explicit pause qualifier. The new pause section supplies the exception, so no present behavioral defect was established.

## Evidence

At reviewed head 5b4c69ba9835cf1bac7418d1df148441dd37e9f1, merge.md:5 says the next holder is prompted without a manual next, and next.md:110 describes every committed phase move re-sweeping merge. next.md:94 explicitly explains paused automatic passes do nothing. Initial review-A.md N1 and review-B.md check.repair preserve the concern and promotion condition.

## Learning

When documenting a conditional automatic action, check related descriptions for claims that read as unconditional. An existing nearby exception can justify deferral. An actual operator confusion report or required coverage rule would make correcting the claim necessary.
