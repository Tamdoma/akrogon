# Design names "existing capture tools" without a driver case

Date: 2026-11-17. Case: framework leaf serp-wireframe-e2e, plan.synthesis slot A, base 90ce3d5eb9.

The leaf design's Leaf architecture said criterion 2 "runs one stage capture per model stage (IA `targeted`, wireframe add, SEO planning, write-content prep) with existing capture tools", and the interpretation said the leaf "builds no machinery". At planning no existing driver case covered those stages: `capture-ia.ts` accepts only `--case buffalo|national|ecommerce|titles`, `--audit`, `--keyword-intent` on the blueprint routes; `capture-wireframes.ts` seeds only fresh committed cases; `capture-seo-planning.ts` stages fixed inputs; no driver runs write-content prep on IA-spine inputs; `phase-capture.ts` is a library with no entry. Criterion 3 (rerun wireframing on a mid-build old-format state) had no seeded re-entry case either. Under the standing machinery line the plan seat stopped with `failed` for new proof machinery.

Evidence: `issues/open/serp-wireframing/serp-wireframe-e2e/plan.md` (Blocker) in the framework repo.

Learning: when a chart design says a fresh model stage runs "with existing capture tools", the design should name the driver file and case (or flag that a machinery leaf is needed) at charting; a tool family existing is not a case existing. Judgment lesson about chart design review; no check refused valid work, so nothing is filed.
