# Leaf review: merged (B, C, D, E), 2026-11-07

Sources: leaf-review-B.md .. -E.md. Verdicts: all four "changes needed".

## E checked by A

E's items 4 (nonexistent paths `src/herdr.ts`, `src/dispatch.ts`, `handover-reset.ts`, ...), 6.1 (watcher brief contradiction) and its D1/D2 reasoning (P10 as a Claude permission proof, P9 as `hc status`) do not match the drafts or proofs.md: grep over `slots/handoff/` finds none of those paths, and the watcher brief has no notice line. E1 (`claude-opus-5-5` invalid, "No slot changes") is rejected: it is the Opus 5.5 model id, the seat block is the operator's request (INTAKE "Source: operator 2026-11-07 (seats)"), and config's "No slot changes" was about the agy entry. E7 (chain herdr-setup leaves on `install` overlap) is rejected: shapes.md Handoff tree, "only actual prerequisites enter blocked-by", file overlap is not one. Kept from E: the true parts of 3, 4, 6, 8, 9 below.

## Agreed, to apply

- K1 Prefixes: one top-level `prefixes:` map (B,C,D,E agree on shape). Timing: deploy-listener-ready accepts an optional, unused `prefixes:` so the operator fills it before the switch (C,E; B: gate first dispatch on N1). D's "after deploy" is superseded by this.
- K2 Old plugin registration: deleting files does not unregister it; the no-`plugin/` deploy and install path runs `herdr plugin unlink` (or disable) while `herdr` exists, proven by `herdr plugin list` (D,B).
- K3 Consultant column has no owner or proven operation (B,C,E): owner and native operation to be named and proven by a free window probe before handoff.
- K4 Readiness inputs for herdr-setup installs: chart-door-on-hc waits on `~/.local/bin/herdr-consultant-heights`, notices-on-hc on the installed status handler file (B,E). N1 codex/agy lines become a pre-handoff operator step.
- K5 Live-run criteria name no session count (E) and every criterion passes before merge: watcher-on-hc runs its own watcher check (C); chart-door-on-hc proves nudge and drop in one attended consultant round, tests cover wiring only (C).
- K6 Watcher stop: a kind that neither key stops falls to today's notify path, recorded as a limit (C,B); agy gets a stop check in the watcher grant (B).
- K7 Shared old helpers: `src/shell.ts` keeps `herdrArgv`, `repoSession` and the schemas `observe.ts` and `tests/fake-herdr.ts` import until their last consumer moves (watcher-on-hc, herdr-sweep) (B,E); notices-on-hc's grep covers notice callers only (B,C,E).
- K8 New CLI verbs add their rows to `docs/reference/commands.md` (`tests/command-reference.test.ts`) (E).
- K9 Closed leaf states stay parseable; only an open pre-hc leaf is refused (D).
- K10 engine criterion 14 excepts the integration loop and the plugin conditional (B,C).
- K11 deploy-listener-ready criterion 4 names no `issues/` path (C).
- K12 Merged tab close by `herdr-app do tab.close --id <tab>` (C); fixture core seeds the `herdr-app` document from a window-tier recording (C).
- K13 `noticeCovers`: pending covers while the file exists, shown covers, a failed write never (C). Posting failure kept-file case moves to status-notices' routine test (C).
- K14 update-check: socket existence first, `chmod 000` for "does not answer" (C,B); clone diffs report only, a failing behavior test is the deliberate break (D,B); loaded-build observation needs a named source (C,B).
- K15 Fixture cleanup removes only recorded exact paths and trust entries, strips inherited HC_* on every cleanup call; the skill grant's stop line allows only its own trust entries; transcript histories named (B).
- K16 herdr-skill: a harness that still does not load after one wording repeat is recorded as a limit (C); agy's real skill loader path observed (C,B).
- K17 Upstream feedback drafts: each leaf that meets a real gap writes the draft text in its report; the operator sends (B).
- K18 LESSONS :11 generalized to the hc boundary, not retired (B).
- K19 sweep: criterion 5 keeps only the duration (C); Pending steps written into CHART.md at handoff from cutover's removal list, the sweep refines them (C); infra session Tasks link in the list with its absence check (D).
- K20 Final proof: a concrete door grant with a stage table (B,C,D); C counts 9 sessions.

## Split, for the operator

- S1 D1, `plugin/` deleted in engine-on-hc: C, D, E agree. B disagrees: signposts 2a and cutover put removal after the full proof; keep the files inert until the sweep and deactivate the old plugin instead.
- S2 Bootstrap (B F1): handing off the whole epic now leaves open leaves at the switch, while cutover's drain says no open leaf anywhere, and CHART.md says the engine is built "by the door or by hand". C, D, E did not raise it.
- S3 Typed-input cancel and empty-input confirmation (B F5): no hc field shows unsubmitted input. A: keep today's sources (transcript input records per kind for the reset helper, SKILL.md Handover; screen read for the watcher), stated as limits.
