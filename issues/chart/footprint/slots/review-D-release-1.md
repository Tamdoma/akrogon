# Release archive review

Verdict fix

- Base `9656cd1f9739a5e957f3e0d4372a231e2058bcae`
- Head `0a74a994869d81c28487e5b5d454aaa6ee942f45`

1. F1 `docs/reference-index.md:7` links to an issue directory that the release no longer ships. Open `docs/README.md:58` from the installed release, follow the reference index, then click **Issue records**. The target `../issues/` is missing. The link check in `tests/docs-links.test.ts:117` passes in an extracted base archive and fails in an extracted head archive with `missing file ../issues/`. Point the index reader to the source checkout for issue records.

The actual `git archive` output shrank from 186.05 MB to 5.36 MB. The extracted head archive passed `config`, `status --json`, and `install` smoke checks with a separate registered checkout. Config reads `issues/config.yaml` from that checkout (`src/config.ts:277`). Install, state migration, self-update and the skill scripts checked have no dependency on issue files in the release tree.

All 85 targeted tests passed in the review worktree with `--max-concurrency=5` across release deploy, rollback, self-update, install and state home. In the extracted head archive, 84 of those tests passed. The remaining rollback test builds an older commit from Git history (`tests/rollback.test.ts:117`), so it requires a Git checkout.
