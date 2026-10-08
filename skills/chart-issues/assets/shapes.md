# Chart and handoff shapes

Read before creating a chart or handing off. Paths below are relative to the authoritative registered root from `akrogon config` (`repo` identifies the key in `repos`), not an issues copy in a worktree. When effective config reports `repo: none` (the literal string `none` from `effectiveConfig`), chart locally and stop before leaf handoff until a registered destination is available.

## Chart records

```text
issues/chart/<chart-slug>/
  CHART.md
  INTAKE.md
  seats.yaml                    # open time and seat session ids, per the door
  USAGE.md                      # last measured usage table; a rerun replaces it
  forks/<fork-slug>.md
  slots/<pass>.md                 # only for peer exchanges
```
Charts stay here after handoff. They have no state.yaml or lifecycle phase. Create forks/ even for a fully settled direct item. On resume, CHART.md points to the selected fork and its context rather than requiring a full chart reread.
```markdown
# Chart: <destination>

## Destination
<observable outcome>

## Forks taken
- [<fork>](forks/<fork-slug>.md): <settled answer>

## Open forks
- [<fork>](forks/<fork-slug>.md): <question in one line>, in the order they will be taken

## Fog
<material work in scope whose question cannot yet be stated precisely>

## Off route
<excluded work and reasons>
```
Preserve useful territory-map findings under the relevant chart section or fork. After valid handoff, append `Handed off <YYYY-MM-DD>` on its own line to CHART.md without moving it. The markers are `Handed off <YYYY-MM-DD>`, `Closed <YYYY-MM-DD>`, and `Held <YYYY-MM-DD>`, each beginning its own line, with the last marker in the file authoritative. A handed-off chart remains part of duplicate detection and a later contract change becomes new intake, not an edit to emitted contracts.
```markdown
# Intake: <chart-slug>

## Scope
<destination and proposed grouping, separate from source text>

## Provenance
- GitHub: owner/repo#12
- Legacy path: issues/open/older-report.md
- Operator: <date or message reference>

## Source: owner/repo#12
<entire mirrored report copied verbatim>

## Source: issues/open/older-report.md
<entire legacy report copied verbatim>

## Source: operator <reference>
<operator notes verbatim>

## Agent findings
<inspected evidence and interpretation, not attributed to the reporter>
```
GitHub identity comes from the mirror's `Source: owner/repo#n` line. Compare exact identities against parsed `sources` in all open/closed leaf states and GitHub provenance entries in all chart intakes, including handed-off charts. Compare legacy repo-relative paths against legacy provenance entries, not substrings in report bodies. Deduplicate repeated identities in the current intake too. A local path never enters leaf `sources`. Keep source files unchanged and preserve copied report bytes beneath the source headings. An unsuccessful GitHub refresh supplies no permission to drain a stale mirror.
```markdown
# <fork title>

## Question
<one or more Q blocks, each holding the precise question>

### Carries
<existing locks, related fork paths and verbatim operator corrections>

## Findings
<grounded evidence, independent A/B attribution and remaining disagreements>

## Taken
<operator answer verbatim, reason and foreclosed alternatives>
```
One fork file holds one or more questions that are always presented together on one screen. A fork is taken when every material question in it is taken; partial answers stay under `## Findings` and `## Taken` is written only then. Append each explicit operator correction with its date, preserve earlier answers, and treat the last appended correction as binding only for the answer it changes. Unresolved questions have no invented Taken. A question sharp enough to travel alone gets its own fork file even while blocked. Work whose question is not sharp stays in Fog. Ruling work out records the reason in Off route instead of pretending a fork was taken. Reshape the remaining questions after each answer. A fork file with no operator answer under `## Taken` is open and appears in CHART.md's Open forks list in the order it will be taken, next first.

## Handoff tree

One issue uses `issues/open/<issue>/<leaf>/`. Two or more grouped issues use:
```text
issues/open/<epic>/
  EPIC.md
  <issue>/
    ISSUE.md
    <leaf>/
      brief.md
      design.md
      readiness.yaml
      state.yaml
  <other-issue>/
    ISSUE.md
    <other-leaf>/
      brief.md
      design.md
      readiness.yaml
      state.yaml
```
EPIC.md lists immediate issues, ISSUE.md lists immediate leaves, each one line per child with purpose:

```markdown
---
slots:
  a: {harness: claude, model: opus, effort: high}
  b: {harness: codex, model: gpt-6.1-sol, effort: medium}
---
# Epic: <epic>

- [<issue>](<issue>/ISSUE.md): <purpose>
- [<other-issue>](<other-issue>/ISSUE.md): <purpose>
```
```markdown
---
slots:
  a: {harness: claude, model: opus, effort: high}
  b: {harness: codex, model: gpt-6.1-sol, effort: medium}
---
# Issue: <issue>

- [<leaf>](<leaf>/brief.md): <purpose>
```

