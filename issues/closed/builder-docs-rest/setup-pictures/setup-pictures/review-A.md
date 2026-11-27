# Review A: setup-pictures (check.review)

Base f6fb18643f6dfc31f8e7e801660f80d1887947c8. Reviewed head 154534374fe4f8ac0e905af0f95bdf4cff483513. Reviewed blind, without B's review.

## Verification evidence

- `akrogon verify` on 154534374fe4: setup, format, typecheck and test all 0, `verify leaf ...: green` (report).
- Criterion proofs on the head: `check pictures: 0 implementation/check-pictures-1795791320020-2635482.log` (6 pass), `check dash: 0 implementation/check-dash-1795791320149-2635555.log`, `check svg-search: 0 implementation/check-svg-search-1795791320285-2635648.log` (12 files, `forbidden=0 created_by=1 title=1` each). No code changed since, so I reran nothing.
- Renders: I read all 12 on white and `three-tabs.svg` on #0d1117 (`scratchpad/a-renders/`). Each shows its section's content. Labels sit inside their boxes, nothing is clipped, and the mark is at the bottom right on the text line. The dark render shows the opaque card intact.
- Label words: a whole-word search of every `<text>` in the 12 files for manual, seat, door, leaf, attended and quick fix found nothing.
- Alt text: each of the 13 embeds (12 sections plus the README hero) is one plain sentence matching its section, and its claims match the page text. For example, repo-settings' "advisory never blocks" matches page 02's "non-blocking commands go under advisory", and updates-and-rollback matches page 01's releases sentence.
- Diff scope: README.md and pages 01 to 03 gain only embed lines (`+` lines are embeds and blank lines). No guide text changed, which fits the design exclusion.
- `tests/AREA.md`: of the paths it names, the only real missing file is `tests/budget.test.ts`. It is already missing at base f6fb1864 and is not on the line this leaf changed. The other "missing" items are commands, runtime paths or a glob that matches (`tests/hc-*.test.ts`).
- Documented behavior: none changed. The pictures restate pages 01 to 03, and `docs/reference/where-things-go.md` already states the mark rule.

## Criteria

1. README hero, a picture for every section with plain alt text and approved words: met. There are no shares, and the report states the share list is empty.
2. Mark group identical to charting-pictures-more's apart from the translate, and the forbidden-markup search: met. The test compares pages 01 to 08 together, and the report carries the search log.
3. Slot B's render reading: B's to do. A's own reading above found no picture that fails to show its section.
4. Checks: green.

## Findings

No Fix.

- **Nit N1, the docs-links expectation correction (15453437).** The README case changed from "no picture" to "images equal `docs/pictures/three-tabs.svg`". It cites a real brief outcome (criterion 1) contradicting an expectation that design R10 scoped "until the hero exists", and it does not widen beyond that source. But it is a guide-chapters test, not one this leaf planned, so it sits at the edge of A's "wrong expectation in a planned test" exception. Deferred because the source is real and the change is the narrowest one that satisfies criterion 1. B rejecting the seat's authority would promote it to a Fix.
- **Nit N2, pre-existing dead pointer.** `tests/AREA.md` names `tests/budget.test.ts`, which does not exist at base or head. It is outside this leaf's line and criteria, so it is deferred. Evidence that a reader or seat is misled by it in this leaf's scope would promote it.

## Verdict

nits
