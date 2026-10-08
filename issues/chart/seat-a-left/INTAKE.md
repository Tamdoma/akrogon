# Intake: seat-a-left

## Scope
Destination akrogon. One standalone issue: a replaced seat A pane is placed left of the surviving seat B pane.

## Provenance
- GitHub: Tamdoma/akrogon#60
- Operator: 2026-10-08 chart-issues open, split answer `1a 2a`

## Source: Tamdoma/akrogon#60
# akrogon next puts a replaced seat A pane on the right of seat B

Source: Tamdoma/akrogon#60
URL: https://github.com/Tamdoma/akrogon/issues/60

Unverified intake.

## Observation
After seat A's pane was closed in five live leaf tabs (framework: motion-coverage-probes, csp-effective-policy-check, variant-count-and-briefs, schema-machine-plan; lens: mockup-limits-and-types), `akrogon next <slug>` started the new seat A pane to the right of the surviving seat B pane. Seat A is expected on the left. The operator fixed the five tabs by hand with `herdr pane swap --source-pane <A> --target-pane <B>`.

## Location
`src/next.ts:417-433`, pane allocation in `akrogon next`.

## Reproduction
1. Have a leaf tab with seat A (left) and seat B (right).
2. Close seat A's pane (`herdr pane close <A>`).
3. Run `akrogon next <slug>`.
4. The new A pane appears right of B.

Seen 5 of 5 times on 2026-10-08.

## Expected behavior
Seat A is always the left pane and seat B the right pane, including when only one seat is replaced.

## Urgency
Low. Cosmetic, but the operator reads tabs as left = A, so it misleads anyone watching. Workaround: `herdr pane swap --source-pane <new A> --target-pane <B>`.

## Suspected cause
When A is missing and B survives, `src/next.ts:423` runs `herdr pane split <B> --direction right`. herdr split rejects `--direction left` (`invalid split direction: left`), so a split from B can only place the new pane right of B. `herdr pane swap --source-pane <new A> --target-pane <B>` afterwards restores A on the left (verified live on 5 tabs). The test at `tests/next.test.ts:1888` checks only which pane was split, not the resulting order.
View: agent.
Files read: `src/next.ts`, `tests/next.test.ts`.
Not inspected: `tests/fake-herdr.ts` support for `pane swap`.
Related reports: Tamdoma/akrogon#34 is about chart-issues peer pane layout, not leaf seats. Searched Tamdoma/akrogon, query "pane split", all states, limit 5.

## Agent findings
See [opening map](slots/map-merged.md).
