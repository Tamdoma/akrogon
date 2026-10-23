# walls rebuttal — slot C

One disagreement: the Q2 pick. I hold 2b.

## D1 — 2b is the reduce-first option, not 2a

**Misstatement:** "2b adds package-manager policy the explicit setup key already covers." Two errors:

1. The policy exists today — it lives as prose in `skills/init-akrogon/SKILL.md:43`, re-typed into every consumer's `setup:` at init time. Grep confirms zero lockfile handling anywhere in `src/` — no code policy exists to "add"; 2b moves an existing mapping from doc prose into one verb and deletes the prose. Net: config shrinks (no `setup:` line for the common case), SKILL.md:20/28/43 shrink, consumer files shrink.
2. "The explicit setup key already covers it" is the defect, not the coverage. Gljive proves it: the key's absence — caused by init proposing `setup` only when HEAD lists a lockfile, before Gljive had one — produces a config that cannot pass by construction. A key that must be maintained in lockstep with the tree is a stale-copy bug factory; 2b removes the copy.

**Operator-values misread:** "operator asked to reduce code first" — 2a keeps the duplicated state permanently and pays it off with a better error message; 2b deletes the duplication. Reducing code means removing the requirement, not documenting it better.

## D2 — missed pitfall (applies whichever of 2a/2b wins)

Receipt matching may bind runs to the setup command string. `greenRun`/receipts key on tree + command set; if the setup wrapper string participates, changing it (2b's new `akrogon install` prefix — and any future wrapper change) orphans old receipts and forces re-verifies. Done-criterion for the leaf: inspect the receipt comparison before landing; if the wrapper string participates, either exclude it or accept re-verification and say so. Not in the merged pitfalls.

## D3 — minor: "one unconditional message" under 2a is already covered by 2b

Under 2b, `akrogon install` emits exactly that message when it can't derive (`package.json` present, no lockfile → "set setup in issues/config.yaml"), and no-ops when neither exists. So 2a is not an alternative to 2b's fallback — it is the subset of 2b that never fixes anything. If slot A still prefers 2a, at minimum keep the no-lockfile derivation rule inside the verb so the fallback and the fix share one code path.

## Conceded / no disagreement

- Q1 pick, placement, and pitfalls stand as merged. B's init-ordering note is confirmed: `writeRepoConfig` (init.ts:62) precedes `worktreeStore` (init.ts:69), so a throwing store must be resolved before the first write — or the skill must simply stop proposing in-checkout roots, which the pick already requires.
- Q3 stands.
- `akrogon config` throwing on refusal: A's answer (throws like any config error, one path) is accepted.
