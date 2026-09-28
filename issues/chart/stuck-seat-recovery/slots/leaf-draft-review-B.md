# Disagreements

## F1 · same-repo-worktree-cwd: the recorded decision does not establish all-session dialog removal

`same-repo-worktree-cwd.design.md:6–9` labels a broader paraphrase as verbatim and uses it to remove confirmations in attended sessions. The actual Question and Taken cover an unattended seat and explicitly mention passing the signal to remaining confirmations (`/home/ivan/Work/infra/akrogon/issues/chart/stuck-seat-recovery/forks/restart-hung-seat.md:4`, `:28`). Current code distinguishes UI availability, not attended operation (`/home/ivan/.pi/agent/extensions/tamdoma-subagents/tools.ts:97`). The draft's scope expansion may be sensible, but it needs a recorded binding decision rather than implementer inference.

Replace the design's Q1 Answer through Interpretation with:

> Answer: A. In an unattended seat, approve by rule a worktree of the same repository, fail fast with the existing error otherwise, and pass the tool signal to any remaining confirm.
> Reason: the seat never waits on a human it was launched without.
> Foreclosed: serialized dialogs that still wait for a human.
> Scope unresolved before handoff: the draft proposes applying this rule to every session and removing confirmations and the outside-approval cache entirely. Record explicit authorization for that broader rule, or settle how unattended operation is identified and preserve cancellation-aware attended confirmation. Do not leave this choice to the implementer.

If the broader wording was approved in another operator exchange, record that exchange in Taken and cite it instead. The brief's universal no-dialog criteria and cache removal must follow that settled scope.

## F2 · same-repo-worktree-cwd: common-directory equality is not sufficient to identify a worktree, and every Git failure is not “not a repository”

The proposed lookup at `same-repo-worktree-cwd.design.md:32` accepts Git metadata directories as well as worktrees. Read-only verification on the live checkout: `git -C /home/ivan/.pi/agent/extensions/.git rev-parse --path-format=absolute --git-common-dir --is-inside-work-tree` returns `/home/ivan/.pi/agent/extensions/.git` and `false`. A parent in a linked worktree therefore matches that outside-root metadata directory under the proposed equality rule. This exceeds the worktree exception in Taken at `restart-hung-seat.md:28`. Absolute paths also need canonical identity comparison consistent with the existing realpath/normalization helpers (`/home/ivan/.pi/agent/extensions/tamdoma-subagents/paths.ts:14`, `:25`). The same design sentence incorrectly collapses all nonzero Git exits into an expected absence, losing diagnostics for configuration, access and repository failures.

Replace the `tools.ts` owned-surface bullet with:

> `tamdoma-subagents/tools.ts`, `resolveApprovedCwd`: canonicalize the requested cwd and preserve the existing inside-parent rule. For the outside-parent exception, require both paths to be inside Git working trees and compare their canonicalized absolute Git common directories. A subdirectory of an eligible working tree is eligible. Git metadata directories and bare repositories do not qualify for the outside-parent exception. Treat only a positively identified not-a-repository result as absence. Propagate other Git failures with the command, cwd, exit status and stderr. Apply the settled session-scope policy from Q1 to an ineligible cwd.

Append to the brief's criteria:

> Verify that the common Git metadata directory outside a linked-worktree parent is refused, that canonical aliases of the same eligible working tree compare equally, and that an operational Git error retains its diagnostic rather than becoming a not-a-repository refusal.

## F3 · admission-fault-no-block: the real-handler test needs an isolated, available integration fixture

Criterion 3 references an installed file that is not tracked in pi-extensions (`git ls-files --error-unmatch herdr-agent-state.ts` reports no tracked file). A leaf worktree does not supply it. The module captures Herdr environment variables at import (`/home/ivan/.pi/agent/extensions/herdr-agent-state.ts:11`), registers no handlers unless enabled (`:179`), ignores session startup outside TUI mode (`:232`), and sends reports to a socket (`:40`). Existing admission-test context lacks both TUI mode and `isIdle` (`/home/ivan/.pi/agent/extensions/tamdoma-subagents/index.test.ts:240`). Simply calling the existing test's handlers cannot meet the criterion, and inheriting the live pane environment could report fake state to the real Herdr session.

Replace criterion 3 with:

> Run an isolated integration test using the installed `herdr-agent-state.ts`, resolved from the registered pi-extensions root rather than the leaf worktree. Fail explicitly if that prerequisite is absent. Before importing it in a separate test process, set `HERDR_ENV=1`, a synthetic `HERDR_PANE_ID`, and `HERDR_SOCKET_PATH` pointing to a test-owned local socket. Register the real integration and subagent extension on the same test event bus, emit a TUI `session_start`, drive the admission fault, then emit `agent_settled` with `isIdle() === true`. Capture and acknowledge socket requests, assert that the reported state is idle without a subagent-generated blocked claim, and save the observations under the OS temp directory. Never connect the fixture to the live Herdr socket. Record the artifact path in the implementation report.

Add to the design's test ownership:

> `tamdoma-subagents/index.test.ts` and a test-only subprocess fixture may exercise the installed integration read-only. The fixture owns its temporary socket, environment and process cleanup. No copy or modification of `herdr-agent-state.ts` is required.

## F4 · admission-fault-no-block: the episode-lifetime claim and second test location are wrong

The brief says the episode ends only at disposal. Late successful shutdown removes the rejected retirement and updates the fault (`/home/ivan/.pi/agent/extensions/tamdoma-subagents/manager.ts:1132`), which emits inactive when impossible admission clears (`:1232`). Also, `index.test.ts:401` belongs to the child-question harness, not the admission-fault test. Its blocked-event recording supports preservation of genuine human claims (`index.test.ts:526`), which this leaf must retain.

Replace the first sentence of the brief's Why with:

> `index.ts:133–134` holds a `herdr:blocked` claim while the manager's impossible-admission episode remains active. A late successful shutdown can clear the episode, but in #32 it remained active after the parent finished its phase.

Replace the design's Tests bullet with:

> Tests: update the admission-fault regression beginning at `tamdoma-subagents/index.test.ts:193` to assert no subagent blocked events and one notification per episode, including teardown and late-success coverage. Preserve the child-question harness at `:401` and its genuine-human-blocked-claim regression at `:526`.
