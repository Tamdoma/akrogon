# Sub-brief 2: seed-cause-evidence U2 — update docs/guide/create.md seed-issue section

## 1. Goal

Bring the seed-issue section of the operator guide in line with the rewritten skill. Plan decision covers docs only; the behavior contract lives in `skills/seed-issue/SKILL.md`. Owned path: `docs/guide/create.md` only, in the worktree `/home/ivan/Work/infra/akrogon/issues/worktrees/seed-cause-evidence-u2`.

## 2. Acceptance criteria

1. The seed-issue section (`## seed-issue: …`, lines 84-103 of the current file) says the report now carries six sections: the five it already names plus a last `## Suspected cause` holding a labeled unverified hypothesis or "no supported hypothesis" plus the evidence needed next.
2. It describes the bounded discovery: the agent reads the files the failure names and follows them one hop, reads only, then stops at a hypothesis or a named evidence gap.
3. It describes related links: two read-only `gh` searches on the destination repo (the account's last two days and a 2-3 word keyword search), linked reports listed with a reason each, and "none found" or "search failed" recorded.
4. It describes the root-report line: after filing, when several reports share one suspected condition, the skill may print one `/seed-issue` line the operator can run to file a root report; the report itself stays one issue per run.
5. It retains: unverified intake marking; missing details and unsupported causes are recorded, not invented; the result is a report URL, not a plan; pull imports reports.
6. Style matches the guide: short plain sentences, second person light, no new headings inside the section.

## 3. Read-first list

- `docs/guide/create.md:84-103` (the section you rewrite) and the surrounding guide for tone.
- `/home/ivan/Work/infra/akrogon/issues/worktrees/seed-cause-evidence/skills/seed-issue/SKILL.md` on the lane HEAD — the behavior contract to describe (the lane already contains the rewritten skill; do not copy its wording).

## 4. Change list and needed interfaces

One file: `docs/guide/create.md`, replacing the `## seed-issue` section body (keep the heading pattern and the nav footer untouched). Length stays in the guide's register: roughly the current paragraph count, a few sentences added. No code blocks needed beyond the existing `/seed-issue` example; the root-report line may be shown inline as `/seed-issue` without a full example.

## 5. Do-not, reasons and exceptions

- Do not touch any file other than `docs/guide/create.md`. Reason: U1 owns the skill; all other files out of scope.
- Do not document trigger internals (five conditions, retry count, JSON fields) beyond what an operator needs. Reason: the guide describes outcomes, not the rule text; keep it short.
- Do not claim the skill verifies causes or groups reports. Reason: verification is chart-issues' job; the section must not promise it.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A.
- Restated: one file only; operator-level summary only; no verification claims; mismatch over scope change.

## 6. Ordered steps

1. Read the skill on lane HEAD and the current section.
2. Rewrite the section body per acceptance 1-5, keeping tone and the existing `/seed-issue` example.
3. Commit: `docs: describe seed-issue suspected cause, related links and root line`.

Advisory: 1 file, under 8 turns.

## 7. Commands

```bash
cd /home/ivan/Work/infra/akrogon/issues/worktrees/seed-cause-evidence-u2
AKROGON_BASE=ce4c9813982b690c78f075d1aecbb17ebcb01f9c bun test --changed="$AKROGON_BASE" --timeout=30000
```

## 8. Done-when, evidence and report

The section satisfies acceptance 1-6; the commit lands on the worker worktree HEAD.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
