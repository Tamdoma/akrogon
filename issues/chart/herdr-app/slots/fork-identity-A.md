# Fork notes A: identity

## Q1 session and space
- Pick: the same rule as today, moved to hc. The engine looks through running herdr-core sessions for the herdr-app space named after the repo, exactly like `resolveSession` looks for the workspace label (`src/shell.ts:379-406`); no match is the same refusal as today ("no workspace"), ambiguous is the same refusal. Sessions come from herdr-core's socket folder (`/run/user/1000/herdr-core/<session>.sock`) or herdr-setup's `herdrapp session list --json`; each session's app home is `~/.config/herdr-app-sessions/<name>` (default: `~/.config/herdr-app`). Cost: depends on spaces being named (a nobody-named space follows its first terminal's folder, AGENTS.md "The model"), and on `herdr-app ls` answering.
- Rejected: a per-repo config key naming the hc session (new config, drifts from what the operator sees); space folder (wrong today, v); only the session the engine runs in (the listener runs from systemd, not a terminal).
- Evidence: better-than-training · `herdr session list` and `herdr workspace list --session infra` (old: one session, workspace per repo label) · `ls ~/.config/herdr-app-sessions` (infra, mdconsultingny, personal) · 2026-11-06.
- Pitfalls: `herdr-app ls` may need the window open ("ls and status talk to the running window", `herdr-app --skill`): probe with the window closed; if it fails, find the space id from `hc ls --json` labels `herdr.space` of terminals already in that space, or read it at leaf creation and store it. An unnamed space renames itself when its first terminal moves: the start helper names the space it uses (`space.rename`).
- Ask: are all repos in `infra`, or do `mdconsultingny` and `personal` host registered repos too?

## Q2 state
- Pick: per leaf `tab` (herdr-app tab id, as today) and per seat the hc name (replacing pane id; it survives restart); labels `akrogon.repo`, `akrogon.leaf`, `akrogon.seat` on every seat terminal for the listener filter and rediscovery; no address stored. `prompted` (agent session id) moves to the delivery fork (likely the hc `turn` at prompt time).
- Rejected: address (changes on restart, intake test 3); herdr-app pane id (a pane is the view, the terminal is the identity; pane ids change when a terminal is re-kept).
- Evidence: `src/state.ts:99-102`; `hc get t6f --json` (name, labels, turn, no session id) · 2026-11-06.
- Pitfall: old leaves' state holds pane ids; cutover drains them (cutover fork), no migration.

## Q3 names
- Pick: leaf seats `<prefix>-<slug>-<seat>` (`ak-herdr-skill-a`), cut to 32 chars with a short hash when long (as `src/next.ts:788` already hashes); consultants `<prefix>-slot-<letter>`; the prefix is a per-repo value in the registry (`akrogon config` `repos`) or repo `issues/config.yaml`, because initials are not derivable ("fw" for framework). A second door on the same repo gets `name_taken` from hc and stops with that message: no new rule.
- Rejected: derived initials (ambiguous); door discriminator in names (changes the operator's naming rule).
- Evidence: `hc run --help` name rule; intake naming rule and the framework `name_taken` finding · 2026-11-06.
- Ask: where does the operator want the prefix set, and is a second door on one repo ever wanted?
