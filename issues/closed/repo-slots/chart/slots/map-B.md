# Repo slots: independent territory map B

## Recommendation

Add one optional repo field, `slots`, with optional lowercase `a` and `b` entries. Each supplied seat is a complete `{harness, model, effort}` triple. An omitted seat inherits the machine seat. Keep harness command templates, integration installation and capacity global. Resolve once through a shared configuration function used by config output and dispatch.

This is a proposal, not a recorded operator choice. It changes seat selection without introducing a command, phase, file or automatic restart. The current selector is concentrated in `src/next.ts:218-225`, called when an agent is absent at `src/next.ts:429-445`. The repository schema currently has no slots field (`src/config.ts:26-45`).

## What stays global and what becomes overridable

| Setting | Proposed home | Reason and current evidence |
| --- | --- | --- |
| Default A/B harness, model, effort | Global, unchanged | Existing required triples and global harness validation: `src/config.ts:9-24`. |
| A/B selection for one repo | Optional repo slots field | Repo config is already read from the registered root: `src/config.ts:67-73`. |
| Harness command templates and flags | Global only | Launch interpolates the global template: `src/next.ts:220-225`. |
| Herdr integration installation | Machine-wide, unchanged | Install covers every global harness key, not just the two selected seats: `src/install.ts:51`. |
| max_active | Global only | Existing allocation checks the shared active count: `src/next.ts:262,298`. Repo rejection is tested at `tests/config.test.ts:58-61`. |
| toolkits and registered repo paths | Global only | Defined globally at `src/config.ts:16-17`; init updates them at `src/init.ts:60-64`. |
| Branch, checks, grounding, worktree root, rebuttal, repair cap | Existing repo settings | Already defined at `src/config.ts:26-44`; no relocation needed. |
| Phase roles and required seats | Routing, unchanged | Harness selection is separate from skill/phase selection: `src/next.ts:420,430`. |

Example addition to an existing repository config, using placeholder values rather than promising model availability:

```yaml
slots:
  b:
    harness: pi
    model: YOUR_AVAILABLE_MODEL
    effort: YOUR_SUPPORTED_EFFORT
```

A inherits the machine default. B uses the whole supplied triple. Removing B's entry restores inheritance. The existing repo config file stays the location, as documented in `docs/guide/setup.md:41-47`; changing a real repo's issue configuration is an operator action on main, not part of the implementation branch.

## Material forks

### Q1. Can a repo replace one complete seat, or just individual fields?

Research: operator tier, supplied intake dated 2026-09-20, asks for per-repo control with unchanged defaults and minimal complexity. Better-than-training tier, `src/config.ts:9,14` and `src/next.ts:219-224`, inspected 2026-09-20: a seat is already one strict triple and all three values participate in launch.

- **A (recommended): replace complete seats independently.** Require harness, model and effort when A or B is present. Missing A or B inherits globally. Reuse the existing triple schema.
- **B: merge individual fields within each seat.** A repo can set only B's model. This saves YAML, but a harness change can inherit an incompatible model or effort from the global seat.

Reason: A adds one inheritance rule at the seat boundary and keeps the launch tuple explicit. It still lets one seat change without copying the other.

Pitfalls: A pins all three fields of an overridden seat, so later machine changes do not update that seat. Reject null, misspelled seat names and incomplete triples rather than silently treating them as inheritance. An empty slots object can simply inherit both seats.

### Q2. Does “harness and everything else” include repo-specific command templates?

Research: operator tier, intake seeks a small per-repo choice rather than a new configuration system. Better-than-training tier, `src/install.ts:51`, `tests/install.test.ts:31-53` and `src/next.ts:220-225`, inspected 2026-09-20: installation already covers all declared machine harnesses, and launch requires the first token to match the chosen harness.

- **A (recommended): repos select harness/model/effort from machine-installed harnesses.** Command templates and permission/tool flags stay global.
- **B: also permit repo-specific launch templates or arbitrary flags.** That needs further schema and installation rules, and expands what a repo can change about execution.

Reason: A satisfies model and harness selection with the existing installation mechanism. A harness need not be used by either global seat to be installed, as the installer test's third harness demonstrates.

Pitfalls: “Known template” does not prove a model is available or credentials are valid. Do not invent provider-model validation or read secrets for this feature. If the operator actually needs repo-specific flags, record that as additional scope before handoff.

### Q3. When does an override affect an agent that is already running?

Research: better-than-training tier, `src/next.ts:408-430,454-456`, inspected 2026-09-20: dispatch preserves existing agents, waits around busy seats, and calls launch only when the pane has no agent.

- **A (recommended): apply on the next agent start.** Reuse current sessions unchanged. Explain that a config edit does not switch an already-running seat, even if that seat is idle.
- **B: reconcile existing sessions with the new settings.** Restart or replace them when a mismatch is detected.

Reason: A preserves existing behavior and conversation continuity. B needs a restart policy and reliable knowledge of the running model/effort, beyond the current selector.

Pitfalls: “Next phase” and “next dispatch” do not necessarily mean a new process. After editing configuration, effective settings describe future launches, not an inventory of the current processes. No automatic killing, state snapshots or per-leaf model history is needed for A.

