# Plan: seat-input-rules

Synthesis direct from brief and locked design (`debate: "no"`); no positions exist. `blocked-by: readiness-contract` is satisfied: that leaf is `merged` and its schema plus `Missing:` output are live in this worktree.

## Read first

- `issues/open/leaf-readiness/seat-input-rules/design.md` — binding decision text; review compares changed sentences against it.
- `src/readiness.ts` — verbatim `readiness.yaml` schema the skills must name: `inputs`, `produces[].save`, `grants[]`, `grants[].fixtures[].cleanup`, `grants[].fixtures[].absence_check`, `retained[]`.
- `src/status.ts` (lines ~310–340) — the consumed output: `Missing: <repo>/<slug> <kind> <name> in <holder>: <steps>`; `status <slug>` prints the same lines after the state YAML. No "present" lines exist; presence is shown by absence of a `Missing:` line.
- `src/phase.ts` — `phase <slug> failed --reason` requires the reason, records `failure.reason` in the leaf `state.yaml`, then `announceFailed` runs `herdr notification show`; the move is committed even if the notification fails, but the error then propagates to the caller's exit status.
- `src/config.ts` — `AKROGON_HOME` overrides the global config root; `readRepo` needs `<repo>/issues/config.yaml`; slot harnesses come from `slots` + `harnesses`.
- `skills/AREA.md` — the existing env-rule invariant line this leaf rewrites.
- `docs/reference-index.md` — grounding index, already followed.

## Decisions

