# Leaf draft review, seat C: herdr-session

Disagreements only, as the implementer who must satisfy these drafts. Each item names evidence and the exact replacement text I propose. Drafts and Taken sections read 2026-10-24; source checks at c5cf7be7.

## session-routing

### R1. The brief runs `session list` per repo; the binding says once per invocation

The brief's What reads "For each repo, once per invocation and before its first pane or tab list, it runs `herdr session list --json` and then ...", which reads as one session list per repo. session-address Taken Q1 binds "one `herdr session list --json`" for the invocation, and criterion 3 (a failed session list reported once) is much easier to satisfy honestly from a single shared call than from per-repo calls plus report dedup.

Replace the brief's second sentence with:

> Once per invocation it runs `herdr session list --json`. For each repo, before that repo's first pane or tab list, it runs `herdr --session <name> workspace list` in every running session and picks the one workspace whose label equals the registered repo key exactly.

### R2. `src/log.ts` is a forced change in this leaf but is not an owned surface

This leaf changes `panes()` to take a session. `src/log.ts:40` calls `panes()` today, so between this leaf and session-reads the file must already pass the repo's resolved session or it does not compile. The design lists log.ts only under "Consumers relying on changed preconditions" and leaves its change to session-reads, whose scope there is the attribution rule, not the call signature.

In session-routing design, "Leaf architecture", extend the Owned surfaces entry for src/log.ts by adding it explicitly; replace "src/log.ts panes() (it inherits routing; its attribution rule changes in session-reads)" under Consumers with this addition to Owned surfaces:

> src/log.ts (its pane lookup passes the repo's resolved session; which pane it prefers is unchanged here and changes in session-reads)

### R3. readiness omits the stopped-session proof its own criterion 3 rests on

The design's proof paragraph claims "the door proved real herdr `--session` behavior at charting (operation-proofs P1-P7)", but readiness lists P1, P2, P4, P5, P6, P7 — no P3, and nothing proving an API call to a stopped session errors without starting it. Criterion 3 ("a session that answers server_not_running when read is skipped and never started") is the one criterion whose external behavior is not otherwise established by source alone at the binary level; the proof exists in the chart record (B's live stopped read, recorded in the stopped-and-ambiguous merged notes) but is not carried in this leaf.

Add to session-routing readiness.yaml proofs, after P2:

> - operation: 'P3 stopped-session read'
>   command: "herdr --session netreachconsulting workspace list"
>   identity: 'operator local user ivan, herdr CLI, no credential'
>   target: 'herdr session netreachconsulting (stopped)'
>   version: 'herdr 0.9.1'
>   date: '2026-10-24'
>   result: 'exit 1; structured server_not_running error; session still stopped afterwards'
>   cleanup: 'none, read only'
>   limits: 'one stopped named session; does not show a session stopping mid-pass'
>   record: issues/chart/herdr-session/forks/operation-proofs.md

## session-reads

### R4. Criterion 2 contradicts session-routing criterion 6 and the scoped-only binding

session-address Taken 2c binds reconcile `tabLive` as scoped-only: "the stored id is looked up in the resolved session only". session-routing criterion 6 restates that. session-reads criterion 2 says "Reconcile keeps a tab whose pane is live in any running session", which read literally requires union tab-liveness: a same-id tab in a foreign session would keep the recorded tab alive. `tabLive` and the cwd-based keeps are different functions with different bindings (`src/reconcile.ts:255` vs `:245` and `:251`), and the criterion does not separate them. As the second leaf's implementer I cannot satisfy both leaves' criteria at once.

Replace session-reads criterion 2 with:

> 2. Reconcile keeps a worktree when any pane in any running session has its cwd inside it. A recorded tab counts as live only when a tab with that id is live in the repo's resolved session; a same-id tab in another session does not keep it. When a running session is unreadable, reconcile closes nothing whose liveness that session could decide.

### R5. Criterion 6's positive arm has no consumer on the manual path

Criterion 6 ends: "When the value agrees with the established scope, it is used." On eventless runs nothing consumes `HERDR_PANE_ID`: selection is computed for every eventless run (`src/next.ts:1357-1361`, `(input !== undefined || !hooked)`), and the only `hookPane` consumers are the hook branch and its close-merged-tab gate (`src/next.ts:1463-1487`), reachable only when selection is undefined, which requires an event. So "it is used" names no observable behavior an implementer can build or test on the manual path without inventing a new consumer, which no Taken names.

Replace criterion 6 with:

> 6. Run by hand, akrogon takes its scope from cwd or the explicit target and does not select, attribute or act on a leaf from an inherited HERDR_PANE_ID, whether that pane is in another session or outside the scope. HERDR_PANE_ID may only narrow work inside an already-established scope (for example the close-merged-tab gate), never establish one.

