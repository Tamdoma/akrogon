# Intake: watch-one-read

## Scope

Destination repo akrogon (registered root /home/ivan/Work/infra/akrogon). One outcome: each watch-issues tick reads one minimal artifact that carries the paused state and every leaf line, so no tick depends on `akrogon status` output an agent can filter. Tamdoma/akrogon#153 was pulled with it but is already owned by the open leaf akrogon direct-visible/direct-leaf (`sources`, phase implement), so it is skipped, not consolidated.

## Provenance

- GitHub: Tamdoma/akrogon#160
- Operator: door message 2026-11-25 (t126)

## Source: Tamdoma/akrogon#160

# The watch reads akrogon status only for the paused check while observe.ts already prints every leaf line, so the tick has two overlapping sources and a watcher that filters the noisy one goes blind

Source: Tamdoma/akrogon#160
URL: https://github.com/Tamdoma/akrogon/issues/160

Origin repo: Tamdoma/pi-extensions

Unverified intake.

## Observation

On 2026-11-25 a pi watch (pi harness, hc session `infra`, timer `t3r5`) ran 18 ticks over about 6 hours. Leaf `footer-claude-format` merged around tick 9, leaving the board empty. Four new leaves (`omarchy-slots`, `model-looks-core`, `subagent-theme-chips`, `look-picker`, epic `pi-model-looks`) appeared in `issues/open` during that window, all in `plan.synthesis` with no seats. For six consecutive ticks the watcher reported "quiet board: no open leaves" and started nothing. The operator spotted the waiting leaves on his own screen and asked why the watch was not starting them.

Cause of the blindness, in the watcher's own words on that turn: on the quiet ticks it had filtered `akrogon status` output through grep and sed (noise-reduction habit), and the filters dropped exactly the leaf rows. `observe.ts` would have shown all four leaves regardless, but the watcher's eyes never went past the mangled status output. The unblocked leaf `omarchy-slots` waited roughly 40–60 minutes.

The mechanical fact underneath: the skill requires reading `akrogon status` at the top of every check for exactly one bit — whether the repo is paused — because `observe.ts` does not print the paused state. Everything else a tick needs (leaf lines, seats, failure records) already comes from `observe.ts` in a stable machine format. The tick therefore reads two overlapping artifacts: one minimal machine listing, one human-oriented multi-repo board carrying noise (unpacked-chart nags, the run-line queue of *other* repos, unrelated repo sections). The human-oriented one is the natural place for an agent to summarize, filter or skim — and it is the one carrying the rows that matter.

## Location

- `skills/watch-issues/SKILL.md` Observe section: "A check begins by running `akrogon status` at `<root>`" — required only for the paused mark; then `observe.ts` is run under a Bash timeout.
- `skills/watch-issues/scripts/observe.ts`: prints `session=` plus leaf lines; grep shows no `paused`/`pause` handling in `observe.ts` or `repo.ts`.
- The paused state itself: `src/pause.ts` (`~/.akrogon/paused.yaml`, `setPaused`), read by `akrogon status`.

## Reproduction

1. Start `watch-issues <root>` on a repo with no open leaves.
2. Let the board sit empty for several ticks so the watcher develops summarizing habits.
3. Chart new leaves into the repo.
4. Observe whether the watcher notices — depends entirely on the agent's filtering discipline that tick.

Frequency: once observed (2026-11-25, this report). The condition — two overlapping sources, the noisy one authoritative for one bit — is present on every tick of every watch.

## Expected behavior

Not provided by the reporter as a rule. The shape the operator and watcher discussed: `observe.ts` prints the paused state (one line), the skill drops the `akrogon status` dependency, and each tick reads exactly one minimal artifact — nothing noisy left to tempt filtering.

## Urgency

New work sits unstarted for tens of minutes to hours while the operator believes the watch is running; the failure is invisible in the watch's own replies ("quiet board" reads as a correct observation, not a blind spot). Workaround: operator vigilance, which is what the watch exists to replace.

## Suspected cause

Supported hypothesis. Main condition: the skill splits the tick's inputs across two artifacts with overlapping content but different noise levels, and the noisy artifact (`akrogon status` — multi-repo, run-line queue, chart nags) is the mandatory first read. Agents compress noisy output; that is what they are for. Any compression of the wrong artifact drops leaf rows. Contributing condition: the skill does not require reading the observe output *before* or *instead of* the status output, and nothing cross-checks the two — the watcher can honestly report "no open leaves" because its filtered reading showed none. Note the failure is not harness-specific: any agent that summarises its own evidence can reproduce it. `observe.ts` printing `paused=` would let the skill delete the status read entirely, removing the class rather than the instance.

Whose view: agent (the watcher's own post-mortem, confirmed by the operator).

Files read: `skills/watch-issues/SKILL.md` (Observe), `skills/watch-issues/scripts/observe.ts` (full main path, no pause handling), `skills/watch-issues/scripts/repo.ts` (no pause handling), `src/pause.ts` in the akrogon development checkout `/home/ivan/Work/infra/akrogon`, the tick transcripts of the pi watch on 2026-11-25.

Not inspected or would disprove: whether other harnesses' watchers hit this in practice (claude's earlier watches predate the observe script or used it differently — not verified); whether `observe.ts` printing paused would break any consumer of its current line format (the format is documented stable-field-order in the skill, so an added line is a format change seats may parse).

Related reports: Tamdoma/akrogon#159 (closed hours before this failure; same class — the watch path depending on operator or agent discipline where a mechanical removal exists). Tamdoma/akrogon#97 (closed; the busy-loop bar moved *into* log-tail.ts for the same reason — agent-counted evidence moved to mechanical output — a precedent for this fix direction). Searched Tamdoma/akrogon, all states: "observe script" (limit 8) and the filing account's reports since 2026-11-25 (limit 10). None covers the two-source tick input.

## Source: operator door message 2026-11-25

I jsut pulled the two new issues. Consolidate them and chart them. Full autopilot mode. Slot b consultant: agy neon xhigh. Slot c consultant: codex gpt 6.2 sol high. Then nudge w-akrogon watcher agent.

## Agent findings

- Pull at 2026-11-25T17:16:19Z: 2 open issues mirrored (#153, #160). Neither holds a `## Operator decision (...)` section except #153, whose identity is already in issues/open/direct-visible/direct-leaf/state.yaml `sources` and whose mirror equals its copy in issues/chart/direct-visible/INTAKE.md. #153 is skipped and stays open until direct-leaf delivers it.
- `src/next.ts` skips paused repos only for automatic passes (`isAutomatic && isPaused(repo.name)`, e.g. lines 982, 1193); an explicit `akrogon next <slug>` from the watch is not automatic, so the watch needs the paused bit itself.
- `skills/watch-issues/scripts/observe.ts` and `repo.ts` read no pause state; `src/pause.ts` exports `isPaused(repoName)`.
- `akrogon status` is read by the watch in `## Observe` (paused check) and by the start step (`watch-issues <root>` runs one check).
