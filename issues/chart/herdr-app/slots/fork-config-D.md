# Fork notes config: slot D

Practitioner sources: none searched; no web access in this seat. Harness claims use their installed `--help` and live argv/config read on 2026-11-07.

## Q1. Codex

Pick: Add `--no-daemon` to the leaf `harnesses.codex` entry and keep `-a never -s danger-full-access` for leaf seats. In parallel, keep the already-proven consultant launch recipe separate in the seat record: `codex --no-daemon -m <model> -c model_reasoning_effort=<effort> -s workspace-write -c sandbox_workspace_write.network_access=true -a never`.

Reason: `--no-daemon` is mandatory for work to execute inside hc (`hc --skill`); the current leaf entry at `~/.akrogon/config.yaml` omits it. The leaf seat's work is not confined to its worktree: it writes leaf records under the registered repo's `issues/`, uses the shared Git directory there, writes to leaf temp and akrogon run/verify state, and launches systemd-run work. A plain workspace-write migration would therefore need an enumerated writable-root and socket policy and a full leaf proof; that is a security redesign, not a substrate move. The present consultant B proves workspace-write for the narrower consultant job (read broadly, write one return in the repo cwd, run `hc send`) only with the network flag, which is why the recipes should remain role-specific rather than pretending one codex line fits both.

Cost: leaf codex remains intentionally unsandboxed by codex, bounded only by akrogon's systemd slice for resources. Two codex recipes must be kept visibly distinct, and start's refusal for any codex argv without `--no-daemon` remains necessary.