Container indexes hold no lifecycle state or global order; their optional `slots:` front matter is seat configuration. An index may open with a front matter block holding `slots:` and no other key. Detection is literal: the file's first line must be `---` and a later `---` must close the block, so the door places it at the very top. `slots:` accepts only keys `a` and `b`, each optional, and each present seat is exactly `{harness, model, effort}`. Every value must be nonblank after trim and its decoded value must contain no `'` or `"` character, so YAML delimiters are fine: `model: 'opus'` decodes to `opus`. The `harness` value names a template in the machine `config.yaml` `harnesses:` map. The nearest set seat wins per seat: `ISSUE.md`, then `EPIC.md`, then repo `issues/config.yaml`, then machine `config.yaml`. An issue inside an epic may carry its own block for its leaves. The door writes the block into the chosen owner's index before any leaf `state.yaml` is written, and `state.yaml` carries no seat field. Slugs are lowercase hyphenated words without ordering markers. Leaf slugs are unique across the proposed handoff and existing open/closed leaves in the destination repo. Independently checkable outcomes can run in parallel, even when files overlap; only actual prerequisites enter blocked-by.

### seats.yaml

The door writes one `seats.yaml` per chart holding the open time and one entry per seat session:

```yaml
opened: '2026-10-06T16:34:47Z'
seats:
  - seat: A
    pane: w8:pCT
    harness: claude
    session: 1ce71920-4c64-414b-ac1c-af56890a1c4b
```

`opened` is the time the door began its first pass on the chart and is never reset by folder creation or session replacement. `pane`, `harness` and `session` are the `pane_id`, `agent` and `agent_session.value` values `herdr agent list` prints. A replaced session is a second entry with the same seat letter. Outside herdr `seats` is empty.

## Leaf files

```markdown
# Brief: <leaf>

## What
<bounded change and observable outcome>

## Why
<problem this solves>

## Done-criteria
1. <an observable result in this leaf's ownership, never a test file, assertion or test count; proof may be a command in the destination's blocking `checks` (never a `merge_checks` command) or the own-test, end-to-end, real-outside-call and live-run forms standing-design.md allows; no repo-health claim outside leaf ownership>
```

```markdown
# Design: <leaf>

## Binding decisions, verbatim
<each applicable binding decision, retaining heading, answer, reason and
foreclosed alternatives>

<installed path of standing-design.md, then the current interpretation: how its rules apply to this leaf>

## Leaf architecture
<owned surfaces, literal interfaces, exclusions and necessary dependencies>
```

Each design is self-contained. Copy every binding decision into each affected leaf, with explicit exclusions for binding decisions that do not belong there. Cross-leaf claims name an owner whose own brief/design accepts that responsibility. Known human-only prerequisites have a named owner and recorded completion before handoff, separately from any `hand_built` choice.

### readiness.yaml

The door writes one `<leaf>/readiness.yaml` per leaf with all five sections, leaving unused arrays empty:

```yaml
inputs:
  - kind: env
    name: EXAMPLE_API_TOKEN
    holder: repo
    purpose: <what this input unlocks>
    consumers: [dependent-leaf-slug]
    steps: <how the operator supplies it>
    source: <where the value lives>
    done: <observable presence check>
  - kind: file
    name: ca-chain.pem
    holder: repo
    purpose: <what this input unlocks>
    consumers: [dependent-leaf-slug]
    steps: <how the operator supplies it>
    source: <where the file lives>
    done: <observable presence check>
produces:
  - name: <artifact the leaf emits>
    holder: repo
    consumers: [dependent-leaf-slug]
    save:
      entry: <store entry>
      revision: <revision tag>
      args: [<selection arg>]
      value_source: <where the saved value is read>
grants:
  - approved:
      by: <approver>
      date: <YYYY-MM-DD>
      answer: <recorded operator answer>
    principal: <agent identity>
    account: <service account>
    credential:
      name: <credential name>
      holder: repo
    targets: [<external system>]
    fixtures:
      - account: <service account>
        purpose: <why the fixture exists>
        marker: <fixture marker>
        naming: <name pattern>
        count: 1
        cleanup:
          - step: <removal step>
            identity: <who removes it>
        absence_check: <how absence is confirmed>
    operations: [<allowed operation>]
    effects: <what the operations touch>
    bounds: <limits on use>
    stop_line: <never-cross condition>
retained:
  - resources: [<kept resource>]
    purpose: <why it is kept>
    owner: <responsible party>
    remove_by: <YYYY-MM-DD>
    cost: <ongoing cost>
    exposure: <who can reach it>
    cleanup:
      identity: <who removes it>
      route: <how removal runs>
    reason: <why removal waits>
proofs:
  - operation: <external operation>
    command: <command executed>
    identity: <identity used>
    target: <system exercised>
    version: <version under proof>
    date: <YYYY-MM-DD>
    result: <observed outcome>
    cleanup: <post-proof cleanup>
    limits: <what the proof does not cover>
    record: issues/chart/<chart>/forks/<fork>.md
```

