# Plan: chart-audit-rules

Direct synthesis, `debate: no`. Built from `brief.md`, `design.md` and the live checkout at `2ad0acf`. No positions or rebuttals exist. Brief and locked design agree, so no conflict note. Concrete case driving rule 1: framework leaf emdash-conversion cited `bun run framework:verify`, a repo-wide command outside framework's blocking `checks`, which sibling merges could turn red.

## Decisions

- D1: Edit `skills/chart-issues/assets/shapes.md` in place: the done-criteria placeholder (line 132) and the implementer-audit paragraph (line 170). No new file, section or template field.
- D2: Rule-1 wording states the two allowed proof kinds, the prerequisite route (a leaf needing a larger repo-wide command gets it added to `checks` first, after a prerequisite makes it pass), and the audit refusal of a criterion citing a repo-wide command outside `checks`. "A test the leaf itself adds" uses the C D4 meaning: own tests plus end-to-end evidence, real outside calls and live runs that standing-design.md allows.
- D3: Rule-2 wording is keyed on each `blocked-by` entry and the consumed output, written by the door into the dependent's brief (What or Why) with no new template field. When that output is a part the producer could merge with its own proof, the door proposes that part as a prerequisite leaf. No count, size or duration trigger, and no recorded reason for a kept bundle.
- D4: No test asserting the new wording. The design calls that a vanity test; the cheapest sufficient proof is reading the changed paragraphs plus the blocking `checks`.
- D5: The spine paragraph (`shapes.md:172`) and `skills/chart-issues/SKILL.md:41` stay byte-unchanged, verified by diff.
- D6: Sweep `docs/` for a restatement of either rule before finishing (2026-09-11 stale-rule lesson). None found at plan time, so no human-doc change is expected.

## Read-first paths

- `docs/reference-index.md`
- `skills/AREA.md`
- `learnings/LESSONS.md`
- `skills/chart-issues/assets/shapes.md` (owned surface)
- `skills/chart-issues/assets/standing-design.md` (rule interpretation)
- `skills/chart-issues/SKILL.md` (excluded, must stay unchanged)
- `skills/merge-issue/SKILL.md:33-39` (merge runs every `checks` command and refuses red checks)

## Needed interfaces

None. The design states literal interfaces: none.

## Acceptance criteria

1. The implementer-audit paragraph (`shapes.md:170`) states rule 1 with the prerequisite route and the audit refusal. The template placeholder (`shapes.md:132`) names only the two allowed proof kinds.
2. The implementer-audit paragraph (`shapes.md:170`) states rule 2, keyed on `blocked-by` and the consumed output, with no count, size or duration trigger.
3. The spine paragraph (`shapes.md:172`) and `skills/chart-issues/SKILL.md:41` are unchanged.
4. Every configured blocking `checks` command passes, including the resolved changed-tests command.

## Ordered checklist

1. Rewrite the placeholder at `shapes.md:132` to name only the two allowed proof kinds (criterion 1).
2. Extend the audit paragraph at `shapes.md:170` with rule 1: allowed kinds, prerequisite route, audit refusal (criterion 1).
3. Extend the same paragraph with rule 2: `blocked-by` keying, consumed output in What or Why, prerequisite proposal, no triggers (criterion 2).
4. Diff to confirm the spine paragraph and `SKILL.md` are untouched (criterion 3).
5. Grep `docs/` for a restatement of either rule; report hits instead of silently leaving a stale rule.
6. Run every blocking `checks` command including the resolved changed-tests command (criterion 4).

## Affected docs

- Agent doc: `skills/chart-issues/assets/shapes.md` is the only live surface changed (placeholder plus audit paragraph).
- Human docs: no file under `docs/` restates the placeholder or audit rules (verified by grep at plan time), so no human doc changes.

## Verification

- Criterion 1: `sed -n '125,135p;165,175p' skills/chart-issues/assets/shapes.md` plus `git --no-pager diff -- skills/chart-issues/assets/shapes.md`, read for the two proof kinds, prerequisite route and refusal. Catches a missing route or an over-broad placeholder. Size: seconds. Rerun on any `shapes.md` edit.
- Criterion 2: same diff, read for `blocked-by` keying, consumed output, prerequisite proposal and absence of triggers. Catches a dropped clause or an added size gate. Size: seconds. Rerun on any `shapes.md` edit.
- Criterion 3: `git --no-pager diff -- skills/chart-issues/SKILL.md` empty and the spine paragraph absent from the `shapes.md` diff. Catches an accidental edit to locked prose. Size: seconds. Rerun on any worktree edit.
- Criterion 4: `bun run format`, `bun test`, `bun run typecheck`, and the resolved changed-tests command below. Catches red suite, type or format failures. Size: minutes. Rerun after any worktree change.
- Resolved changed-tests command: `AKROGON_BASE=2ad0acf70a85dacefa3a89c53a53233e2aae11ca bun test --changed="$AKROGON_BASE"` (refresh `AKROGON_BASE` from `akrogon config` if the base moved).

## Dependencies, credentials, runtime

- Dependencies: none.
- Credentials: the design names no variable, so no `.env` presence check is required.
- Not a slow-run leaf: no restart boundaries.

## Open limitation

The rules are prose the door applies; no automated check rejects a done-criterion citing a repo-wide command outside `checks` or a `blocked-by` entry without consumed output in the brief. A future door that skips the audit can still hand off the same failure class.
