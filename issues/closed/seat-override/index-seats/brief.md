# Brief: index-seats

## What

An epic or issue index (`issues/open/<owner>/EPIC.md`, `issues/open/<owner>/ISSUE.md`, `issues/open/<epic>/<issue>/ISSUE.md`) may begin with a YAML front matter block holding `slots:` in the same whole-seat shape as `issues/config.yaml` (`a` and/or `b`, each `{harness, model, effort}`). `seats()` in `src/config.ts` takes an optional leaf path and resolves each seat independently, nearest wins: parent `ISSUE.md`, then grandparent `EPIC.md` at depth 3, then repo `issues/config.yaml`, then machine `config.yaml`. `launch()` in `src/next.ts` and the pre-allocation validation use that resolution; `akrogon config` run inside a managed leaf worktree prints the leaf-effective `slots`; `akrogon status <slug>` prints both effective seats with the file each came from; the status table marks a leaf whose seat comes from an index. One seat schema at every level: each value nonblank after trim and free of `'` and `"`. Leaf `state.yaml` is unchanged. The operator guide documents the block.

## Why

Seats are chosen per machine and per repo only, so a writing-heavy epic cannot run a writing model on seat A without changing every repo's default. The operator wants one place per epic or issue to say which model each seat uses, read by the same machinery that launches seats today.

## Done-criteria

1. With `slots: {a: {harness: <h>, model: <m>, effort: <e>}}` in an epic's `EPIC.md` front matter and nothing in its child `ISSUE.md`, `akrogon next <leaf>` starts seat A with the harness template filled from the epic's values and seat B from the repo or machine, observable in the recorded `herdr agent start` argv; the same block in the child `ISSUE.md` wins over the epic's for that issue's leaves; a standalone issue's `ISSUE.md` block applies to its leaves.
2. An index whose front matter does not parse, carries a key other than `slots`, a seat other than `a`/`b`, a missing field, a value blank after trim, a decoded value containing a quote character or a harness with no machine template makes `akrogon next`, `akrogon status` and `akrogon config` (in that leaf's worktree) exit non-zero before any tab or worktree is allocated, naming the index path and the parse or schema reason, and the seat whenever the failure belongs to one; the same nonblank and no-quote rule applies to machine and repo seats. (A,B)
3. `akrogon config` run with cwd inside a managed leaf worktree (a path recorded as `worktree` in a leaf state) prints `slots` resolved for that leaf; at the registered root, in an unrelated linked worktree and outside any repo it prints what it prints today.
4. `akrogon status <slug>` prints, after the state, both effective seats with the file each came from (an index path, `issues/config.yaml` or the machine `config.yaml`), labelled as the seats the next agent start uses; the status table's NOTE column carries `seats <index file name>` for a leaf whose A or B seat comes from an index and nothing extra otherwise.
5. An index with no front matter, or a file whose first line is not `---`, resolves exactly as before this leaf, and every existing open and closed leaf in this repo still parses under `akrogon status`.
6. `docs/guide/cheat.md` and `docs/guide/files.md` show the front matter block and the resolution order in one place each, and the blocking `checks` pass.
