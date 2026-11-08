# Global herdr skill

## Question

Signpost 5a: global CLAUDE.md and AGENTS.md stay untouched; one global `herdr` skill replaces the old one (`~/.claude/skills/herdr/SKILL.md`, `~/.codex/skills/herdr/`, both for old herdr, "Requires HERDR_ENV=1"), with its content from herdr-app's AGENTS.md, linked into pi, Claude Code and Codex; the operator proposed a symlink skill called `/herdr`. Facts read 2026-11-07: `~/.config/herdr-app/AGENTS.md` is 951 lines, rewritten by herdr-app on every start, mostly about layouts and mods, and points agents to `herdr-app --skill` (driving the window) and `hc --skill` (running and coordinating programs and agents, 260 lines); it says `hc --skill` includes "a small herdr-core skill you can install", but `hc --skill` 0.1.18 has no such section. akrogon install links its own skills into `~/.claude/skills`, `~/.agents/skills`, `~/.codex/skills`, `~/.pi/agent/skills` (`src/install.ts:25`). agy keeps skills under `~/.gemini/` (`config/skills`, `antigravity-cli/builtin/skills`), unconfirmed which it reads.

1. Shape: a plain symlink `SKILL.md -> AGENTS.md` as proposed, a small owned `SKILL.md` with front matter whose body sends the agent to `hc --skill`, `herdr-app --skill` and `$HERDR_APP_HOME/AGENTS.md`, or a generated copy of those manuals refreshed on update? Which one stays correct when herdr-app or hc update?
2. Owner and homes: who installs and updates it (herdr-setup's install, akrogon install, or an operator step), which skill homes get it (Claude Code, Codex, pi, agy, `~/.agents/skills`), and when are the old herdr skills removed (with the old herdr cutover or at once)?
3. Awareness: is the skill list's description (loaded every session, body read on match) enough for "agents aware every time they run in herdr-core", gated to act only when `HC_TERMINAL_ID` is set or a message arrives in `<hc>` tags, or does anything more reach agents akrogon starts?

### Carries

- Signposts: forks/signposts.md `## Taken` (5a: the operator's verbatim skill request; 3: gaps patched in herdr-setup) and its 2026-11-06 directions (closest to today, no new features, fewest parts).
- Operator intake 2026-11-06 (INTAKE.md): agents inside herdr-core and herdr-app must know it every time; not polluting global CLAUDE.md/AGENTS.md because Claude Code also runs outside herdr-app.
- All taken forks' `## Taken` (binding), chart-door included.
- Map: slots/map-merged.md fork "herdr-skill".

## Findings

- Merged notes: slots/fork-herdr-skill-merged.md (A,B,C,D,E with rebuttal corrections).
- Corrected: AGENTS.md is per app home (this session's differs from `~/.config/herdr-app/AGENTS.md` by 133 lines), so the pointer is `${HERDR_APP_HOME:-$HOME/.config/herdr-app}/AGENTS.md`. `hc --skill` 0.1.18 has no installable skill despite AGENTS.md's claim.
- Rejected by all: `SKILL.md -> AGENTS.md` (no front matter, so pi, Codex and agy refuse it; 951 lines mostly mod authoring) and a generated copy (stale after any update).
- Agreed: small owned `skills/herdr/SKILL.md` in herdr-setup, folder symlinked by herdr-setup `./install` (`link()` backs up the old real folders); trigger-rich description replacing the old "only when the user mentions Herdr" wording; gate on `HC_TERMINAL_ID` for control commands, reading AGENTS.md allowed outside hc (E).
- Q1: pointers only (A,B,C,E) vs pointers plus a short stable-facts list (D).
- Q2: five homes, old skills replaced in the same install run (A,C,D,E) vs Codex via `~/.agents` only and old skills removed at the tested cutover (B).
- Q3: description only, with a probe and a better description on failure (A,C,D,E) vs a per-harness startup hook gated on `HC_TERMINAL_ID` (B).

## Taken
Operator 2026-11-07, door t15, verbatim: "1a | 2a - the skill needs to be in the herdr-setup repo (already exists) and symlinked to it from pi, codex and claude, so there's no duplication. Similar to how akrogon skills are set up so that all harnesses have access to them. This shouldn't be a problem, right? | 3a - It needs to be described sufficiently enough so that it triggers when needed |"

Read as:
- Q1 1a: one small owned `skills/herdr/SKILL.md` in the herdr-setup repo (`/home/ivan/Work/infra/herdr-setup`), front matter `name: herdr` and a description. The body holds only the gate and directions: agents and terminals → `hc --skill`; the window → `herdr-app --skill`; layouts, keys and mods → `${HERDR_APP_HOME:-$HOME/.config/herdr-app}/AGENTS.md` and `herdr-app commands`. No copied manual text and no hc facts. Outside hc (`HC_TERMINAL_ID` unset) it stops hc and `herdr-app do` control but still allows reading AGENTS.md when asked to edit layouts, keys or mods.
- Q2 2a: one copy only. The `skills/herdr` folder lives in herdr-setup and every harness reaches it through a symlinked folder, the way akrogon's skills are linked today (`~/.<harness>/skills/<name> -> <release>/skills/<name>`), so all harnesses see the same file: `~/.claude/skills/herdr`, `~/.codex/skills/herdr`, `~/.pi/agent/skills/herdr`, `~/.agents/skills/herdr`, and agy's `~/.gemini/config/skills/herdr` ("all harnesses"). herdr-setup's `./install` creates the links with its existing `link()` helper, which moves the old real herdr skill folders to its backup folder in the same run. akrogon install neither writes nor prunes this link.
- Q3 3a: description only, written so it triggers when needed: it names `HC_TERMINAL_ID` being set, a message in `<hc>` tags, hc, herdr-core, herdr-app, starting, messaging or waiting on other terminals or agents, and changing the window, runtime trigger first and short enough for Codex's skill budget; no old "only when the user mentions Herdr" wording. Done-criterion: per harness, a fresh session inside a throwaway hc terminal given an hc-shaped task and an incoming `<hc>` report loads the skill without being told; a harness that does not gets better wording, not a new mechanism. No startup hooks, no global file edits, nothing added to akrogon's start.
- Operator check "This shouldn't be a problem, right?": no problem, with one probe. Claude Code and Codex document symlinked skill folders, and pi follows and deduplicates them in code; akrogon's skills already reach those homes this way. agy's docs do not say, so the per-harness discovery probe covers agy before handoff. herdr-setup has no `skills/` folder yet; the leaf adds it and one link loop in `./install`.
