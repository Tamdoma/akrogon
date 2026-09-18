# Design: terminal-stage-marker

## Binding decisions, verbatim

### Q1 · Does `held` get its own stage, or is everything terminal just `closed`?
Taken: `closed` and `held` as two distinct stages.
Reason: the two live examples are genuinely different states; one is dead, one has live obligations with a fixer.
Forecloses: a single collapsed terminal word.

### Q2 · What does `held` mean, and which marker wins when a chart has two?
Taken: the last marker line in the file wins.
Reason: reopening becomes an append, nothing is deleted, history stays readable, and it matches the existing append-only `Handed off <date>` habit.
Forecloses: unconditional `Handed off` precedence; any rewrite-in-place scheme.
(B) Correction carried into this leaf: last-wins delivers a **changed disposition** by appending, for example `Held` followed later by `Handed off`. It does not deliver a return to `charting`, because any recognized marker takes precedence over the fork-count fallback. Returning a chart to active charting means removing its marker line, which is an operator edit under `issues/` and outside every leaf. No fourth marker is introduced and the implementer must not invent one.

### Q3 · Do the two existing framework charts get normalized, and when?
Taken: normalize both existing framework records, and the chart-issues door agent performs the edits, not the operator.
Operator verbatim: "3a - you do them yourself, I'm not touching the code"
Forecloses: leaving the records unchanged; any leaf owning the edit.
**Excluded from this leaf.** `skills/chart-issues/assets/shapes.md:163` refuses a leaf whose owned surfaces touch any path under `issues/`, and `akrogon phase` rejects `issues/` diffs. The two framework CHART.md files are edited by the door agent on main, outside this leaf, and are already complete before this leaf opens.

Not applicable to this leaf: every binding decision recorded under Tamdoma/akrogon#16 (completion owner `pi-extensions`). The proposed removal of `observeBusy()` was ruled out on 2026-09-18 and emits no leaf, so the akrogon busy notifier is untouched by this handoff.

## Standing design
Installed path: `/home/ivan/.claude/skills/chart-issues/assets/standing-design.md`.

(B) Artifact: the STAGE column is a user-visible CLI flow, so the adopted standing-design line requires a retained artifact. The artifact is the captured `akrogon status --charts` output for a fixture repository containing one chart of each stage, written under the leaf's evidence directory with its path named in the implementation report.

Interpretation for this leaf: no auth, secrets, credentials or user-visible browser flow are involved, so those lines are inert here. The lines that bind are mandatory negative and edge-case tests, no vanity tests, and the end-to-end verification line. The end-to-end requirement is met by `bun test tests/status.test.ts` exercising `chartRow` against real CHART.md fixtures on disk rather than a stubbed reader; the blocking `checks` commands judge the exit code. Negative cases are mandatory and named in done-criteria 4 and 2: a marker word that is not at line start must not count, and the existing trailing-text `Handed off` shape must not regress.

## Leaf architecture
Owned surfaces:
- `src/status.ts`, `chartRow` only. The stage expression at line 247 becomes a last-match scan over the marker alternation.
- `tests/status.test.ts`, adding cases beside the existing chart cases at 460-482.
- `skills/chart-issues/SKILL.md` and `skills/chart-issues/assets/shapes.md`, the marker-writing sentences only.

Literal interface: the stage vocabulary emitted in the STAGE column is exactly `handed off`, `closed`, `held`, `charting`, `empty`. The marker regex is anchored at line start with a word boundary, matching the existing `^Handed off\b` shape. Marker date shape is `<YYYY-MM-DD>`, matching the existing `Handed off <YYYY-MM-DD>` contract; trailing prose after the date stays permitted, since both live examples carry it.

Exclusions:
- `section()` and the Fog counting rule are unchanged.
- `chartRows` layout resolution is unchanged.
- The AGE column stays CHART.md mtime. Writing a marker resets it; accepted, not a defect.
- No chart metadata file, no CLI setter, no lifecycle state for charts.
- (B) Reopening a terminated chart back to `charting`. Explicitly out of scope. Only disposition changes between the three terminal markers are supported.
- No documentation change. `grep -rn -- "--charts\|STAGE" docs/` returns `docs/guide/cheat.html:76` and `docs/guide/in-practice.html:76`, both of which name the column generically ("stage") without listing its vocabulary, so neither states a rule this leaf changes. If the implementer finds a doc page that does state the vocabulary, that page is owned by this leaf.
- Any edit under `issues/`.

Necessary dependencies: none. This leaf runs alone.
