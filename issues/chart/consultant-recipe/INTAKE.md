# Intake: consultant-recipe

## Scope

Destination: a machine config without `slots.consultant` can no longer pass silently and stall a watch consult at its first trigger. One destination, the akrogon repo. Grouping: one outcome.

## Provenance

- GitHub: Tamdoma/akrogon#159
- Operator: chart-issues door t126, 2026-11-25T13:44Z

## Source: Tamdoma/akrogon#159

# slots.consultant is optional in the schema and provisioned by nothing, so a config without it silently disables every watch consult until a human edits the file

Source: Tamdoma/akrogon#159
URL: https://github.com/Tamdoma/akrogon/issues/159

Origin repo: Tamdoma/pi-extensions

Unverified intake.

## Observation

On 2026-11-25 the pi-extensions leaf `footer-claude-format` failed `blocked@check.fix` on a human-prerequisite stop. The watch opened consult case `footer-claude-format-1` and tried to start the consultant through `akrogon seat --watch-consultant`, which failed:

```
error: akrogon seat --watch-consultant needs slots.consultant in /home/ivan/.akrogon/config.yaml
```

`~/.akrogon/config.yaml` on this machine has `slots.a` and `slots.b` but no `consultant` key. The config is valid under akrogon's own schema — `src/config.ts:26` declares `consultant: slotConfigSchema.optional()` — so nothing rejected it or warned about it at any point. The failure only surfaces inside a watch turn, mid-case, when the first human-prerequisite failure occurs. Until the operator edits the file by hand, every consult case jams: the leaf stays `failed` forever with no path forward, because the consult is the only sanctioned resume route for that failure class.

Timeline worth recording: framework consult cases (started by a claude watcher) opened and closed fine on 2026-11-23, so a working config existed on this machine two days before the failure. `config.yaml` was last modified 2026-11-24 23:37. What removed the key is unknown — see Suspected cause for what akrogon does and does not write.

## Location

- `src/akrogon.ts:149-152` — `akrogon seat --watch-consultant` hard-requires `global.slots.consultant`.
- `src/config.ts:26` — the global schema declares the key optional.
- `src/init.ts:88` — repo registration rewrites the global config preserving other keys, but never seeds `slots.consultant`.
- `src/state-home.ts:65` — the state-home migration copies the old config verbatim (minus retired `paid_budget`); it cannot invent the key either.
- `docs/reference/config.md:28,40-41` — documents the key as optional with no provisioning step.
- Consumer surface: the watch-issues skill's Consult section, which treats a missing recipe as a permanent notify-only dead end.

## Reproduction

1. Run `~/.akrogon/config.yaml` with `slots.a` and `slots.b` only.
2. Start a watch with `watch-issues <root>` on any registered repo.
3. Let a leaf fail `blocked` on a human-prerequisite stop (or hit any other consult trigger).
4. The watch opens the case; `consults.ts start` fails on the missing recipe; the leaf never moves again.

Frequency: every config without the key, first consult trigger.

## Expected behavior

Not provided by the reporter as a rule. Reasonable shapes: a fresh install or init seeds a `slots.consultant` default; or the schema refuses a config without it when the watch feature exists; or the seat command degrades to a documented fallback recipe. Any of the three removes the silent dead end.

## Urgency

One missing YAML key converts a recoverable leaf failure into a permanent stall, discovered only when the first hard failure lands — exactly the unattended-away situation the consult feature exists for (Tamdoma/akrogon#146). On this machine it stalled a completed, green leaf. Workaround: add the key by hand; the next tick starts the consultant.

## Suspected cause

Supported hypothesis. The feature shipped (per closed #146 and its operator decision: the recipe lives in `~/.akrogon/config.yaml` following the `slots:` convention) as an optional key that nothing writes: not install, not init, not the state-home migration, not any akrogon command. `docs/reference/config.md` documents it as optional. Every writer of the global config (`init.ts`, `state-home.ts`) preserves what is already there, so a config that never had the key keeps passing schema validation forever. Main condition: the schema's optional marker contradicts the hard requirement in the seat command. Contributing condition: the watch-issues skill has no way to notice the gap before the first consult trigger — the keys `slots.a`/`slots.b` presence makes the config look complete.

On the key's disappearance from this machine's config: no supported hypothesis. akrogon only writes the global config in `init.ts` (registration) and `state-home.ts` (migration), and both preserve unknown keys by spread. Not inspected: shell history, backups, or editor state around the 2026-11-24 23:37 modification. The defect stands either way: a config without the key is schema-valid and unprovisioned.

Whose view: agent.

Files read: `src/akrogon.ts:137-155`, `src/config.ts:17-107`, `src/init.ts:60-95`, `src/state-home.ts:51-82`, `docs/reference/config.md`, `docs/reference/commands.md` (development checkout `/home/ivan/Work/infra/akrogon`); installed release `~/.akrogon/releases/646819159203d8ba256d0990f85fd17b44c1bd78` (same behavior); the live `~/.akrogon/config.yaml`; consult case `/home/ivan/.akrogon/watch/pi-extensions/consults/footer-claude-format-1/`.

Not inspected or would disprove: whether install or upgrade output ever instructs the operator to add the key; the init-akrogon skill's operator-facing prompts (a grep for "consultant" in `skills/init-akrogon/SKILL.md` found nothing). If some onboarding flow does prompt for it and this machine's operator declined, the defect narrows to "no re-prompt or validation afterward".

Related reports: Tamdoma/akrogon#146 (closed; the feature decision itself — operator-decided that the recipe lives in `~/.akrogon/config.yaml` following the `slots:` convention; this report is about the provisioning gap the decision left). Searched Tamdoma/akrogon, all states: "slots consultant" and "watch-consultant recipe" (limit 8-10 each), plus the filing account's reports since 2026-11-24 (limit 10). None covers the provisioning gap.

## Source: operator chart-issues door t126 2026-11-25

Look at the latest issue that was pulled that came in just now. I need you to fix this. It's a pretty simple fix, so do the manual route. You can consult slot B, consultant C, and consultant D, which are already active in this tab. Full autopilot mode, and then manual route.

## Agent findings

- No `## Operator decision (...)` heading in the seed: no seed decision.
- Live surface 2026-11-25: `~/.akrogon/config.yaml` still has no `consultant` key (grep count 0).
- `src/config.ts` `globalSchema`: `slots.a` and `slots.b` required, `slots.consultant` `.optional()`. `src/akrogon.ts` `case 'seat'` throws when `global.slots.consultant` is undefined.
- The optional key came from watch-consultants fork `fix-and-config.md` item 6/7, an A autopilot pick on 2026-11-21 (not an operator answer); item 7 chose "absent recipe: exit non-zero, watch keeps notify-only".
- `skills/watch-issues/SKILL.md` `## Consult` carries the missing-recipe notify-only path.
- Landing on main deploys automatically (`docs/reference/releases-and-updates.md` "What starts a deploy"): the installed command changes soon after landing.
- Other open GitHub seeds #153, #157, #158 skipped (not this work); recorded only under autopilot.
