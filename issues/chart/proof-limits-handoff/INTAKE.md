# Intake: proof-limits-handoff

## Scope

akrogon, from Tamdoma/akrogon#127. Destination and grouping are set by the opening map.

## Provenance

- GitHub: Tamdoma/akrogon#127
- Operator: door pane t15, 2026-11-04 (switch-on words below)

## Source: Tamdoma/akrogon#127

# Chart handed off fixture-weave-recorder although its only proof recorded that verify acceptance, the criterion-1 property, was not proven; the leaf then failed three times on verify

Source: Tamdoma/akrogon#127
URL: https://github.com/Tamdoma/akrogon/issues/127

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

Chart `about-titles` (framework repo) handed off leaf `fixture-weave-recorder` on 2026-11-03. Done-criterion 1 required that a partial re-record of one fixture page be accepted by "the real finalize and verify". The leaf's only charting proof, in `readiness.yaml` `proofs[0]`, ran `record-satellite-write-stage.ts` and recorded:

- result: `exit 1 after 139 s ... content-verify gate refused VERIFY_COPY_VERDICT_MISSING`
- limits: `proves login, run-time pin read, batch dispatch and cleanup; not the copy judgment session, finalize or verify acceptance`

So the property criterion 1 rests on (real verify accepting the checked-in fixture after a partial re-record) was recorded as unproven, and the handoff went ahead. The fixture's pages were recorded 2026-10-18, before verify checks added 2026-10-21 (`body_h1`), 2026-10-26 (`cross_site_copy_review`) and 2026-10-29 (`cross_site_heading_repeat`). The leaf then failed on exactly that property three times:

1. implement: verify flagged all 15 unnamed site-3 pages (mechanical checks); operator chose a pre-session verify baseline.
2. check.repair: review found the baseline taken after the session and the copy judgment skipped.
3. check.repair: the copy judgment flagged 8 byte-unchanged unnamed pages (`cross_site_copy_review`); operator chose to carry copy findings that cite no named page.

Each stop needed an operator design decision and a new paid grant. Paths: framework `issues/open/about-titles/fixture-weave-recorder/{readiness.yaml,review-B.md,implementation/report.md}`.

## Location

akrogon `skills/chart-issues/SKILL.md:59` (operation-proof rule: proofs record `limits`) and the handoff audit at `skills/chart-issues/SKILL.md:77`.

## Reproduction

Observed once. A criterion whose decisive property appears in the charting proof's `limits` as not proven, and the handoff proceeds. Frequency otherwise: Not provided.

## Expected behavior

Reporter: a handoff refuses, or shows at the handoff review, a done-criterion whose deciding property is listed in a proof's `limits` as not proven and has no other proof, so the unknown is probed at charting or narrowed with the operator before a seat pays to discover it.

## Urgency

Three failed stops, three operator design decisions and five grants on one leaf, about 10+ paid sessions, and the dependent leaf `about-identity-title` blocked for about 7 hours so far. Workaround: operator reads each proof's `limits` against the criteria before approving a handoff.

## Suspected cause

The operation-proof rule requires each external operation to be called once and its limits recorded, but nothing compares a proof's stated limits with the done-criteria that depend on it. A proof that stops early on an operation still satisfies the rule. The handoff audit checks that a proof exists, not that it reached the property the criterion needs.
Whose view: agent (watch session at the framework root), reporter agreed to filing.
Files read: framework leaf `readiness.yaml` (proofs[0]), `brief.md`, `review-B.md`; akrogon `skills/chart-issues/SKILL.md:59,77,96`; `git log -S` dates for the verify check names in `.claude/skills/write-satellite-content/`.
Not inspected: the chart's fork files and handoff review text, so whether the operator saw the limits line at review is not known.
Related reports: Tamdoma/akrogon#79 (closed): live proof rig not de-risked before a long live loop, a related pattern of discovering proof gaps during implementation; Tamdoma/akrogon#126: grant overspend on the same leaf. Searched Tamdoma/akrogon, all states, "proof limits handoff", "charting proof criterion", "handoff unproven criterion", limit 8.

## Source: operator t15 2026-11-04

"I just pulled the 3 issues. We're gonna do autopilot mode with manual signposts. Use slot b (codex) and slot c (claude code fable 5.1 high reasoning) consultants."

"This is the new herdr-app that I'm going to be updating. Please look at the herdr-app issue, and also Read ~/.config/herdr-app/AGENTS.md. We'll be moving to this architecture soon, but not right now."

## Agent findings

none yet
