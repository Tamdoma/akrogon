# Design: leaf-env-file

## Binding decisions, verbatim
Chart: framework repo issues/chart/worktree-isolation (registered root /home/ivan/Work/infra/tamdoma/framework).

### Outside inputs (forks/outside-inputs.md)
Applies: 2a only. 1a and 3a belong to check-env; detectRepoRoot to framework root-influence.
#### Taken
- 1a: akrogon runs the whole check command (lock, setup and check, also with no setup, plus advisory) inside a constructed env: base names HOME, declared PATH, TMPDIR, AKROGON_BASE, XDG_CACHE_HOME, NODE_DISABLE_COMPILE_CACHE, plus names declared in issues/config.yaml `env:`. The boundary guard also refuses when NODE_PATH, BUN_OPTIONS, BUN_INSTALL_CACHE_DIR, FFMPEG_BIN, CHROME_PATH or CDP_BROWSER_BINARY is set, or a global bunfig exists, catching hand runs. Seats keep the operator's PATH. detectRepoRoot refuses when CLAUDE_PROJECT_DIR differs from cwd's git toplevel. The `env:` list comes from actual check consumers. Operator, 2026-10-10.
- 2a: dispatch writes a real leaf `.env` (mode 0600) with the declared names copied from the root `.env`, replacing the symlink; rewritten at each new dispatch, reused while a tab is live, removed with the worktree. Evidence records names and the dispatch generation, never values or value-derived hashes. Env values that are file paths are declared as named outside inputs. Operator, 2026-10-10.
- 3a: declared tools resolved at dispatch; path and version recorded in each merge attempt record. Tools stay an allowed named input (boundary 1a). Operator, 2026-10-10.
- Foreclosed: 1b, 2b per-run capture, 2c link, 3b version pin.


### Exclusions
- The `env:` schema field is owned by check-env; this leaf is blocked by check-env and reads it. (B)
- Removal with the worktree: the existing worktree removal paths and worktree-reconciler remove the directory; nothing extra here.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation: tests use a real temporary repo with a real root `.env` and real dispatch helper calls, checking file mode, contents and that no value is printed (capture stdout and stderr and search for a sentinel value). No secret vault: values stay in the consumer repo's gitignored .env.

## Leaf architecture
Owned surfaces:
- `src/next.ts` `linkEnv` becomes `writeLeafEnv(repo, worktree, live)`: parses the root `.env` (dotenv syntax: `KEY=value`, comments, quotes), writes the declared subset atomically (temp file plus rename, mode 0600), skips rewrite when a live tab matches.
- `src/state.ts` State: `env_generation: number` and `env_names: string[]` recorded on the leaf state.
Interfaces: reads repo config `env:`.
Dependencies: blocked-by check-env (consumes the `env:` schema). (B)
