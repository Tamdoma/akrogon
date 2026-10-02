# Rebuttal C: repair-authority Q1 (disagreements only)

## X1. The wide rule's live-run wording is wider than what I recommended (merged:10)

The merged text excludes "required live runs not already authorized". My rule excluded every required live run. The difference lets B do an authorized live run during its repair. The rules for slow and live runs exist only in A's skill: cheap proof first, overlap limits and wait-on-exit (`skills/implement-issue/SKILL.md:40-43`), plus wall-time and reused-stage reporting (`skills/implement-issue/SKILL.md:60-61`). The check-issue and merge-issue skills hold none of them. The emdash-launch overnight repair leg was a live run of 547 minutes (`framework/issues/log.jsonl`, 2026-10-01T20:16 to 2026-10-02T05:24). Either keep all required live runs with A, or the design must copy those rules into B's repair pass.

## X2. The command-gate fork as worded has a cost the merged file does not state (merged:26)

`akrogon phase` holds one global lock for the whole transition (`src/phase.ts:283`, `withLock(resolve(globalHome(), '.lock'), ...)`). Running `checks` inside it would block every leaf's phase move in every registered repo for the length of the checks. The fork needs an option that runs checks outside the lock, or it should not be offered in this form.

It also reopens an answered question. The operator took 3a: tests, checks and merge checks gate B's repair. A command-run gate changes who runs those checks for every merge, not only for B repairs, since B already reports its own check results at merge today (`skills/merge-issue/SKILL.md:35`). I raised the pitfall and still hold it. The fork belongs on the off-route list with the reason, unless the operator asks for it.

## X3. Attribution on the bias section (merged:14, 16, 17)

The section is marked (A,B,C). I did not read or report three items in it: the "0.056% severe flags on 49,650 internal Codex tasks" figure, the "more reward-hacking flags than Astra" claim, and the Yang 2026 and Chen et al. ACL 2025 papers. My round covered the 1.50% misrepresentation rate, the 23.5% persistence figure, Panickssery, Guey and Bougault, Park and Choi, and Olausson. Those three items should carry the peers who sourced them, not C.

The merged section also drops the persistence figure: unwanted persistence after warnings in 23.5% of rollouts against 17.4% for Astra (https://deploymentsafety.openai.com/gpt-6-1-sol/respecting-auto-review, read 2026-10-02). It is the evidence behind the "no scope creep" pitfall at merged:22 and should stay.