### R6. The standing design paragraph puts event JSON "on stdin"; the interface is an env var

session-reads design says proofs drive hook invocations "with event JSON on stdin and a chosen injected socket". akrogon reads the event from `HERDR_PLUGIN_EVENT_JSON` in the environment (`src/next.ts:1339-1340`), and existing tests drive it the same way (`tests/next.test.ts:579`). Plans written from the stdin wording will build the wrong harness.

Replace that phrase with:

> with event JSON in the HERDR_PLUGIN_EVENT_JSON environment variable and a chosen injected HERDR_SOCKET_PATH

### R7. "Open for the plan: whether capacity is counted per repo or globally ... stays as today" is a decision, not an open item

The sentence answers itself. Capacity is one global `max_active` summed over registered repos today (`src/next.ts:354-370`), and no Taken reopens it. Left under "Open for the plan", a planner may spend a decision on settled ground or, worse, change it.

Delete the Open-for-the-plan line and add to Leaf architecture:

> Capacity remains one global max_active across registered repos, as today; this leaf changes only which sessions are read.

## watch-session

### R8. Criterion 3 cannot be met inside this leaf's ownership: the promised resolver has no binary seam

The leaf consumes "the shared resolver from src/shell.ts, delivered by session-routing", and its Exclusions give all of `src/` to the other two leaves. But session-routing's architecture never promises a resolver that accepts a herdr binary: `herdr()` builds argv starting with the literal `'herdr'` (`src/shell.ts:203`). Passing `OBSERVE_HERDR` into that resolver requires changing src/shell.ts, which this leaf does not own. The leaf's own Open-for-the-plan item ("how the OBSERVE_HERDR binary override is passed into the shared resolver without a second resolver") is therefore not a plan detail; it is a cross-leaf interface nobody has committed to provide. call-coverage Taken binds the outcome ("through the shared resolver, with the OBSERVE_HERDR seam threaded to it"), so the commitment belongs in session-routing's contract.

In session-routing design, "Leaf architecture", replace the src/shell.ts owned-surface parenthetical "(discovery, session-tagged reads, argv builder, herdr() with a session parameter and discovery deadline)" with:

> (discovery, session-tagged reads, argv builder, herdr() with a session parameter and discovery deadline; the argv builder and discovery take the herdr binary as a parameter defaulting to 'herdr', so watch-session can thread OBSERVE_HERDR through the same resolver)

And in watch-session design, delete the Open-for-the-plan line and add to Leaf architecture:

> The OBSERVE_HERDR override is passed as the resolver's herdr binary parameter, committed by session-routing; there is no second resolver.

### R9. Criteria 2 and 4 rest on an observer output contract that is not recorded anywhere

The brief says the observer "prints the resolved session" and criterion 4 makes SKILL.md name "the session the observer printed", but no line form is specified. The observer's current stdout contract is per-leaf lines plus `unreadable=` lines (`skills/watch-issues/scripts/observe.ts:240,261`), described for the watcher at `skills/watch-issues/SKILL.md:24`; an unplanned extra line will be read as a leaf line. Criterion 2 says the observer will "print the refusal", without a channel or exit code, while today's contract for a herdr failure is throw and exit non-zero naming the cause (`observe.ts:90-93`, asserted in its tests). The leaf owns "skills/watch-issues/SKILL.md acting commands", which does not clearly include the output-shape paragraph at SKILL.md:24 that must change with any new line.

Replace criterion 2 with:

> 2. A missing, duplicate or unreadable repo workspace makes the observer exit non-zero with the refusal on stderr and no status lines, the same failure shape as a herdr failure today.

In the brief's What, replace "It prints the resolved session" with:

> It prints `session=<name>` as its first stdout line, before any leaf lines

And in watch-session design, replace the Owned surfaces entry with:

> Owned surfaces: skills/watch-issues/scripts/observe.ts and its tests and fixtures, and skills/watch-issues/SKILL.md (the observe output description and the acting commands).

### R10. The fixture paragraph promises a step nobody in this leaf may run

The design says "Fixture JSON is re-recorded from real `herdr --session <name> agent list` output when the shape is needed, never hand-patched. The seat makes no real herdr call." Readiness grants for this leaf are empty, and the operation-proofs grant was bounded to the chart door, run once, done. So if a shape is needed, the leaf instructs a recording it forbids its own seat to make, with no owner named. In fact no new shape is needed: `--session` does not change the agent-list response shape (readiness P2 and P6 in this same leaf).

Replace those two sentences with:

> The existing recorded agent-list fixture stands unchanged: `--session` does not change the response shape (P2, P6). If a new shape is ever needed, re-recording from real output is a door operation under a new grant, not leaf-seat work.
