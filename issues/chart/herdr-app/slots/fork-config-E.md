# Fork Notes: `config` — Seat E

## Q1: `codex` — `--no-daemon` with `-s danger-full-access` vs `-s workspace-write` + network flag

1. **Pick:** **Add `--no-daemon` and keep `-s danger-full-access`:**
   `codex: codex --no-daemon -m {model} -c model_reasoning_effort={effort} -a never -s danger-full-access`
   - *Reason:* (a) `hc --skill` requires `--no-daemon` so Codex commands run inside `hc` (and inside `containment` Taken's `systemd-run --user --scope` cgroup); (b) leaf seat B (`slots.b: codex`) runs in a linked worktree (`cwd = ~/.akrogon/worktrees/<repo>/<slug>`), so `<repo.root>/.git/worktrees/<slug>` (written by `git commit`/`fetch`), `<repo.root>/issues/open/<slug>/` (`review-B.md`, `cleared-*.md`, `state.yaml`), `~/.akrogon/`, and `/var/tmp/akr-<uid>` are all outside `cwd` and blocked (`os error 30`) by `-s workspace-write`; (c) the `INTAKE.md:178` auto-mode refusal only happened because the door ran raw `hc run ... -s danger-full-access` directly, whereas `start-and-pane` Taken Q4 4a starts consultants through `akrogon`'s start verb (`akrogon <verb>`), which hides the flag inside `config.yaml` and matches `"Bash(akrogon:*)"` in `~/.claude/settings.json`.
   - *Cost:* One flag (`--no-daemon`) added to `harnesses.codex` in `~/.akrogon/config.yaml`.
2. **Rejected:** *`-s workspace-write -c sandbox_workspace_write.network_access=true`* — breaks leaf seat B (`slots.b: codex`) on every write outside the worktree `cwd` (`<repo.root>/.git`, `<repo.root>/issues/open/<slug>/`, `~/.akrogon/`, `/var/tmp/akr-<uid>`) and on `systemd-run --user` in `akrogon run-check` / `akrogon done`.
3. **Evidence:**
   - `better-than-training` · `hc --skill` ("Codex must run with `--no-daemon`"), `src/config.ts:325-358` (`worktreeStore` & `leafTempRoot` outside `<repo.root>`), `~/.akrogon/config.yaml` (`slots.b` = `codex`), `INTAKE.md:177-181` · 2026-11-07.
   - `practitioner` · OpenAI Codex CLI docs & `codex --help` (`-s workspace-write` restricts filesystem writes to `cwd`, blocking linked-worktree `.git` common dirs and external state roots) · 2026-11-07.
4. **Pitfalls:**
   - *A door bypassing `akrogon`'s start verb and calling raw `hc run ... codex` in Claude `auto` mode:* Refused by the classifier or missing `--no-daemon`. *Removed by:* `chart-door` Taken deleting peer scripts and routing all consultant starts through `akrogon`'s start verb (`direct-guards.ts` / skill rules).
5. **Unasked question:** None.

---

## Q2: `agy` — add `harnesses.agy` entry vs leave out of `harnesses:`

1. **Pick:** **Add `agy` to `harnesses:` in `~/.akrogon/config.yaml`:**
   `agy: agy --model {model} --effort {effort} --mode auto -i`
   - *Reason:* `start-and-pane` Taken Q4 4a and `chart-door` Taken start all seats and consultants through `akrogon`'s single start verb, which resolves `global.harnesses[harness]` (`src/config.ts:190`, `src/next.ts:296`). `agy` (v1.5.3 installed) natively supports `--model <model>`, `--effort <low|medium|high|xhigh|max>`, `--mode auto`, and `-i` (`--prompt-interactive`, which takes the trailing initial prompt argument from `start-and-pane` Q4 4a and stays interactive).
   - *Cost:* One line in `~/.akrogon/config.yaml` (and test fixtures if needed).
2. **Rejected:**
   - *Leave `agy` out of `harnesses:`:* Prevents `akrogon`'s single start verb (`start-and-pane` Taken Q4 4a) and `ISSUE.md`/`EPIC.md` `slots:` front matter from starting `agy` seats without manual `hc run` workarounds.
   - *Bake `{effort}` into `--model {model}-{effort}` without `--effort`:* Breaks when `{model}` already includes `-high` (`gemini-4-argon-high` from `agy models`) or for models without an effort suffix; `agy --help` and `agy changelog` (1.1.5 / 1.5.x) provide `--effort {effort}` directly.
3. **Evidence:**
   - `better-than-training` · `agy --help` (`--model`, `--effort`, `--mode`, `-i`), `agy models`, `agy changelog` (v1.1.5 `--effort` flag, v1.5.3), `hc get ak-slot-e --json`, `src/next.ts:296-301` · 2026-11-07.
   - `practitioner` · `/home/ivan/.gemini/antigravity-cli/builtin/skills/antigravity_guide/references/cli.md` · 2026-11-07.
4. **Pitfalls:**
   - *`agy` `-i` (`--prompt-interactive`) expects the initial prompt right after `-i`:* Keep `-i` as the last flag in `harnesses.agy` so when `akrogon`'s start verb appends the initial prompt argument, it lands immediately after `-i`. *Removed by:* Unit test on argv construction for `agy` in `checks.test`.
5. **Unasked question:** Should `harnesses.agy` also pass `--dangerously-skip-permissions` alongside `--mode auto` so `agy` never prompts on file reads/writes outside the workspace (`agy changelog` 1.5.2)? (Worth considering if an `agy` seat reads outside `<repo.root>`, e.g. `/home/ivan/Work/infra/herdr-setup`.)

---

## Q3: Permissions — `claude` `--dangerously-skip-permissions` and `~/.claude/settings.json` rule

1. **Pick:** **Keep `--dangerously-skip-permissions` in `harnesses.claude` unchanged; in `~/.claude/settings.json`, keep existing `"Bash(akrogon:*)"` (which already permits the door's `akrogon` start verb in `auto` mode) and replace the dead `Bash(herdr ...)` rules with `"Bash(hc:*)"`.**
   - *Reason:* Leaf seats and Claude consultants started by `akrogon` are unattended and need `--dangerously-skip-permissions`. For a Claude door running in `--permission-mode auto` (`~/.claude/settings.json` `"defaultMode": "auto"`), `"Bash(akrogon:*)"` is *already* in `permissions.allow`, so calling `akrogon <start-verb>` is already permitted without triggering the "Create Unsafe Agents" classifier (`INTAKE.md:178`), while `"Bash(hc:*)"` covers `hc send`/`hc wait`/`hc kill`/`hc keys` once the old `Bash(herdr ...)` rules are removed (`cutover` Taken Q3).
   - *Cost:* Zero code changes in `akrogon`; replacing dead `Bash(herdr ...)` lines with `"Bash(hc:*)"` in `~/.claude/settings.json` during the `cutover` operator step.
2. **Rejected:** *Drop `--dangerously-skip-permissions` from `harnesses.claude`* — causes unattended leaf or consultant Claude seats to block on permission prompts or auto-mode classifier refusals.
3. **Evidence:**
   - `better-than-training` · `~/.claude/settings.json` (`permissions.allow` already contains `"Bash(akrogon:*)"` plus 8 legacy `Bash(herdr ...)` entries; `"defaultMode": "auto"`), `claude --help` (`--dangerously-skip-permissions`, `--permission-mode`), `INTAKE.md:178` · 2026-11-07.
4. **Pitfalls:**
   - *Door calling `hc send`/`hc wait`/`hc kill` after legacy `Bash(herdr ...)` rules are removed:* Could hit `auto` mode checks on `hc kill`. *Removed by:* Adding `"Bash(hc:*)"` to `~/.claude/settings.json` `permissions.allow` when removing `Bash(herdr ...)`.
5. **Unasked question:** None.

---

## Q4: App home — how `akrogon` finds each `hc` session's `HERDR_APP_HOME`

1. **Pick:** **Use `herdr-setup`'s folder convention directly in `src/hc.ts`:**
   `session === 'default' ? resolve(homedir(), '.config/herdr-app') : resolve(homedir(), '.config/herdr-app-sessions', session)`
   - *Reason:* Matches `/home/ivan/Work/infra/herdr-setup/bin/herdrapp:9-10,178-180` (`session_dir()`) byte-for-byte; works when the session's `herdr-app` window is closed (required by `notices` Taken to write `<appHome>/akrogon-notices.json` and by `start-and-pane` Taken N2 to probe `herdr-app ls`); requires no new `config.yaml` schema key; and works automatically for throwaway test sessions (`herdrapp --session <name>`) and `HOME` overrides in tests.
   - *Cost:* A 3-line pure helper `sessionAppHome(session: string, home = homedir()): string` in `src/hc.ts`.
2. **Rejected:**
   - *Read from the session itself:* Impossible — `hc` core's `docs.json` (`herdr-app` doc) stores only `{"spaces": [...]}` (`jq '.["herdr-app"].value | keys' ~/.local/state/herdr-core/infra/docs.json`), and no `herdr-app` process exists when the window is closed.
   - *A config key in `~/.akrogon/config.yaml`:* Redundant configuration that duplicates `herdrapp`'s fixed path law and would require manual edits for every new or throwaway session.
3. **Evidence:**
   - `better-than-training` · `/home/ivan/Work/infra/herdr-setup/bin/herdrapp:9-10,58-63,178-180`, `herdrapp session list --json`, `jq '.["herdr-app"].value | keys' ~/.local/state/herdr-core/infra/docs.json` · 2026-11-07.
4. **Pitfalls:**
   - *Passing `HERDR_APP_HOME` for `"default"` vs unsetting or pointing at `~/.config/herdr-app`:* Both `HERDR_APP_HOME=~/.config/herdr-app` and unsetting it resolve to `~/.config/herdr-app` (`herdrapp:9,179`), and `sessionAppHome('default')` returning `~/.config/herdr-app` gives a concrete directory path for writing `<appHome>/akrogon-notices.json` (`notices` Taken). *Removed by:* Unit test covering both `default` and named sessions (`infra`).
5. **Unasked question:** None.
