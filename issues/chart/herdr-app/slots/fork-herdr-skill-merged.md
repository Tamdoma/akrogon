# herdr-skill: merged notes (A,B,C,D,E)

Sources: fork-herdr-skill-A.md .. -E.md.

## Corrections (verified by A, 2026-11-07)
- AGENTS.md is per app home: this session's `HERDR_APP_HOME` is `~/.config/herdr-app-sessions/infra`, and its AGENTS.md differs from `~/.config/herdr-app/AGENTS.md` by 133 diff lines (C). Each window rewrites only its own home's copy. A pointer must use `${HERDR_APP_HOME:-$HOME/.config/herdr-app}` (B,C,E), not the fixed path the fork question names.
- `hc --skill` 0.1.18 has no installable-skill section, though AGENTS.md says it does (A,B,C,D).

## Q1. Shape
- A small owned `skills/herdr/SKILL.md` with front matter (`name: herdr`, a short description), the folder symlinked into each skill home (all). The body gates on `HC_TERMINAL_ID` (C,D,E) and routes: agents and programs to `hc --skill`, the window to `herdr-app --skill`, layouts, keys and mods to `${HERDR_APP_HOME:-$HOME/.config/herdr-app}/AGENTS.md` (all). Everything substantive is printed by the installed binaries or rewritten by the app, so nothing goes stale on update (all).
- Body size: pointers only, no command catalogue, no copied workflow rules (B,C,E) vs pointers plus a short list of stable facts (address is `$HC_TERMINAL_ID`, children report to you, `<hc from=...>` is a terminal not the operator, sends from another terminal arrive wrapped, codex `--no-daemon`, never `hc server stop`, old `herdr` is legacy) (D).
- Description: name the triggers (`HC_TERMINAL_ID` set, a message in `<hc>` tags, hc, herdr-core, herdr-app, delegating or messaging terminals, changing the window) and drop the old skill's "use only when the user explicitly mentions Herdr" wording, which suppresses loading (A,C,D,E). Under about 300 characters, runtime trigger first, so Codex's budget trimming does no harm (B,C).
- Rejected by all: `SKILL.md -> AGENTS.md` (no front matter: pi, Codex and agy refuse a skill without a description; 951 lines mostly mod authoring; the hc part is 12 lines pointing to `hc --skill`). Rejected by all: a generated copy refreshed on update (nothing runs when a binary updates; a stale copy is the failure to avoid).

## Q2. Owner and homes
- herdr-setup owns it (all): `skills/herdr/` in the herdr-setup repo, linked by `./install` with its existing `link()` helper, which moves a real folder at the target to `~/.local/state/herdr-setup/backup-<time>/` first. akrogon install would refuse the three old real folders as conflicts (`src/install.ts:130-143`; D,E) and would tie a herdr-wide skill to akrogon releases (all). akrogon's stale-link pruning walks only its own skill names, so it leaves the herdr link alone (B,D).
- Homes: `~/.claude/skills`, `~/.codex/skills`, `~/.agents/skills`, `~/.pi/agent/skills`, `~/.gemini/config/skills` (agy's documented global path, already holding omarchy's symlinked skills) (A,C,D,E). B: the same minus `~/.codex/skills`, retiring the old Codex copy after a probe shows Codex finds the `~/.agents` entry. pi deduplicates the same real path (B,E). A duplicate Codex listing is what akrogon's own skills do today (C).
- When the old skills go: in the same herdr-setup install run that links the new one (A,C,D,E): the old skill gates on `HERDR_ENV=1`, which herdr-app never sets, no akrogon code uses it, and it already caused a door refusal (INTAKE). vs at the tested cutover, after discovery is proven from throwaway roots (B).
- Pickup: Claude Code watches its skill folder live; Codex, pi and agy need a new session (C). Install twice changes nothing (C,B).

## Q3. Awareness
- Description only, plus the body's gate (A,C,D,E): every harness lists skill descriptions in every session; hc sets `HC_TERMINAL_ID`, `HC_SESSION`, `HERDR_APP_HOME` in each terminal; hc tags incoming messages `<hc from=... reach="hc send <t> when done or stuck">`, so the reply path travels with the message; akrogon's start tasks and briefs already spell their exact `hc send` line. Nothing added to akrogon's start (A,C,D,E). The limit is stated: loading is model judgment; a failed probe means a better description, not a new mechanism (A,D).
- A per-harness startup hook installed by herdr-setup, gated on `HC_TERMINAL_ID`, injecting a short "you are in an hc terminal, see the herdr skill" before the first task (Claude and Codex SessionStart, a pi extension, agy SessionStart); outside hc it emits nothing (B). Reason: description loading cannot guarantee "aware every time"; global files stay untouched.
- Probe (all): a fresh session per harness inside a throwaway hc terminal, given an hc-shaped task and an incoming `<hc>` report, loads the skill or answers its address and report path without being told. C: check whether a direct `hc run -- <harness> "<task>"` first message carries `reach=`; if not, the start task ends with its report line, as briefs do today.

## Open asks from notes
- Should the skill say anything for agents outside hc (A), or stop after the gate (C,D,E)?
- Should akrogon install add agy's `~/.gemini/config/skills` for akrogon's own skills (E)? (config fork)
- Who reports AGENTS.md's false "installable skill" line upstream (C,D)?

## Corrections after rebuttals (2026-11-07)
- B: "nothing goes stale" holds for files only; a running conversation keeps guidance it already loaded, so fresh-session tests after an update stay. B said runtime trigger first limits damage; Codex's budget can omit whole skills, so no length proves startup awareness. Pickup: Codex change detection, pi `/reload` and agy `/skills reload` exist; probe installed versions before prescribing restarts. B's own Q3 needs its own probe: an ordinary task with no hc cue, checking awareness came from the startup hook, and nothing injected outside hc. akrogon's pruning decides by link target, not skill name (`src/install.ts:60-77`); the herdr-setup target is safe because it is outside akrogon's targets.
- C: rejects B's hooks (four new parts for text hc already delivers; the hook still only asks the model to read a skill). Rejects D's fact list (`codex --no-daemon` is akrogon harness config; the rest is hc 0.1.18 behavior that can change; the address is already in `hc --skill`). Rejects B's skip of `~/.codex/skills` (it leaves the old real folder; link all five). pi dedupes symlinked aliases by real path.
- D: no disagreement.
- E: rejects B's hooks (signpost 5a and the no-new-parts direction). The gate stops hc and `herdr-app do` control outside hc, but still lets an agent read `${HERDR_APP_HOME:-$HOME/.config/herdr-app}/AGENTS.md` and `herdr-app commands` when asked to edit layouts, keys or mods from outside hc (for example in herdr-setup).
