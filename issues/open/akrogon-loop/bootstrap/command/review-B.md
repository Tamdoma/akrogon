# Review B: command

Reviewed branch `command` at `6d904ab313622de661f664893a01ec0d0b3f9c39` against `main` at `6e505a9ffeea195beb05826bb8f71e9e67281540`, including the full `main...HEAD` change set and current worktree. Re-read authoritative `state.yaml` (`check.review`), `plan.md`, `implementation/brief.md` and the leaf's original done-criteria. This is an independent slot B review. No peer review was read. No code or state was changed.

## Findings

### F1. High: merge recovery takes completion away from a still-working merge pass

**Surface:** `src/next.ts:127`, `src/phase.ts:56`.

`dispatchLeaf` calls `recoverMerge` before inspecting whether the merge agent is working. Once the pushed leaf head is on the remote default branch, an unrelated hook or startup sweep can write `merged` and print the issue-complete signal while slot A is still finishing its merge pass. Slot A's subsequent normal `akrogon phase <slug> merged --slot A` then fails with `Merged is terminal`. The completion signal went to the plugin's recovery invocation instead of the active merge pass that needs it for the issue-completion handoff.

**Basis:** Reproducible defect in the done-criteria 3, 4 and 6 completion/recovery flow. Ancestry recovery must handle an interrupted pass without interrupting a live one.

**Reproduction:** In a temporary Git repo, dispatch leaf `build`, commit in its real worktree and push that head to a temporary bare `origin/main`. Set the fixture leaf to `merge` and its A pane to `working`. Invoke the hook through `next` with that pane ID, then invoke the normal phase command from the worktree. Herdr is substituted using the existing fixture executable.

Observed:
```text
next exit: 0
next stdout: moved merged / issue complete issue
authoritative phase: merged
merge pane status: working
normal phase build merged --slot A exit: 1
normal phase error: Merged is terminal
```

**Required repair:** Check the responsible live merge pane before ancestry recovery. Defer recovery while its merge pass is working. Retain recovery when the pass has stopped or exited. Add a regression covering the post-push, pre-phase interval and verify the active pass retains its successful completion call.

### F2. Medium: a queued working event consumes another dispatch attempt

**Surface:** `src/next.ts:164` and `src/next.ts:75`.

The hook never reads `HERDR_PLUGIN_EVENT_JSON`. It relies only on the pane's current status. If a `working` event is processed after that pane has returned to idle, it sends another prompt and increments attempts. The event can wait behind the machine lock, so the emitted status and the later observed status need not match. This spends the retry budget on an event that the design explicitly excludes and can cause early peer handoff or failure.

**Basis:** Done-criterion 6 and the binding Repeat Safety rule carried into plan D6: a working event never counts an attempt.

**Reproduction:** Dispatch a `plan.synthesis` leaf once. Leave its phase/done unchanged, set its fake B pane to idle, and invoke `next` with B's `HERDR_PANE_ID` and a `pane.agent_status_changed` event whose `agent_status` is `working`.

Observed:
```text
next exit: 0
attempts.B before: 1
attempts.B after: 2
captured prompts: 2
```

**Required repair:** Parse the hook event at the boundary and exclude working notifications from retry accounting and re-prompting, even when live pane status has changed. Preserve explicit dispatch and the idle/exit wake-up paths. Add the delayed-event regression.

### F3. Medium: valid leaf slugs do not produce valid, unique Herdr agent names

**Surface:** `src/next.ts:99`, `src/state.ts:10`, `tests/fake-herdr.ts` agent-start handling.

Agent names are only `<slug>-<slot>`, although leaf slugs are unique within a repo and `max_active` spans repos. Two registered repos with a `build` leaf both start `build-b`. The substituted Herdr accepts this, but real Herdr rejects the second launch with `agent_name_taken`. The same construction rejects otherwise-valid numeric-leading slugs and slugs longer than 30 characters because Herdr names must start with a lowercase letter and be at most 32 characters.

**Basis:** Done-criterion 6 requires dispatch across registered repos and launch of the selected leaf. The design constrains slug uniqueness to the repo, not the machine.

**Evidence:** A temporary two-repo invocation captured `startNames: ["build-b", "build-b"]`. The local Herdr source at `/home/ivan/Work/infra/herdrdev/herdr/src/app/agents.rs`, `valid_agent_name` and `agent_start_error_body`, confirms the name grammar and the `agent_name_taken` rejection for `AgentStartError::DuplicateName`. No real agent was launched during this review.

**Required repair:** Generate bounded, valid names that are unique across the live Herdr session, using the allocated pane identity or equivalent existing identity. Preserve the leaf slug in the tab label and prompt. Make the thin Herdr test substitute enforce name validity and uniqueness, then cover equal slugs in two repos and a numeric-leading or long valid leaf slug.

### F4. Medium: required installation and live hook acceptance evidence is absent

**Surface:** `implementation/brief.md`, report's Unverified criteria; `plugin/herdr-plugin.toml` and installer acceptance.

The report explicitly says neither the hand-verified installation nor the fixture-pane hook exercise was performed. Reading Herdr help/source and testing a substitute do not demonstrate that the installed plugin links and delivers the event in the actual environment.

**Basis:** Original done-criteria 7 and 8 explicitly require the hand install and a fixture-pane status-change invocation pasted into a review file. This is an acceptance gap, not an assertion that installation fails.

**Required completion:** After the operator removes the conflicting old install paths, perform the specified installation and harmless fixture-pane hook check. Record actual commands, exits, link targets and observed hook invocation. Do not replace this with an install unit test. This review did not alter install roots or real Herdr panes.

## Verification and scope

Executed against the reviewed worktree:
```text
bun test
13 pass
0 fail
114 expect() calls
Ran 13 tests across 4 files. [5.17s]
Exit: 0

bun run typecheck
$ tsc --noEmit
Exit: 0
```

Additional temporary command-level reproductions produced the F1–F3 evidence above. They used existing fixture helpers, real temporary Git repositories and substituted Herdr. Temporary reproduction files and repositories were removed afterward. The existing suite does not cover F1/F2 and does not enforce Herdr's name contract for F3.

The scoped config migration, old-script deletion, typed phase routes, process-race tests, verdict aggregation, repair cap, atomic state writer and diagnostic log behavior are present. The deferred status/pull/GitHub-close/notification features were not added. The reported fresh-base behavior of `akrogon config` satisfies the config criterion, although a running harness's original environment remains unchanged as disclosed. No finding is based only on slot B's earlier design preference.

The worktree remained clean. The authoritative state remained `check.review`. This file is the only review artifact written.

fix