### Q4. Should config output show the resolved pair or only the raw repo override?

Research: better-than-training tier, `src/config.ts:117-131`, inspected 2026-09-20: effectiveConfig currently shallow-spreads repo values over global ones. `tests/config.test.ts:37-48` covers outside-repo output and worktree resolution.

- **A (recommended): print the complete effective A/B pair and use the same resolver for dispatch.** Outside a repo, print the machine pair. Inside a linked worktree, resolve the registered checkout's settings.
- **B: print the raw override in slots, leaving the user to combine it with machine defaults.** Launch would still need resolution, making displayed and launched values harder to compare.

Reason: A keeps the existing purpose of the config command: show what will be used.

Pitfalls: the current spread cannot merge a B-only override correctly. It would replace the whole global slots object. Do not fix display and launch with two independent merge implementations. Do not save the resolved pair back into repo YAML: that would turn inherited defaults into pinned settings.

### Q5. Should an unknown repo harness be refused before setup or dispatch changes anything?

Research: better-than-training tier, `src/config.ts:19-23,67-73`, `src/init.ts:31-45` and `src/next.ts:228,430`, inspected 2026-09-20: global seat references are validated today, repo parsing has no global context, and launch happens after allocation work.

- **A (recommended): validate selected repo harness names against the machine template registry at the configuration boundary.** Init validates before its first write. Reading effective repo settings for dispatch rejects an invalid override before allocating work.
- **B: let launch fail when it first uses the override.** Smaller local edit, but malformed config can get as far as worktree/tab allocation and fail only when that seat is needed.

Reason: A makes invalid configuration a setup error and preserves useful diagnostics. Name the repo, seat and missing harness.

Pitfalls: the standalone repo schema can validate the triple's shape but cannot prove the machine registry contains its harness. Reuse a shared resolver/validator where both configs are available. Keep strict rejection of unknown fields and preserve launch quoting and the first-token check.

## Practitioner questions for the operator

- **P1:** Is a full three-field override for one seat acceptable, or is changing only a model the main daily use case? This decides Q1.
- **P2:** Does “everything else” mean effort as well as model/harness, or also permissions and extra CLI flags? The latter expands Q2.
- **P3:** Is it acceptable that existing sessions keep their original settings until another agent start? This decides Q3 without adding restart machinery.
- **P4:** Should these choices travel with the repo to other machines? The proposed home is committed repo configuration, so each machine must define the selected harness key. Current location and registry are `src/config.ts:64,72`.

These are questions for the attended round, not blockers to producing this map.

## Implementation pitfalls and verification

- **R1: setup can pin defaults accidentally.** Init writes the parsed proposal rather than merging it with the old file when a proposal is supplied (`src/init.ts:31-36,45`). The setup skill preserves effective choices and supplies a complete proposal (`skills/init-issues/SKILL.md:16-20`). Teach it to preserve actual stored overrides without copying inherited effective slots into a new proposal. No-argument repeat init should retain existing overrides.
- **R2: registered-root authority must survive worktrees.** Repository discovery uses the shared Git directory and reads config from the registration (`src/config.ts:90-100`). Test override output from both main and a linked worktree, using the existing worktree test at `tests/config.test.ts:42-55`.
- **R3: test argv, not only config text.** The fake Herdr records actual starts; existing timeout coverage inspects them at `tests/next.test.ts:1711-1719`. Assert the selected kind and model/effort arguments for A and B, including values needing quoting. Use two repos with different overrides to catch leaked global mutation.
- **R4: preserve defaults and refusals.** Test no override, one complete seat, both seats, empty override, removing an override, unknown harness, incomplete triple, wrong seat key and null. Invalid init must preserve existing files and registration. Existing fixtures define different A/B values at `tests/helpers.ts:24-28`, useful for inheritance assertions.
- **R5: no installation expansion is required for Q2-A.** Keep the global integration test at `tests/install.test.ts:48-53,78-81` unchanged in behavior. No scan of every repo during install.
- **R6: explain the activation boundary where users configure it.** Add the optional setting and next-start rule to `docs/guide/setup.md:49-63`; add a compact example near `docs/guide/cheat.md:20-26`. Review README's configuration explanation as part of the same leaf.

## Proposed leaf and boundary

One akrogon leaf should own schema, resolution, launch wiring, init validation, setup skill wording and documentation together. Splitting display from launch would create an avoidable period when they disagree.

Proposed owned surfaces: `src/config.ts`, `src/next.ts`, `src/init.ts`, relevant existing config/init/next tests, `skills/init-issues/SKILL.md`, README, setup and cheat pages, and affected AREA/index entries. Inspect install and its tests as compatibility checks; no installer change is expected under Q2-A.

No changes to actual `issues/` records on the leaf branch, global machine settings, credentials, phases, new commands or watcher behavior. The output artifact requested for this blind pass is the only file written now.

## Challenge check

The strongest challenge to Q1-A is ergonomics: a model-only override is easier to type. Choose field-level merging only if that convenience outweighs the risk of inheriting an incompatible tuple when a harness changes. The main technical requirement is independent of that choice: config output and actual launch must use the same resolved pair.
