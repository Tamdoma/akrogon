Brief 1 report: leaf-temp-dir core src
Commit: 46e1f0661125e9f32ddbc978e15f559e47616346
Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/leaf-temp-dir-u1
Files: brief1-diff.patch, brief1-changed-tests.log, brief1-report.md

C1 leafTemp src/config.ts:132-139. Returns root plus 20-char prefix plus 12-hex sha. Unset picks production root. Blank or relative throws naming the override.
C2 allocate src/next.ts:300-327 ensure, 334-344 placement. Parent then leaf, 0700, TMPDIR pair, splits reuse placement.
C3 tab_closed src/next.ts:586-591 helper, 773-780 branch. Merged only, remove before dispatch, report on error.
C4 close/cleanup src/next.ts:593-599 had-live, 601-608 guard. Remove only when no live panes, before open return.

Changed files and reasons: src/config.ts add leafTemp D1; src/next.ts ensure plus placement D3, removal plus branches D4-D6.
Tests run: changed-test command 251 pass 0 fail 6 files 76.97s; typecheck pass.
Known limitations: prune failure after rm leaves stale entry; rollout panes keep old env; pre-brief2 test runs write real root (cleaned).
Unverified criteria: C1-C4 focused proof pending brief 2; here diff plus regression only.
