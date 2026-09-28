# Leaf draft review C

Read 2026-09-28 against akrogon HEAD, `skills/watch-issues/SKILL.md`, `skills/watch-issues/scripts/observe.ts`, `src/next.ts`, `src/phase.ts` and the installed herdr CLI. Only disagreements follow. Both designs' binding decisions match the fork Taken sections verbatim.

## owner-defect-stop

D1. Criterion 5 is unverifiable as written. The observer needs a registered repo. `observe.ts:241` calls `akrogon config` and `:122-123` throws `repo "none"` for an unregistered root, and `:247-248` rejects a leaf whose `repo` key differs. A fixture repo under the OS temp dir is not registered. The observer test solves this with stub binaries (`scripts/observe.test.ts:32-38`) through `OBSERVE_AKROGON` and `OBSERVE_HERDR`, which `SKILL.md:24` allows for tests only. Replacement for criterion 5:
"A walkthrough applies the edited Judge and Stop rules to the observer output of a fixture repo with one leaf failed on an owner defect and one dependent blocked by it, run with `OBSERVE_AKROGON` and `OBSERVE_HERDR` stub binaries as in `scripts/observe.test.ts`. The observer output and the resulting action (stop plus one notification) are saved to a file under the OS temp dir, and the implementation report records that path."

D2. Criterion 3 lists a bare "merged" leaf as a stop state. A merged leaf under open whose siblings are all merged is completed by `next` (`SKILL.md:37`, `src/next.ts:527-530`). It is only stuck when a sibling is such a failure or waits on one. If its `next` hit a command error this fire (`SKILL.md:41`), the bare wording would stop the watch and delete the cron with that leaf still open. Replacement for the first sentence of criterion 3:
"The Stop rule (`SKILL.md:43-45`) also fires when every remaining leaf is failed on a human prerequisite with shown evidence, or is merged or waiting and every unmerged prerequisite or sibling it waits on leads, directly or through other waiting leaves, to such a failed leaf."

D3. Criterion 2 should name the error it removes, or the implementer cannot check it. `src/next.ts:536-539` throws `Leaf dependencies are not merged` only for an explicit single slug, and `next --all` returns waiting silently. Under the current `:36` a single blocked leaf named explicitly triggers the command-error rule at `:41` and blocks every other mutation that fire. Replacement for criterion 2:
"The Waiting rule (`SKILL.md:36`) runs no `akrogon next <slug>` for a leaf whose `blocked-by` names an unmerged leaf, because `src/next.ts:536-539` rejects it and the command-error rule would end the fire. It reports the leaf as waiting on that prerequisite."

D4. Criterion 4 and the `:38` notice can both fire for one failure. `:38` shows a notice when `failure.delivery` is not `shown`. Criterion 4 shows a second one at stop. The Taken says the watch "notifies once". `src/phase.ts:51-70` already records `delivery` from akrogon's own notice, so `:38` only covers a failed akrogon delivery. Add one sentence to criterion 4:
"For a failure of this class the `:38` notice is not run, the stop notice is the one notice, and when the Stop rule cannot fire the `:38` rule applies unchanged."

## create-peer-panes

D5. Criterion 5 runs `herdr agent start` in the verification tab. The "documented sequence" in criterion 2 includes one `agent start` per peer, so the verification would launch two harness agents to capture a layout. `pane layout` takes only `--pane` or `--current` (installed CLI), and `tab create` returns the root pane as `.result.root_pane` (herdr skill :89). Replacement for criterion 5:
"A verification in a tab it creates with `herdr tab create --no-focus` runs only the two split commands against `.result.root_pane`, saves `herdr pane layout --pane <root pane>` output showing the root pane left, B top right and C bottom right to a file under the OS temp dir, then closes only that tab with `herdr tab close <tab_id>`. The implementation report records the path."

D6. Criterion 1 names `HERDR_ENV=1` but the Open section has no herdr detection today (`skills/chart-issues/SKILL.md:23`). The installed herdr skill checks `test "${HERDR_ENV:-}" = 1` (herdr skill :13), so the marker is right, but the criterion should say where the door reads it. Replacement for the start of criterion 1:
"The Open section and the blind peer exchange say: when the operator asks for B (and optionally C) without naming panes, and the door's own environment has `HERDR_ENV=1`, the door asks once for each created peer's harness kind and arguments."
