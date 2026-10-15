Recommendation

D1. Use O1: a dedicated run checkout, deployed from an explicitly selected upstream commit, with the workspace remaining the record holder. Root edits and restores then cannot change installed code. Deploying the runtime must not depend on successfully moving the dirty workspace checkout.
D2. There is no equivalent fix with the same editable bytes serving both development and execution. Avoiding a second Git checkout is possible with an installed release artifact, but that still stores separate runtime bytes. A Git lock or another instruction cannot provide that separation.
D3. Separate runtime deployment from record synchronization. A workspace overlap can still leave its checkout pending, but must neither prevent runtime deployment nor undo an installed feature. Keep the existing record-preservation behavior.

Alternatives

O1. Dedicated detached run worktree: smallest fit for this source-based tool and its assets, but needs an explicit deployment path rather than the current repo updater.
O2. Installed executable/package plus skills, plugin and systemd assets: removes the runtime Git checkout, but adds packaging and asset-version coordination; it does not meet a literal no-copy requirement.
O3. Make the root installation-only and develop in worktrees: reuses the installed path but moves the workspace elsewhere; another instruction alone repeats the failure already observed.
O4. Refuse dirty roots, add hooks, or mark files read-only: guards or disables development instead of separating it; it does not make a dirty workspace independently deployable.
O5. Automatically stash, reset or overwrite root edits during update: risks work and changes the workspace merely to operate the application.
O6. Execute committed Git blobs directly: requires a loader or virtual filesystem for modules, dependencies and assets; temporary extraction is another copy and is more machinery than O1.

Code constraints

F1. Runtime and state roots are coupled: `toolRoot` comes from the executing module, and `globalHome()` defaults to it (`src/config.ts:195–206`). Moving the executable also changes config lookup, relative repo resolution (`src/config.ts:210`) and the coordination lock (`src/sync.ts:26`). Preserve one explicit state home across old and new invocations.
F2. Root identity is not installation identity: `selfUpdate` compares `repo.root` with `toolRoot` (`src/self-update.ts:208–211`), then gates dependency installation and its lock on that equality (`:230`, `:252–257`). With O1, updating the registered workspace skips both. Existing tests explicitly require that behavior (`tests/install.test.ts:529–544`).
F3. The existing updater cannot simply target the detached run checkout: `gitStage` skips detached HEAD (`src/self-update.ts:31–41`). Its integration also requires the configured default branch (`src/sync.ts:27–32`). Give deployment its own target and operation; keep record integration attached to the registered workspace.
F4. Today one operation integrates records, moves the workspace and installs dependencies (`src/self-update.ts:75–99`, `:188–194`, `:222–230`). Separate those outcomes so a record conflict or overlapping workspace edit is not a runtime deployment prerequisite. Registered-repo iteration currently supplies the update targets (`src/next.ts:1377–1385`).
F5. The CLI is only one live link: installation links skills and the systemd slice too (`src/install.ts:14–24`), and links the Herdr plugin separately (`:66`). Migrate all executable/instruction assets together. Old links are conflicts, not automatically retargeted (`:38–52`), and stale-skill pruning recognizes only the supplied source-root prefix (`:27–35`).
F6. Preserve the authoritative record root: `currentRepo` already resolves worktrees through their common Git directory (`src/config.ts:229–248`). Do not register the run checkout as a second copy of the same repo. Record eligibility and writes remain tied to the registered root (`src/sync.ts:6–13`, `:28`).
F7. An in-place run-checkout update is not automatically an atomic release: the CLI uses dynamic imports (`src/akrogon.ts`), and install changes dependencies after moving code (`src/self-update.ts:188–194`, `:222–230`). Define how an invocation stays on one version and how a failed install avoids activating a partial update.
F8. “Only self-update moves it” describes an ownership convention unless access is enforced. O1 removes accidental workspace-edit coupling, not arbitrary writes by the same user to the run directory. A Git worktree lock does not prevent file edits.

Scope: code inspection only. No repository changes, deployment, packaging experiment or tests were run.
