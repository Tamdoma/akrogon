# Initialization evidence

The installed Bun 1.4.0 help documents --changed=<val>. A real invocation against base a40ff4dbcf1811cb44ceeb35945bdecee17bcc95 exited 0 and reported no affected test files, as expected for documentation/configuration work. The proposed command includes a required-base guard and passes the actual base to Bun.

init.txt records the complete proposal and successful installed-command invocation from the registered root. config.txt is the separate leaf acceptance invocation and shows grounding.index: REFERENCE.md, repo: akrogon, and no worktree registration. Existing repo choices and global settings match the pre-init effective configuration. root-config-diff.txt shows the generated grounding/test_changed update and only serialization changes in global config. init-preservation.json proves package manifests, lockfiles, root ignore rules and root lesson bytes were preserved. The global config hash changed because init rewrote YAML formatting, not settings.

The root config and its global serialization change remain command-owned setup changes outside the leaf worktree. The leaf includes the generated issues/config.yaml. The relative root index target becomes available when REFERENCE.md merges. No temporary root index copy was created. The root already had an unrelated unresolved merge and other staged lifecycle work before setup; none was modified by this pass.

concurrency.json preserves the existing log events: seed-issue merged at 08:01:07 UTC and init-issues merged at 08:01:48 UTC on 2026-09-11 while pull-close's latest phase was implement. This is recorded lifecycle evidence, not a newly manufactured concurrency run or proof of simultaneous CPU activity.
