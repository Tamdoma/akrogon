# Intake: next-same-work

## Scope

Destination akrogon: `akrogon next <name>` starts the work when a bare name's matches all select the same leaves. One issue, one leaf, owning `src/next.ts` `resolveName` and `docs/guide/parts.md`.

## Provenance

- GitHub: Tamdoma/akrogon#109
- Operator: 2026-10-21 "One new issue pulled. Let's chart it out."

## Source: Tamdoma/akrogon#109

# akrogon next <slug> throws "Ambiguous target" for a standalone issue whose single leaf has the same name

Source: Tamdoma/akrogon#109
URL: https://github.com/Tamdoma/akrogon/issues/109

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

In framework, `akrogon next cache-proof` fails with:

```
error: Ambiguous target "cache-proof":
  issue issues/open/cache-proof
  leaf issues/open/cache-proof/cache-proof
```

`akrogon phase cache-proof check.fix` accepts the same short name and works.

## Location

`akrogon next <slug>`, release abfee125b4ab. Thrown at `src/next.ts:1197` in `resolveName`, via `selectLeaves` (1228) and `nextCommand` (1294).

## Reproduction

1. Have a standalone issue `issues/open/<name>/` whose only leaf is `issues/open/<name>/<name>`.
2. Run `akrogon next <name>` from the repo root.

Frequency: every time, for every standalone issue laid out this way.

## Expected behavior

When the issue resolves to exactly one leaf and that leaf has the same name, `next` treats the short name as that leaf, since both targets mean the same work. This matches `phase`.

## Urgency

Every standalone charted issue hits this. Operators and the watch loop must remember to pass full paths. Workaround: `akrogon next issues/open/<name>/<name>`.

## Suspected cause

`resolveName` (`src/next.ts:1177-1200`) builds `matches` from two lists: owner candidates whose name equals the input (`ownerCandidates` adds `issue` for 2-part paths) and leaves whose slug equals the input. A standalone issue and its same-named leaf both match, so `matches.length` is 2 and it throws. There is no step that collapses matches whose leaf sets are identical.
View: agent, from the reporter's statement.
Files read: `~/.akrogon/releases/abfee125b4ab68bec34bd73325c077c12c74fc47/src/next.ts` (installed release copy, not the destination source checkout). Not inspected: how `phase` resolves names, the destination repo's current `src/next.ts`.
Related reports: none found. Searched Tamdoma/akrogon, state all, author @me since 2026-10-17 (limit 30), and keyword "ambiguous target next" (limit 10). #108 is a different defect (closed-destination clash).

## Source: operator 2026-10-21

One new issue pulled. Let's chart it out.

consult with slot b and c about this (they're already active herdr panes in this tab).

## Agent findings

- The refusal is a locked operator decision: issues/chart/next-named-targets/forks/names.md Taken 3a (2026-10-08) refuses an issue and its same-name leaf "even when they select the same work", after B's rebuttal that equal-set collapsing is unstable.
- 72 same-name issue/leaf pairs in framework (open+closed), all with exactly one leaf; zero same-name pairs grew a second leaf across akrogon (226 leaves) and framework (545 leaves), counted 2026-10-21.
- skills/watch-issues/SKILL.md:38-41 runs `akrogon next <slug>` by bare name, so it hits the refusal on framework's default layout.
- `phase` resolves leaf slugs only via src/state.ts `findLeaf`, which is why it accepts the name.
- docs/guide/parts.md:28-35 documents the path workaround.
