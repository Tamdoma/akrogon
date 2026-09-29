#!/usr/bin/env bash
# E2E for role-swap C9: scratch AKROGON_HOME, real lane CLI, no worktree.
set -u
LANE=/home/ivan/Work/infra/akrogon/issues/worktrees/role-swap
SCRATCH=$(mktemp -d /tmp/role-swap-e2e.XXXXXX)
HOME_DIR="$SCRATCH/home"
REPO="$SCRATCH/repo"
mkdir -p "$HOME_DIR" "$REPO/issues/open"
git init -b main -q "$REPO"
git -C "$REPO" config user.email "e2e@example.invalid"
git -C "$REPO" config user.name "E2E"
echo initial > "$REPO/file"
git -C "$REPO" add . && git -C "$REPO" commit -qm initial
git init --bare -b main -q "$SCRATCH/remote.git"
git -C "$REPO" remote add origin "$SCRATCH/remote.git"
git -C "$REPO" push -q origin HEAD:main
cat > "$HOME_DIR/config.yaml" <<'EOF'
slots:
  a: {harness: fake, model: strong-a, effort: high}
  b: {harness: fake, model: strong-b, effort: medium}
harnesses: {fake: "fake --model {model} --effort {effort}"}
repos: {e2e: "__REPO__"}
EOF
sed -i "s|__REPO__|$REPO|" "$HOME_DIR/config.yaml"
cat > "$REPO/issues/config.yaml" <<'EOF'
checks: {test: "bun test"}
grounding: none
EOF
mkdir -p "$REPO/issues/open/e2e/demo"
cat > "$REPO/issues/open/e2e/demo/state.yaml" <<'EOF'
slug: demo
phase: plan.synthesis
created: "2026-09-29"
repo: e2e
debate: "no"
blocked-by: []
EOF
echo "SCRATCH=$SCRATCH"
run() {
  echo "\$ $*"
  (cd "$REPO" && AKROGON_HOME="$HOME_DIR" HERDR_PANE_ID="" bun "$LANE/src/akrogon.ts" "$@")
  echo "exit=$?"
}
run phase demo implement --slot A
run phase demo check.review --slot A
run phase demo check.fix --slot A --verdict ready
run phase demo merge --slot B --verdict fix
cp "$REPO/issues/open/e2e/demo/state.yaml" "$SCRATCH/state-before-refusal.yaml"
run phase demo check.review --slot B
echo "--- state unchanged by refusal? ---"
diff "$SCRATCH/state-before-refusal.yaml" "$REPO/issues/open/e2e/demo/state.yaml" && echo "UNCHANGED"
run phase demo check.review --slot A
run phase demo merge --slot B --verdict ready
run phase demo merged --slot B
echo "--- closed? ---"
ls "$REPO/issues/closed/e2e/demo/state.yaml"
echo "--- log ---"
cat "$REPO/issues/log.jsonl"
