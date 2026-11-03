# Builds the operator checklist repo: main, a feature branch with a merge commit, a clean tree.
set -eu
R=$1; rm -rf "$R"; mkdir -p "$R"; cd "$R"
export GIT_AUTHOR_NAME=check GIT_AUTHOR_EMAIL=check@local GIT_COMMITTER_NAME=check GIT_COMMITTER_EMAIL=check@local
git init -q -b main
printf '# Check repo\n\nA **formatted** heading test.\n\n- one\n- two\n' > README.md
mkdir -p src/sub docs; echo a > src/sub/a.txt; printf '# Guide\n\nSome *guide* text.\n' > docs/guide.md
git add -A; git commit -qm "root commit"
git checkout -qb feature
echo b > src/sub/b.txt; git add -A; git commit -qm "add b"
git checkout -qb side; echo c > docs/c.txt; git add -A; git commit -qm "add c on side"
git checkout -q feature; echo b2 >> src/sub/b.txt; git commit -qam "change b"
git merge -q --no-ff side -m "merge side"
git branch -qD side
git log --oneline --graph