Rejected: move leaf codex to workspace-write plus network (breaks today's behavior until every outside-worktree write and user-bus call has been probed); add only `--no-daemon` and keep consultants on full access too (loses the proven narrower consultant recipe and re-triggers the auto-mode problem in Q3); add `codex-ws` as another global harness template for leaf selection (the schema uses the harness name as argv[0], `src/next.ts:294-302`, and a consultant recipe already lives in seats.yaml).

Pitfall and probe: full-access leaf codex starting through listener → systemd-run scope → hc must still produce normal turns, commits, `akrogon phase`, and `run-check` calls; the full-life proof leaf with slot B codex covers this. A future hardening issue, not this migration, could trial workspace-write with explicit roots for the repo, worktree, leaf temp, and akrogon state.

Not asked: should the network flag be appended automatically whenever any seat-record codex argv says `workspace-write` but omits it, rather than refusing? I keep refusal: silently changing a recorded sandbox policy hides a wrong recipe.

## Q2. Agy

Pick: Do not add `agy` to global `harnesses:` in this migration. Keep agy as a consultant-only kind whose complete argv is recorded in seats.yaml, as slot E runs today: `agy --model gemini-4-argon-high --mode auto -i "<task>"`.

Reason: a global harness entry is an invitation for any repo's A or B leaf slot to select it. That would expand supported leaf behavior beyond today's claude/codex/pi surface: the transcript resolver has no reader for agy's conversation DB for usage or watcher log-tail, handover reset remains unsupported, interrupt and turn behavior need a full per-kind proof matrix, and its one silent stop is handled generically but gives no transcript evidence for the watcher. The door does not need a global template to use agy as a consultant: at Open it asks kind/argv and the start verb launches the recorded recipe. Although `agy --help` exposes a direct `--effort low|medium|high|xhigh|max`, today's chosen model name itself ends in `high`, so a template would need a probe to learn whether `--effort {effort}` is correct, redundant, or changes the selected model.

Cost: every chart that wants agy supplies its argv by hand, and no leaf seat can select agy until a later support issue adds its resolver/watcher evidence and probes.

Rejected: `agy --model {model} --effort {effort} --mode auto -i` now (looks symmetrical, but publishes leaf support we have not proven); `agy --model {model} --mode auto -i` with effort folded into model names (breaks the `{model}`/`{effort}` contract slot config expects); banning agy consultants too (contradicts working practice in this chart).

Evidence: `agy --help` read today (`--effort`, `--mode`, `-i` definitions), live argv from `hc get ak-slot-e`, session-id Taken has no agy transcript reader, delivery Taken handles silent stops generically.

Pitfall: seat-record argv can drift per chart. The door should offer this session's proven recipe as the default when an operator names agy, while still recording exactly what was launched.

## Q3. Claude permissions and door starts

Pick: Leaf `harnesses.claude` stays `--dangerously-skip-permissions`; nothing changes for listener-started seats because no Claude auto-mode classifier sits above the systemd listener. For doors, the operator adds one narrow Claude auto-mode allowance in their own Claude settings: running akrogon's start verb for a consultant or direct reviewer whose kind/argv are recorded for the current chart is pre-approved, paired where useful with `Bash(akrogon <start-verb> *)`. Akrogon install never writes that rule. If the rule is absent and the classifier refuses, the door reports the refusal and the operator approves that start; it does not look for a shell loophole.

Reason: the refusal was about the act of creating a full-access codex agent, not the binary name in front of it; wrapping the launch in akrogon's verb improves auditability but shouldn't be assumed to evade the classifier. A narrow semantic allowance is precise: the chart, seat record, and start verb bound what can be launched. The safer codex consultant recipe from Q1 further reduces what needs approving, while Claude consultants launched in `--permission-mode auto` may still need the allowance as agent creation. Changing the leaf Claude harness away from bypass would change autonomous lifecycle behavior that works today, with seats stalling on prompts no operator is there to answer.

Cost: one explicit operator settings step, in global Claude configuration outside this repo, and an allowance broad enough to launch recorded consultants without per-start judgment. It must be scoped to akrogon's start verb and recorded recipes rather than arbitrary `hc run`.

Rejected: akrogon install adding the permission automatically (self-granted permission is not permission, and akrogon does not own `~/.claude/settings.json`); asking doors to run bypass mode (widens every door action, not only starts); moving consultant starts to the listener to dodge the classifier (the listener is engine infrastructure, consultants are door children, and disguising the actor defeats the permission boundary); removing leaf bypass (breaks unattended lifecycle behavior).

Evidence: INTAKE 2026-11-05 classifier refusal; current config harness line and C's live `--permission-mode auto` argv read today; `~/.claude/settings.json` has both ordinary `permissions.allow` entries and semantic `autoMode.allow` rules (read structurally, no values printed).

Pitfall: natural-language classifier allowances can be interpreted more broadly after a Claude update. The probe is an attended chart-door test in auto mode: start one recorded consultant of each kind and confirm an unrecorded direct `hc run` still draws judgment rather than sailing through the new rule.

## Q4. Session app home

Pick: Akrogon's identity resolver returns the app home using herdr-setup's existing convention internally: `~/.config/herdr-app` for the default session and `~/.config/herdr-app-sessions/<session>` for a named session. If the target is the caller's own session and `HERDR_APP_HOME` is already set in that caller's environment, that value wins. No new akrogon config key. The resolver validates that the selected folder looks like an app home (contains `AGENTS.md` or `mods/`) before a caller writes notices into it; a missing folder is an error naming the expected path, not a silently created substitute.

Reason: `hc` has no app-home field: a fresh core's `doc.get` gives the document, while `hc server status` identifies the core and machine, not which window home will use it. The convention is therefore the only deterministic source, and it is herdr-setup's already-operating `herdrapp` model (`HERDR_APP_HOME="$sessions_dir/$1"`, default unsets it, `bin/herdrapp:58-63`). Implementing the convention in the already-shared resolution code means notices and `tab.rename` calls don't acquire a runtime dependency on invoking `herdrapp`; its `session list --json` output still serves as an e2e oracle for the same convention. Preferring the caller's own set value handles a deliberately relocated current session without inventing discovery for others.

Cost: akrogon duplicates a herdr-setup convention and can drift from it. That failure is loud—window checks or notice draining stop for that session—but not impossible.

Rejected: a config key (a second hand-maintained copy of the same mapping for twelve repos and multiple sessions; stale immediately when a new session is created); reading it from the core/session itself (the inspected surfaces do not carry it, and asking `herdr-app ls` requires the very home being sought); invoking `herdrapp session list --json` on every resolution (works, but makes the engine depend on a setup script's CLI for a pure path rule and contradicts identity's socket-enumeration approach).

Evidence: Bundled TR: `bin/herdrapp:3-4,58-63,167-202`; identity/start/notices Takens need `HERDR_APP_HOME` for window checks, renames, and notice files; my earlier throwaway core status output contained no app-home path. Read/run dated in this chart's probes.

Pitfall: two similarly named session homes after an operator experiment can make the wrong folder look valid. The marker check plus notices' pending-age visibility bounds it, and the patch post-update check compares the resolver's answers against `herdrapp session list --json` for the live sessions.

Not asked: should the default session's name in the socket directory be treated differently where `HC_SESSION` is explicitly set to `default` rather than unset? The resolver should normalize both to the same home.