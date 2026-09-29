# Config swap owner

## Question
Q1. Who swaps the `slots.a`/`slots.b` values in config.yaml, and when?

### Carries
- forks/what-moves.md Taken + correction: letter swap; values swap so pi keeps implementing (a = pi/muse-spark/max) and codex keeps reviewing/merging (b = codex/gpt-6.1-sol/high). Operator: "you can swap those lines yourself, or in the lifecycle process."
- forks/cutover.md Taken: go live immediately, operator keeps everything else idle, only the swap leaf runs.

## Findings
- Rounds: slots/config-swap-owner-A.md, -B.md, -merged.md, -rebuttal-B.md.
- (A,B) Recommend: door makes a config-only commit of the operator's current config.yaml edit (a = codex/gpt-6.1-sol/high) and pushes it to origin/main before the swap leaf is allocated, after fast-forwarding local main (1 behind, c39309c, skills only). The swap leaf then sets a = pi/meta/muse-spark-1.3-contributor/max and b = codex/gpt-6.1-sol/high, touching only those two entries, in the same branch as the code.
- (A,B) Rejected: door swaps working-copy lines now. Old routes would make codex implement and pi merge the swap leaf.
- (B) Alternative: leaf changes code only, door swaps config at activation. Splits delivery.
- (A,B) Activation: update local main only after the swap leaf's old-A merger has finished its merged call and broadcast and is idle or exited. (B) R1: a closed tab is the usual sign, not a requirement.
- Evidence: config.yaml is the live global config (src/config.ts:70-81); leaf worktrees branch from the remote ref (src/next.ts:253-256); sync rejects a staged root config and rebases with --autostash (src/sync.ts:18-33,122).

## Taken
Operator 2026-09-29: "1a"
- The door commits only the operator's current config.yaml edit and pushes it to origin/main before the swap leaf exists. The swap leaf sets a = pi/meta/muse-spark-1.3-contributor/max and b = codex/gpt-6.1-sol/high in config.yaml, touching only those two seat entries, in the same branch as the code. Local main is updated only after the swap leaf's merger has finished its merged call and broadcast and is idle or exited.
- Reason: one local-main update switches code, skills and config together, and the swap leaf runs with today's models in today's jobs. Foreclosed: door swapping working-copy lines now; door swapping config at activation.
