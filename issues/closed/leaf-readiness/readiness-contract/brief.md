# Brief: readiness-contract

## What
A leaf folder may hold a door-written `readiness.yaml` beside `state.yaml`. A new `src/readiness.ts` owns its schema (`readinessSchema`, literal in design.md), resolves each `holder` (a registered repo key from global config `repos`, or an absolute directory path for an unregistered repo), and computes gaps: an `env` input is missing when the holder's `.env` is absent, lacks the name, or holds an empty or whitespace-only value; a `file` input is missing when `<holder root>/<name>` is absent or zero bytes. `akrogon next` refuses to dispatch a leaf with any gap, at the same point as the `blocked-by` gate: an explicit `akrogon next <slug>` exits non-zero naming every missing input; an implicit pass leaves it waiting. `akrogon status` prints one `Missing:` line per gap across open leaves with the input's kind, name, holder and stored `steps`; `akrogon status <slug>` prints the same lines for that leaf. No command prints an env value. A leaf without `readiness.yaml` behaves exactly as today. An invalid `readiness.yaml` is reported with its path and the leaf is skipped, like any unreadable leaf.

## Why
Required external inputs live only in brief prose today (`src/state.ts:35-58` has no field), so 15 of 22 failed transitions in the emdash epic came from keys, scopes, files and approvals found mid-leaf (Tamdoma/akrogon#52). The operator chose a door-written contract that akrogon checks before dispatch, with every gap and its steps in `status`.

## Done-criteria
1. `tests/readiness.test.ts` (new): `readinessSchema` accepts a complete example holding every section, and refuses an unknown key, a whitespace-only text field, a fixture without a cleanup step, a retained record without `exposure`, and an unknown `kind`. (A,B)
2. `tests/readiness.test.ts`: holder resolution returns the registered root for a repo key and the directory for an absolute path, and throws naming the holder for an unregistered key or a relative path.
3. `tests/next.test.ts`: for a leaf whose `readiness.yaml` declares env `FOO` held by its own repo, `akrogon next <slug>` exits non-zero naming `FOO` and creates no worktree, branch, tab or pane when `.env` is absent, when `FOO` is absent, when `FOO=`, and when `FOO="  "`; with `FOO=x` it dispatches. A declared `file` input that is absent or zero bytes refuses the same way and a non-empty file dispatches. An implicit `akrogon next` leaves the gapped leaf undispatched and dispatches an ungapped sibling.
4. `tests/next.test.ts`: an input held by an unregistered absolute directory is checked against that directory's `.env`.
5. `tests/status.test.ts`: `akrogon status` and `akrogon status <slug>` print a `Missing:` line with kind, name, holder and steps for each gap; with `.env` holding `OTHER=secretvalue123` and `FOO` absent, neither output contains `secretvalue123`.
6. `tests/next.test.ts`: an invalid `readiness.yaml` makes `akrogon next <slug>` report the file path and skip the leaf.
