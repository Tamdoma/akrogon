# Brief: leaf-env-file

## What
At dispatch akrogon writes a real `.env` file (mode 0600) into the leaf worktree holding only the names declared in the repo config `env:` list, with values copied from the registered checkout's `.env`, replacing today's symlink to the root `.env`. The file is rewritten at each new dispatch, reused while a tab is live, and removed with the worktree. akrogon records the declared names and the dispatch generation for the leaf, never values or value-derived hashes.

Consumes from check-env: the `env:` schema field in the repo config. (B)

## Why
The `.env` symlink lets any change to the root `.env` change a leaf's check result mid-run, and exposes every root secret to every leaf.

## Done-criteria
1. After dispatch the leaf worktree's `.env` is a regular file, mode 0600, holding exactly the declared names with the root's values; undeclared root names are absent.
2. Changing the root `.env` while a leaf tab is live leaves the leaf's `.env` unchanged; the next dispatch with no live tab rewrites it and bumps the generation.
3. A declared name missing from the root `.env` stops dispatch naming it; no value appears in any akrogon output, log or state.
4. The existing refusals stay: `.env` tracked by git or not ignored in the worktree or the registered checkout stops dispatch naming the path.