- D1: The env rule is one paragraph per phase skill, placed directly beside that skill's operator-blocker `failed` stop: never open, print, append to or write `.env`/`.env.*` with any tool; declared checks and live operations consume values through the process (`bun --env-file=<holder file> <script>`) printing results only; presence is checked by `Missing:` lines in `akrogon status <slug>` output, where absent or empty counts as missing. In plan-issue this replaces the `bun --env-file .env -e 'console.log(...)'` credential one-liner in `plan.synthesis`; the other three skills replace only the script-based presence clause of their existing rule. merge-issue's `.env.example` merge-check exception stays verbatim.
- D2: Producer-save rule appears once each in plan-issue and implement-issue (the phases that can run producer saves and live operations): a producer saves its key only through the operation in `produces[].save` (entry point, inspected revision, non-secret `args`, key `name`, `holder` repo's real file, private `value_source`); the value passes privately, writes the holder's real file never the worktree link, and the new key is revoked if saving fails.
- D3: Grant-reuse rule appears once in each of the four phase skills: a seat reuses `grants[]` for probes, implementation, repairs, reruns, merge checks and cleanup without asking; before mutating it compares operation, target and identity with the grant, records grant reference, results and created IDs in its pass artifact, never widens it, and treats anything outside it as an operator blocker under D5. check-issue's repair routing (B hands required live runs to A) is unchanged — the line is not touched.
- D4: Fixture-cleanup rule appears once each in check-issue and merge-issue (the phases that run reruns, merge checks and cleanup): proof fixtures are cleaned up on success and failure with the identities in `grants[].fixtures[].cleanup`; absence is proven by `absence_check` (authenticated read-back, never a delete reply); leftovers are recorded with IDs, error, owner and next step; `retained[]` resources are labelled apart from still-to-delete ones.
- D5: Blocker-record rule appears once in each of the four phase skills at the existing `akrogon phase <slug> failed --reason` stop: the reason names the blocker and artifact; the artifact carries name or ID, attempted operation, identity reference, error, owner and next action; never a value. This extends the existing stop sentences rather than adding a second stop.
- D6: `skills/AREA.md` replaces its env invariant line once, keeping it a phase-skill invariant: the file-tool ban plus `akrogon status` `Missing:` presence checks, in place of the `bun --env-file` present/absent one-liner.
- D7: Live demonstration (criterion 4) runs after the skill text lands. Scratch `AKROGON_HOME=<scratch>` with a `config.yaml` registering one scratch git repo at a temp path; the repo has `issues/config.yaml` (minimal valid: `checks: {}`, `grounding: none`) and one leaf per harness under `issues/open/<issue>/<leaf>/` — slug `seat-demo-<harness>` — whose `state.yaml` holds `{slug, phase: implement, created, repo: <scratch-repo-name>, debate: "no", blocked-by: []}` and whose `readiness.yaml` declares `inputs: [{kind: env, name: AKROGON_DEMO_THROWAWAY_<H>, holder: <scratch-repo-name>, purpose, consumers: [seat-demo], steps, source, done}]`. No scratch `.env` file is created (absent file counts as missing; no file tool ever touches an env file). Each harness gets one non-interactive run, cwd = scratch repo root: a short seat-style prompt containing the new env-rule paragraph and the instruction to run `AKROGON_HOME=<scratch> akrogon status <slug>` and then the blocker `akrogon phase <slug> failed --reason "missing <VAR> in <repo>/.env blocks <criterion>" --slot A`. The reason must name the input name and the `.env` file; no value exists, so none can leak. Invocation templates: `claude --model <slot model> --dangerously-skip-permissions -p "<prompt>"`, `codex -m <model> -c model_reasoning_effort=<effort> -a never -s danger-full-access exec "<prompt>"`, `pi --model <model> --thinking <effort> -a --exclude-tools request_user_input "<prompt>"` — mirroring `harnesses` config with the effective slot models (claude, codex, pi on 2026-10-02). Record per harness: command, harness `--version`, exit status of both commands, `failure.reason` read from the scratch leaf `state.yaml`, and the transcript path copied into `<leaf>/implementation/`.
- D8: Before the demo, run `herdr notification show "<title>" --body "<body>" --sound request` once to confirm announce behavior; if it errors, `phase failed` still commits the move (reason is recorded) but exits non-zero — report records both facts, never retries silently.
- D9: No `src/` change, no chart-issues change, no harness config change, no pi guard change, no consumer repo change. No tests are added for prose skill text; prose correctness is judged at review against the binding decisions (lesson 2026-10-01).

## Interfaces

- `akrogon status <slug>` stdout: `Missing: <repo>/<slug> <kind> <name> in <holder>: <steps>` per gap (src/status.ts:314).
- `readiness.yaml` (src/readiness.ts): `inputs[].{kind,name,holder,purpose,consumers,steps,source,done}`, `produces[].save.{entry,revision,args,value_source}`, `grants[].{approved,principal,account,credential,targets,fixtures,operations,effects,bounds,stop_line,expires?}`, `grants[].fixtures[].{account,purpose,marker,naming,count,cleanup[{step,identity}],absence_check}`, `retained[].{resources,purpose,owner,remove_by,cost,exposure,cleanup{identity,route},reason}`.
- `akrogon phase <slug> failed --reason "<blocker and artifact>" --slot <seat>` — existing stop command, unchanged signature.
- Scratch `state.yaml` minimum: `slug`, `phase`, `created`, `repo`, `debate`, `blocked-by` (src/state.ts:35+; all other fields defaulted).

## Checklist

### Wave 1

- **U1** — `skills/plan-issue/SKILL.md`
  - Replace the seat `.env` paragraph with the D1 env rule (presence via `akrogon status <slug>` `Missing:` lines, absent or empty is missing; process consumption via `bun --env-file` stays) beside the operator-blocker stop.
  - Replace the `plan.synthesis` credential check: drop the `bun --env-file=.env -e` one-liner; read `Missing:` lines from `akrogon status <slug>`; each missing env input is a human-only blocker recorded in `plan.md` with the `add <name>` action, what the value is and where the operator obtains it, then the same `failed` stop — keep the existing stop wording.
  - Add the D2 producer-save and D3 grant-reuse rules once each in Shared context; extend the blocker stop per D5.
- **U2** — `skills/implement-issue/SKILL.md`
  - Replace the "A never opens, prints, appends to, or writes `.env`" paragraph with D1 + D2 + D3; extend the Shared-context and implement-section stop sentences per D5.
  - The "A credential still absent from `.env` at implement" paragraph keeps its `add <VAR>` operator action but takes its absent list from `akrogon status <slug>` `Missing:` lines instead of implying a direct `.env` check.
- **U3** — `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`
  - check-issue: replace the env paragraph with D1 + D3 + D4; extend its stop per D5. Do not touch the `check.repair` routing sentence (B hands required live runs to A — criterion 3).
  - merge-issue: same replacement, preserving the `.env.example` merge-check exception verbatim; extend its stop per D5.
- **U4** — `skills/AREA.md`
  - Replace the "Env-file rule" Non-obvious-patterns line with the D6 invariant statement. One line, names `akrogon status` `Missing:` checks; no other section changes; file stays within its 40-line cap.

U1–U4 own disjoint paths and share no test resource: one wave.

### Wave 2 — A executes, no worker

- **A1** — Live demonstration (D7, D8), after Wave 1 lands. Needs U1 text so harness prompts carry the new rule. Owns no repo path; writes only `<leaf>/implementation/report.md` plus copied transcripts under `<leaf>/implementation/transcript-<harness>.{json,txt}`. Scratch trees live under `$TMPDIR` and are deleted after transcripts are copied.

No shared resource between Wave-1 units beyond disjoint files; the demo waits only on U1's text.

## Done-criteria → proof

| # | Command / evidence | Catches | Size | Rerun trigger |
|---|---------------------|---------|------|---------------|
| 1 | `grep -n 'akrogon status' skills/plan-issue/SKILL.md skills/implement-issue/SKILL.md skills/check-issue/SKILL.md skills/merge-issue/SKILL.md skills/AREA.md` + read each changed paragraph against D1/D6; `grep -n 'env-file=.env -e' skills/plan-issue/SKILL.md` must print nothing | missing rule, surviving `bun -e` one-liner | seconds | any diff in the five files |
| 2 | Read the four skill diffs; each of D2–D5 appears once in the skills the criterion assigns (D2/D3 plan+implement, D3/D4/D5 check+merge, D3/D5 all four) and each names its `readiness.yaml` field (`produces[].save`, `grants[]`, `fixtures[].cleanup`, `absence_check`, `retained[]`) | rule placed in the wrong skill, field names invented | seconds | any diff in the four skills |
| 3 | `git diff $AKROGON_BASE -- skills/check-issue/SKILL.md` — the `check.repair` "required live runs" / `Handed to A` sentence appears in no changed hunk | accidental routing change | seconds | any check-issue diff |
| 4 | `implementation/report.md` lists per harness (claude, codex, pi): command, `--version`, both exit statuses, `failure.reason`, transcript path; each transcript file exists under `implementation/` and shows both commands ran and `Missing:` output appeared; scratch home/repo deleted afterward | skipped harness, missing reason, value leak, stale transcript | minutes | report or transcript missing/incomplete |
| all | `bun run format`, `bun run typecheck`, `bun test --timeout=30000` (repo `checks` — whole suite is configured, brief names checks) | format/type regressions, suite regression | minutes | any diff |

No `merge_checks` are configured; none are added.

## Doc checklist

- `skills/AREA.md`: the env invariant line (U4). Its Commands/Key files/See also stay accurate.
- No other agent or human doc names the old `bun -e` presence check: verify once at implement end with `grep -rn 'env-file' skills/ docs/` and either own or report each hit.

## Credentials

The design names no env variable this leaf needs (the schema fields are data; the demo uses a throwaway name that must stay absent). No `akrogon status` input check gates this leaf's own execution — its leaf has no `readiness.yaml`.

## Limitations and exclusions (preserved)

- check-issue:69 routing (B hands required live runs to A) unchanged — locked by criterion 3.
- `status <slug>` reports only `Missing:` gaps, so "present" is inferred from absent lines; the schema's `inputs` enumeration is the authority for which names exist.
- If `herdr notification show` fails in the demo environment, the `failed` move still commits and `failure.reason` is still recorded; the report records the non-zero exit as the announced-delivery limitation, not a silent retry.
- Scratch demo repos and `AKROGON_HOME` live outside the repo and are deleted after transcripts are copied (design Leaf architecture).
- Human-only prerequisite (operator, completed 2026-10-02 per design): `Bash(* .env*)` deny removed from `~/.claude/settings.json`; merge checks may read committed `.env.example`. The demo re-proves it per harness.
