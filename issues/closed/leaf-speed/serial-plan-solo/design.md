# Design: serial-plan-solo

## Binding decisions, verbatim

### Chained units (/home/ivan/Work/infra/akrogon/issues/chart/leaf-speed/forks/chained-units.md)

Operator 2026-10-12: `1a | 2a | 3a` (1a for this fork).

When every wave in the final plan holds exactly one unit, A builds the whole leaf itself with no workers, whatever the reason for the serial order (prerequisite, shared path or shared test resource) (A,C). Any wave with two or more units keeps workers. Reason: hand-offs between serial workers cost about 1 min median, up to 14 min, and buy no parallelism. Foreclosed: 1b keep workers for serial plans.

### Fix order: loop first or leaves-as-chunks (/home/ivan/Work/infra/akrogon/issues/chart/leaf-speed/forks/fix-order.md)

Operator 2026-10-12: `1a`

Fix the loop first: remove duplicate checks, keep #87, cut merge-time failures that are not the leaf's fault, log when passes start. One agent builds the whole leaf only where its chunks must run one after another. Measure 20 leaves, then decide leaves-as-chunks with real numbers.

Reason: logs put the lost hours after implement, and leaves-as-chunks would multiply per-leaf overhead while it is high.

Foreclosed: 1b leaves-as-chunks now. 1c removing chunks only.

### Exclusions
- [measure-and-revisit](/home/ivan/Work/infra/akrogon/issues/chart/leaf-speed/forks/measure-and-revisit.md): not this leaf.

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md
Interpretation: a skill-text leaf; proof is the existing checks (`format`, `test`, `typecheck`) plus review of the stated text. Held disagreement (B): standing design asks a changed prompt to run one real call through its consumer; akrogon has no machinery to run a seat on a fixture leaf, Operator handoff review 2026-10-13: `22a`, corrected to `2a*`: text proof stands; the first real framework leaf whose plan has only single-unit waves is observed through the timing record for worker checks (door step, not a done-criterion). No new test unless an existing skill-text test already pins the delegation sentence, in which case that test changes with a `Test-Change` trailer.

## Leaf architecture
Owned: `skills/implement-issue/SKILL.md`, `skills/implement-issue/worker-protocol.md`, `skills/AREA.md`, `docs/guide/phases.md`, one cross-reference line in `skills/plan-issue/SKILL.md`. Excluded: `src/config.ts` `implement` modes, plan wave rules.
