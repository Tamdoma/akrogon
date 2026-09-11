# Chart: grounding-standard

## Destination
The operator guide is served from `docs/guide/`, planners open `docs/reference-index.md` as the entry point, and every area the index cannot describe in one line has a short area file that init-issues writes, implement-issue keeps current and check-issue verifies for dead paths. New repos get the same layout from init-issues.

## Decisions So Far
- [Which areas of akrogon get an area file in this issue?](decisions/area-coverage.md): src, skills, tests
- [How is the work split into leaves?](decisions/leaf-split.md): one leaf
- [Where does an area file live and what is it called?](decisions/area-file-location.md): `<area>/AREA.md` beside the code
- [Where is the dead-path check enforced?](decisions/path-check-home.md): check-issue review rule, diff-scoped

## Open Decisions

## Not Yet Specified
Nothing beyond the open decisions. Relocation of the guide and the index is fully specified by the operator: move all of `docs/*.html` and `docs/style.css` to `docs/guide/`, move `REFERENCE.md` to `docs/reference-index.md`, update `issues/config.yaml`, README, `docs/setup.html` line 74, the init-issues default and the four Playwright specs.

## Out Of Scope
- Scheduled doc regeneration or a critic pass (Meta's approach). No new machinery per operator.
- A new skill or command for documentation. Rules land in init-issues, implement-issue and check-issue only.
- Nested CLAUDE.md or AGENTS.md files. Harness specific, and placement showed no measured effect.
- Area docs for the other repo the operator plans to initialize. init-issues writes them at that repo's setup.

Handed off 2026-09-11