```yaml
slug: sample-change
phase: plan.synthesis  # plan.positions when debate: 'yes'
created: '2026-09-11'
repo: registered-key
debate: 'no'
blocked-by: []
sources: []
```

Replace sample values with the chosen slug, creation date and registered repo key. `debate: 'no'` starts at `plan.synthesis`; `debate: 'yes'` starts at `plan.positions`. Debate is one door election, default no, with very small issues using no without a question. Every leaf gets `sources`, empty when unsourced. Emit `hand_built: true` only for that explicit operator choice, otherwise omit the field. Attempts, done, fix_rounds, verdict, pane, tab, prompted and worktree belong to the command and are not door-authored.

A GitHub report has exactly one completion owner, an issue or an epic: every leaf beneath that owner carries its exact identity in sources. For an epic owner, that includes leaves of every child issue. Do not distribute one identity across unrelated completion owners. Legacy source paths stay in intake provenance, not sources.

Each identity compared during intake resolves to one outcome. A confirmed full match with no existing owner copies verbatim into INTAKE.md under its own `Source` heading with a GitHub provenance line, and its identity goes into `sources` of every leaf under the delivering completion owner so existing completion closes it. A partial match stays open and is shown with its uncovered part. An identity already in any open or closed leaf `sources` or another chart intake is shown to the operator as a conflict and is never silently reassigned. A failed or non-GitHub destination pull holds the handoff to that destination only and is reported; checking a destination never imports unrelated seeds.

## Preflight and validation

Prepare the complete contracts and attended handoff review before writing. Check all proposed destination folders and index files for occupancy, including partial leaf folders without state.yaml, and refuse the handoff on any collision. Before any handoff write, also refuse an existing `issues/closed/<top-level-owner-folder-name>` and name that conflicting destination, even if empty or missing state and indexes. The completion owner is the standalone issue or the epic, not a nested child issue. Never overwrite a sentinel brief or reuse an occupied leaf destination. Refuse a leaf whose What, done-criteria or owned surfaces touch any path under `issues/`, since a leaf branch carries code only and `akrogon phase` rejects `issues/` diffs; such work is an operator step on main, not a leaf. Check slug uniqueness across open/closed and the proposal. Resolve every blocked-by slug to an existing leaf folder with valid state or a proposed prerequisite, and refuse missing targets and circular prerequisites before writes. Emit prerequisite leaves before dependents so no written state names a not-yet-created prerequisite. Refuse the handoff while any fork file lacks an operator answer or `## Fog` is not empty. Refuse the handoff when a brief names an external operation with no recorded proof under the Take operation-proof rule. Refuse a handoff to a destination whose check right before the handoff review did not succeed, and name that destination. Run `akrogon preflight` at the registered root before any handoff write and refuse the handoff on non-zero exit, handing the printed remediation to the operator.

Read the briefs as an implementer: each criterion can be fulfilled within ownership and dependencies, cross-leaf promises have a matching owner, all binding decisions have a home or explicit exclusion, and known human prerequisites are complete. A done-criterion states an observable result in the leaf's ownership, never a test file, assertion or test count; proof may come from a command in the destination's blocking `checks` or the own-test, end-to-end, real-outside-call and live-run forms standing-design.md allows; the audit refuses a criterion naming a test file, assertion or test count, citing a `merge_checks` command or claiming repo health outside leaf ownership, and allows a repo-wide `checks` command only when the chart names the property no smaller test proves. For every `blocked-by` entry the door writes into the dependent's brief, under What or Why, the output it consumes; when that output is a part the producer could merge with its own proof, the door proposes that part as a prerequisite leaf, with no count, size or duration trigger and no recorded reason for a kept bundle. Obtain the operator's go-ahead for this concrete tree and contracts, honoring session authorization already given. The audit checks that operation-proof refusal.

A chart with a chain names the spine command and a stage table; each stage-owning leaf gets a done-criterion putting its stage in the spine and deleting obsolete stand-ins (blocked-by where it needs the spine first); the chart names the rule owner when writer and checker sit in different leaves; a slow-run leaf's brief states its repair scope and final-proof rule; and the audit refuses a stage-owning leaf without the spine criterion (rules live in standing-design.md, not restated here).

Write the leaf files and immediate-child indexes directly at the registered root. Write brief.md, design.md and readiness.yaml before state.yaml, and a prerequisite leaf's files before its dependents', because dispatch picks up any folder holding a state.yaml. Then run `akrogon status` there and inspect the actual result. It parses states with the command's schema, parses each leaf's readiness.yaml and checks repo/slug consistency; a readiness.yaml that does not parse fails validation. It does not prove source ownership, dependency existence or prose quality, which require the preceding audit. A failed validation is an unfinished handoff requiring repair, not permission to mark the chart handed off. A successful handoff retains the chart and original inputs, appends the handoff date and ends at the printed footer without dispatch.
