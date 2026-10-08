# Leaf split — blind Slot B notes

Read only Intake, Leaf split Question/Carries, Names Taken, Blocked report Taken, and repository code/tests/docs. No A notes, merged notes or Leaf split Findings read. Evidence inspected 2026-10-08.

## Q1 — One leaf or two parallel leaves?

### 1. Pick, reason and cost

Recommend two parallel leaves under one standalone issue, with no blocked-by edge between them:

- **L1 — Name selection:** resolve open epic and issue names alongside existing leaf slugs and paths, preserve cwd-folder precedence, reject every ambiguity before allocation, preserve discovery errors, and update target examples including same-name issue/leaf path guidance.
- **L2 — Selected-leaf diagnostics:** report manual selections consistently for failed phase, unmet dependencies and missing inputs, with the locked priority, timing, automatic-pass behavior, merged exclusion and sibling progress.

Each outcome works without the other. L1 can prove an epic or issue name starts ready leaves without changing wait reporting. L2 can prove all diagnostic categories through today's folder paths, leaf slugs, bare next and --all without adding owner-name lookup. Both change one destination, and the supplied door rule permits independently checkable parallel leaves. No product or implementation prerequisite orders them.

Cost: both touch src/next.ts, tests/next.test.ts and likely docs/guide/next.md, so landing may require conflict resolution and combined verification. Two leaf lifecycles also cost more coordination than one. That cost is real, but does not justify a dependency edge.

### 2. Rejected options and reasons

- **O1 — One leaf because both change next:** one leaf is viable and reduces merge coordination, but it bundles two separately demonstrable outcomes. Shared files alone do not establish a dependency under the door rule. The rule permits this split, rather than requiring it. Recommend parallel leaves because their acceptance scenarios are independent.
- **O2 — Diagnostics blocked by name selection:** paths already select multiple leaves. Diagnostic subjects are selected leaf identities, not a new owner-name type. L2 does not need L1's resolver.
- **O3 — Name selection blocked by diagnostics:** owner lookup can deliver its target set to the existing dispatch flow. Ready fixtures prove selection and collision refusal independently of new diagnostics.
- **O4 — Two standalone issues or an epic:** Intake already settles one standalone issue in one destination. The split concerns its leaves, not a new owner structure.
- **O5 — A third integration or documentation leaf:** neither is a separate requested outcome. Keep docs and regression coverage with the behavior they describe, and verify composition on the combined landing.

### 3. Evidence, tier, source and date

- **Operator tier:** Intake requests two behaviors, accepting owner names and reporting blocked selections. Names Taken settles lookup semantics; Blocked report Taken separately settles diagnostic semantics. Neither lock requires the other outcome to exist first.
- **Operator tier:** the supplied door rule says independently checkable outcomes in one destination may be parallel leaves and only an actual dependency orders work, never file overlap.
- **Primary repository source:** src/next.ts:1167-1207 resolves a Selection containing repo and leaves. src/next.ts:1247-1257 dispatches that result. Owner-name matching belongs at the selection boundary; diagnostic behavior consumes the same leaf records downstream.
- **Primary repository source:** src/next.ts:698-717 sweeps inventories and leaf arrays without owner-name resolution. :1260-1270 implements --all inside or outside a registered repo. These are existing surfaces on which L2 can be completed and checked independently.
- **Primary repository source:** src/next.ts:618-643 contains merged completion, failed skipping, dependency checks and input checks. src/turn.ts:8-20 orders dependencies before inputs. These mechanisms do not require changing name lookup.
- **Primary repository tests:** tests/next.test.ts:103-118 exercises explicit leaf-folder and worktree paths. :1204-1217 already combines missing and readable unmet dependencies with a healthy sibling through --all, proving the fixture can test diagnostics without new owner names.
- **Primary repository docs:** docs/guide/next.md documents path selection, bare next, --all and scheduling waits. docs/guide/parts.md:34-55 shows same-name issue/leaf pairs and nested owner structure. Each leaf has a distinct documentation responsibility even where the file overlaps.

All sources above were inspected locally on 2026-10-08. This is a repository split decision grounded in its current interfaces and operator locks, with no external operation or outside service to research or probe.

### 4. Pitfalls and what removes each

- **R1 — L2 accidentally depends on L1's new resolver.** Define reporting subjects from the existing selection/inventory boundaries, retaining the existing Selection contract. Its independent acceptance scenario uses a folder target and --all.
- **R2 — Each leaf implements part of the other's behavior.** Give L1 lookup, ambiguity and target docs. Give L2 reporting subjects, dispatch diagnostics and wait docs. Neither changes the other's locked semantics or introduces a shared-refactor prerequisite.
- **R3 — Shared-file conflicts are mistaken for scheduling dependencies.** Use separate worktrees and reconcile the overlapping diff at landing. Verify the resulting behavior after resolution rather than adding blocked-by merely to avoid a conflict.
- **R4 — Independent tests pass while their composition fails.** On the combined code, run the locked epic-name scenario with ready, dependency-blocked, input-blocked and failed leaves. Check ready delivery, three diagnostic records and exit 1. L1 can independently use a ready-only named epic; L2 can independently use the same mixed tree by path. The combined scenario verifies composition without creating a third leaf or an ordering edge.
- **R5 — Docs retain conflicting claims.** L1 updates name/path forms and the same-name example in parts.md. L2 updates manual reporting, automatic silence and failed-leaf behavior in next.md. Review the final page once the changes are combined.

### 5. Questions the fork is missing

No additional material product decision is needed. The two locks already settle the behavior. The leaf contracts should state their independent acceptance scenarios and documentation ownership explicitly so the implementers do not infer a dependency from file overlap.

This recommendation is not an operator answer.
