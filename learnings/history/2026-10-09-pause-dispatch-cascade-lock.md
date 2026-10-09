# Automatic dispatch cascades need the launch lock

## Case

Review B of pause-dispatch found that landed-batch reconciliation released the global lock before starting dependent leaves. Holder dispatch had a dedicated lock wrapper, while the cascade used a helper that assumed its caller held the lock.

## Evidence

Head 5b4c69ba9835cf1bac7418d1df148441dd37e9f1, src/next.ts:895-900. A CLI --resume pass reached a barrier before dependent tab creation. A concurrent real pause command acknowledged, then releasing the pass created panes, started agents and prompted the dependent while repo: true remained recorded. Existing holder and main-sweep race tests both passed. Full reproduction is in issues/open/repo-pause/pause-dispatch/review-B.md, F1.

## Learning

Trace every launch caller across lock release points, including completion cascades. An unlocked pause read cannot enforce a launch rule. Race proofs should cover each distinct lock ownership path, including post-reconciliation dependent dispatch.
