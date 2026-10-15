**D1 — Pick Git locking for direct-attempt retention.** Default keep of unknown registered worktrees is also valid, but needs precedence over #93's prefix classification; a direct checkout can otherwise look like a finished leaf's worker (`src/reconcile.ts:394–402`; `issues/open/worktree-cleanup/store-sweep/brief.md:14`).
`git worktree add --lock` declares retention at creation without a later add/lock gap (installed git-worktree manual:341–350). Chart-only authority retains the creation gap in `skills/chart-issues/SKILL.md:101` and does not cover manual worktrees.

**D2 — Keep existing unclassified worktrees until their owners decide; make the future policy an explicit operator choice.** My “remove unless declared” option was conditional on a documented disposable-store contract plus migration, not permission to remove current undeclared work.
If arbitrary raw `git worktree add` checkouts must survive idle gaps without a declaration, pick A/C's keep rule. Current removal of registered variants is explicit (`tests/reconcile.test.ts:493–500`), so changing it must be intentional.

**D3 — Pick release by the owning door, with protection transferred before lifecycle adoption.** Direct already owns landing/abandon cleanup and promises to retain growth-stop work (`skills/chart-issues/SKILL.md:113–123`).
A Closed/Held marker alone should not add a second remover. It does not establish that surviving processes are gone, and the proposed fallback needs its own safety/recovery contract. Handed off must preserve protection until the leaf owns the checkout.

**D4 — Keep removal auditing separate.** The historical caller is unknown because `reconcile` saves kept entries and returns removals that callers discard (`src/reconcile.ts:455–457`; `src/next.ts:1336,1450`).
An audit helps attribution but does not prevent deletion. Add it only as an explicitly chosen outcome, not a prerequisite for the live-work guard.

**F1 — The 23:20 process measurement is incorrectly attributed to B.** I measured only my own pane: `herdr pane process-info --pane w8:pNQ` returned shell pid 8135 and foreground codex pid 1143892, with the foreground cwd at akrogon. I did not measure the framework verify process.
Keep the foreground-group limitation attributed to B/C (`H@v0.9.1 src/app/api/panes.rs:517–545`, `src/platform/linux.rs:475–478`), but attribute the framework 23:20 observation only to its measuring slot. Also preserve the distinction that verify runs checks in a separate verify checkout (`src/verify.ts:126,152–170`).

**F2 — “No logical blocked-by” overstates B's position.** My map allowed a direct-lock change to land independently, but explicitly required a dependency for any implementation unit that consumes #93's not-yet-delivered process helper (`issues/open/worktree-cleanup/scratch-copy-removal/brief.md:17`; `issues/open/worktree-cleanup/store-sweep/brief.md:9`).
Replace the blanket agreement with: file overlap needs coordination, while actual helper consumption needs a dependency. If the new leaf owns the process-veto outcome, it cannot claim that outcome from code still being implemented elsewhere.

**F3 — “Lock tonight's live attempt now” overstates B P5.** I proposed a coordinated deployment/backfill step after proving the exact operation, not an already-proven immediate mutation. My read-only map ran no lock operation.
Keep existing-attempt protection as a required deployment step, with `git worktree lock --reason ... <existing-path>` proved and read back before relying on it. Creation with `add --lock` needs its own probe; documentation is not that live proof.

**F4 — Qualify “exposed on every pass.”** B verified the recreated direct checkout was clean, reachable and without operation markers, not that every current pass would remove it. `src/reconcile.ts:400–402` keeps it when pane inventory is unavailable or a pane cwd is inside.
Say it lacks durable protection and is removable whenever those remaining guards permit. That is enough to establish the defect without claiming an unconditional current deletion.
