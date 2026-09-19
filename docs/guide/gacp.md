# gacp

This Bash function stages files, commits them, pulls remote changes and pushes to origin/main.

Use it only when you have checked what will be committed. It stages the current directory and commits the entire staged index, including files staged earlier.

For the running example, use the main checkout:

```sh
cd ~/Work/widgets
git status --short
```

## The function

Paste this function into your Bash startup file:

```text
~/.bashrc
```

```bash
gacp() (
set -euo pipefail
branch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$branch" != "main" ]; then
  echo "gacp: on '$branch', not main. Finish or abort the rebase first: git rebase --continue / git rebase --abort" >&2
  exit 1
fi
git add .
git diff --cached --quiet || git commit -m "${1:-add issues}"
if ! git pull --rebase --autostash origin main; then
  conflicts="$(git diff --name-only --diff-filter=U)"
  git rebase --abort
  echo "gacp: conflict, rebase aborted, checkout unchanged. Files:" >&2
  echo "$conflicts" >&2
  echo "Resolve by hand: git pull --rebase --autostash origin main, fix the files, git add -A && GIT_EDITOR=true git rebase --continue && gacp" >&2
  exit 1
fi
git push origin main
)
```

The parentheses run the function in a subshell. Its shell options and exit commands do not change or close your interactive shell.

Load it in each open Bash shell:

```sh
source ~/.bashrc
type gacp
```

The second command should print the function definition.

## Beginner walkthrough, line by line

1. The shell options stop most unhandled command failures and reject unset variables.
2. The branch check requires main. A different branch or detached checkout stops the function.
3. Staging adds changes under the current directory.
4. If the index has changes, Git commits everything staged. The first argument is the message.
5. Pull fetches origin/main and rebases local commits onto it. Autostash temporarily stores unstaged changes.
6. Push sends the result to origin/main.

```text
Current directory changes     Already staged changes
            |                           |
         git add .                      |
            +-------------+-------------+
                          v
                    whole index
                          |
                   commit if changed
                          |
                          v
               pull origin/main
               rebase + autostash
                          |
                  +-------+-------+
                  |               |
               success          failure
                  |               |
                  v               v
                push       try rebase abort
                           stop with error
```

For export-csv, gacp commits the leaf records only if that is all you stage. A failed pull does not erase the local commit made earlier in this flow.

Pass a multiword message in quotes:

```sh
gacp "Add export-csv leaf"
```

With no argument, the default message is:

```text
add issues
```

If pull fails, the function tries to abort the rebase and report conflicting files. The earlier local commit still exists. The function's “checkout unchanged” message does not mean that it undid that commit.

A pull can also fail before a rebase starts. In that case, abort can fail too, and the function stops before printing its custom advice. Read Git's actual error and check the checkout:

```sh
git status
```

Resolve the reported problem before running the function again. Do not treat every pull failure as a merge conflict.

## When to use gacp vs akrogon sync

For routine issue-record updates, use:

```sh
cd ~/Work/widgets
akrogon sync
```

Sync selects eligible issue records and refuses unrelated staged files. It uses the configured remote and default branch.

Use gacp when you deliberately want its broader staging behavior and your project uses origin/main. For example, after writing the export-csv brief and state:

```sh
cd ~/Work/widgets
git status --short
gacp "Add export-csv leaf"
akrogon next export-csv
```

Check the status output first. Gacp does not know which files belong to the issue lifecycle.

## Check the scope before using the shortcut

The benefit is fewer commands for a deliberate ordinary Git commit. The cost is that the function has no knowledge of Akrogon's record rules.

At the repository root, staging includes all non-ignored changes beneath it. From a subdirectory, it stages that subtree. Previously staged changes remain part of the commit in either case.

Use sync for routine lifecycle records. Use gacp only when its full commit scope is what you intend.

Previous: [Files](files.md) · Next: [Merge](merge.md) · [Home](../../README.md)
