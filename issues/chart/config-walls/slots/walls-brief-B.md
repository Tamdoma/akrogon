# Fork-notes brief: config-walls / walls, slot B

You are consultant slot B for the chart door (slot A). Work blind: do not read any other slot's files under /home/ivan/Work/infra/akrogon/issues/chart/config-walls/slots/ except your own earlier map (/home/ivan/Work/infra/akrogon/issues/chart/config-walls/slots/map-B.md), and do not read /home/ivan/Work/infra/akrogon/issues/chart/config-walls/forks/walls.md Findings. Read-only: no repo writes, no consumer changes.

## Reading rule
Read process text by named section: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content changed since you read it, and content lost to compaction stay readable; the full source stays allowed when the source is the subject of the work. Name sections, never line ranges. This rule binds process text only; choose your own code evidence freely.

## Context
- Intake (verbatim reports #113, #114, #115 and operator words): /home/ivan/Work/infra/akrogon/issues/chart/config-walls/INTAKE.md
- Repo: /home/ivan/Work/infra/akrogon at HEAD (release 92dddada lineage).
- Operator values for picks: simplicity, function over form, removing over adding ("Always see if you can reduce code first rather than just cramming new complex code on. Keep the code lean."), systems thinking, speed and price.
- Related fork paths: none outside this chart. Sibling chart (handed off, do not edit): /home/ivan/Work/infra/akrogon/issues/chart/run-check-fidelity.

## Questions (verbatim from the fork)

Q1. How should akrogon handle a `worktree_root` that resolves inside the registered checkout, which trips `checkLocation` once the checkout root holds package.json (#114, #115 duplicates)? Candidates: (a) refuse an in-checkout `worktree_root` at config read, naming the key, and delete init's in-checkout gitignore line and the setup.md sentence that sanctions it; (b) keep the key, migrate the consumer to the default store and only clarify docs; (c) delete `worktree_root` entirely (tests use it as a fixture seam).

Q2. How should akrogon handle a repo with package.json and no `setup`, where verify's setup step is `akrogon guard own-modules` and always fails (#113)? Candidates: (a) when `setup` is unset, the own-modules refusal names `setup` in issues/config.yaml as the fix; (b) derive the installer from the committed lockfile when `setup` is unset; (c) no akrogon change, consumer adds `setup`.

Q3. One leaf or two?

### Carries
- Lock 2026-10-10, issues/closed/worktree-isolation/worktree-store/design.md, Boundary 2a: leaf worktrees live in one akrogon-owned store outside every checkout; ancestor guard refuses when a canonical ancestor holds node_modules or package.json, or the worktree's own node_modules is missing.
- src/reconcile.ts already treats `<root>/issues/worktrees` as a legacy root (reconcileNeedsPanes, sweep roots); src/next.ts ensureWorktree refuses a recorded path that differs from `<store>/<slug>` with a move instruction.
- Gljive (CastrumS/gljive) is on another operator's machine; akrogon cannot edit its config.
- Operator corrections: none.

## Task
Return blind notes per question (Q1, Q2, Q3), each with five parts: (1) your pick with reason and cost; (2) each rejected option with its reason; (3) evidence with tier (better-than-training for inspected code/docs, model-knowledge only with the searches that found nothing stronger), source path or URL, and date; (4) pitfalls with what removes each (a part of the option, a probe, a done-criterion, or an operator step); (5) any question you would ask that the fork does not. You may propose an option not listed. Be concise.

Write the return to exactly: /home/ivan/Work/infra/akrogon/issues/chart/config-walls/slots/walls-B.md
