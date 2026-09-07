#!/usr/bin/env bash
set -euo pipefail

case "${1-}" in
  '') (( $# == 0 )) || { printf 'Unexpected arguments\n' >&2; exit 2; }; contract_only=false ;;
  --contract-only) (( $# == 1 )) || { printf 'Unexpected arguments\n' >&2; exit 2; }; contract_only=true ;;
  *) printf 'Usage: %s [--contract-only]\n' "$0" >&2; exit 2 ;;
esac

ROOT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
SKILL_DIR="$ROOT_DIR/skills/chart-issues"
INSTALLER="$SKILL_DIR/scripts/install.sh"
FIXTURE_DIR="$SKILL_DIR/fixtures"
EVIDENCE_DIR="$ROOT_DIR/.evidence/chart-skill-upgrade/chunk-02"
mkdir -p "$EVIDENCE_DIR/runs"
EVIDENCE_DIR="$(mktemp -d "$EVIDENCE_DIR/runs/$(date -u +%Y%m%dT%H%M%SZ)-XXXXXX")"
printf 'Verification evidence: %s\n' "$EVIDENCE_DIR"
CHECK_STARTED_SECONDS=$SECONDS
printf '{"event":"started","at":"%s","contractOnly":%s}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$contract_only" >> "$EVIDENCE_DIR/events.jsonl"
OUTPUT_FILE="$EVIDENCE_DIR/verification-output.txt"
COMPARISONS_FILE="$EVIDENCE_DIR/per-file-comparisons.txt"
ASSERTIONS_FILE="$EVIDENCE_DIR/assertions.txt"
TMP_DIR="$(mktemp -d)"

mkdir -p "$EVIDENCE_DIR"
: > "$OUTPUT_FILE"
: > "$COMPARISONS_FILE"
: > "$ASSERTIONS_FILE"
exec > >(tee -a "$OUTPUT_FILE") 2>&1

remove_tree() {
  local root="$1"
  local entry

  [[ -e "$root" || -L "$root" ]] || return 0
  if [[ ! -d "$root" || -L "$root" ]]; then
    rm -f -- "$root"
    return 0
  fi
  while IFS= read -r -d '' entry; do
    if [[ -d "$entry" && ! -L "$entry" ]]; then
      rmdir -- "$entry"
    else
      rm -f -- "$entry"
    fi
  done < <(find "$root" -depth -mindepth 1 -print0)
  rmdir -- "$root"
}
finish_check() {
  local status=$?
  remove_tree "$TMP_DIR"
  printf '{"event":"finished","at":"%s","elapsedSeconds":%s,"exitStatus":%s,"costUSD":null,"usageStatus":"not-reported"}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$((SECONDS - CHECK_STARTED_SECONDS))" "$status" >> "$EVIDENCE_DIR/events.jsonl"
}
trap finish_check EXIT

fail() {
  printf 'FAIL: %s\n' "$1" | tee -a "$ASSERTIONS_FILE" >&2
  exit 1
}

pass() {
  printf 'PASS: %s\n' "$1" | tee -a "$ASSERTIONS_FILE"
}

assert_file() {
  local file="$1"
  [[ -f "$file" ]] || fail "missing file: $file"
}

assert_dir() {
  local directory="$1"
  [[ -d "$directory" ]] || fail "missing directory: $directory"
}

assert_contains() {
  local file="$1"
  local text="$2"
  grep -Fq -- "$text" "$file" || fail "missing '$text' in $file"
}

assert_not_contains() {
  local file="$1"
  local text="$2"
  ! grep -Fq -- "$text" "$file" || fail "unexpected '$text' in $file"
}

assert_contains_ci() {
  local file="$1"
  local text="$2"
  grep -Fqi -- "$text" "$file" || fail "missing case-insensitive '$text' in $file"
}

target_for_claude() {
  printf '%s/.claude/skills/chart-issues\n' "$1"
}

target_for_codex() {
  printf '%s/.codex/skills/chart-issues\n' "$1"
}

target_for_pi() {
  printf '%s/.pi/agent/skills/chart-issues\n' "$1"
}

compare_tree() {
  local expected="$1"
  local actual="$2"
  local relative

  assert_dir "$actual"
  printf 'COMPARE %s -> %s\n' "$expected" "$actual" >> "$COMPARISONS_FILE"
  diff -r --no-dereference "$expected" "$actual" >> "$COMPARISONS_FILE" || fail "tree differs: $actual"
  while IFS= read -r -d '' relative; do
    relative="${relative#./}"
    cmp -s "$expected/$relative" "$actual/$relative" || fail "file differs: $actual/$relative"
    printf 'MATCH %s\n' "$relative" >> "$COMPARISONS_FILE"
  done < <(cd "$expected" && find . -type f -print0 | sort -z)
}

run_install() {
  local home_dir="$1"
  local log_file="$2"
  local exit_status

  HOME="$home_dir" bash "$INSTALLER" > "$log_file" 2>&1
  exit_status=$?
  cat "$log_file"
  return "$exit_status"
}

assert_targets() {
  local home_dir="$1"
  compare_tree "$SKILL_DIR" "$(target_for_claude "$home_dir")"
  compare_tree "$SKILL_DIR" "$(target_for_codex "$home_dir")"
  compare_tree "$SKILL_DIR" "$(target_for_pi "$home_dir")"
}

before_status="$(git -C "$ROOT_DIR" status --porcelain -- . ':(exclude).evidence')"
assert_file "$INSTALLER"
assert_file "$SKILL_DIR/tests/verify-install.sh"
bash -n "$INSTALLER"
bash -n "$SKILL_DIR/tests/verify-install.sh"

stamp_lines="$(grep -E '^Chart skill version: [0-9]+$' "$SKILL_DIR/SKILL.md" || true)"
stamp_count=0
if [[ -n "$stamp_lines" ]]; then
  stamp_count="$(printf '%s\n' "$stamp_lines" | wc -l)"
fi
(( stamp_count == 1 )) || fail 'canonical SKILL.md must contain one version stamp'
canonical_stamp="$stamp_lines"
canonical_version="${canonical_stamp#Chart skill version: }"

source_snapshot="$TMP_DIR/source-snapshot"
mkdir -p "$source_snapshot"
cp -a -- "$SKILL_DIR/." "$source_snapshot/"
cmp -s "$SKILL_DIR/assets/standing-design.md" "$ROOT_DIR/skills/create-issue/assets/standing-design.md" || fail 'standing template differs from create-issue'
pass 'installer syntax, canonical stamp, and standing template'

fresh_home="$TMP_DIR/fresh-home"
mkdir -p "$fresh_home/.claude/skills"
printf 'keep this unrelated file\n' > "$fresh_home/.claude/skills/unrelated.txt"
fresh_log="$EVIDENCE_DIR/fresh-install.log"
run_install "$fresh_home" "$fresh_log" || fail 'fresh install failed'
assert_targets "$fresh_home"
cmp -s "$fresh_home/.claude/skills/unrelated.txt" <(printf 'keep this unrelated file\n') || fail 'fresh install removed an unrelated sibling file'
pass 'fresh install copied all three targets and preserved unrelated files'

update_home="$TMP_DIR/update-home"
mkdir -p "$update_home"
update_log_1="$EVIDENCE_DIR/update-seed.log"
update_log_2="$EVIDENCE_DIR/update-old.log"
run_install "$update_home" "$update_log_1" || fail 'update fixture seed install failed'
for target in "$(target_for_claude "$update_home")" "$(target_for_codex "$update_home")" "$(target_for_pi "$update_home")"; do
  sed -E 's/^Chart skill version: [0-9]+$/Chart skill version: 0/' "$target/SKILL.md" > "$target/SKILL.md.tmp"
  mv -- "$target/SKILL.md.tmp" "$target/SKILL.md"
  printf 'stale artifact\n' > "$target/stale.txt"
done
run_install "$update_home" "$update_log_2" || fail 'older-copy update failed'
[[ "$(grep -Fc 'is older than canonical' "$update_log_2")" == 3 ]] || fail 'older-copy warning count is not three'
assert_targets "$update_home"
for target in "$(target_for_claude "$update_home")" "$(target_for_codex "$update_home")" "$(target_for_pi "$update_home")"; do
  [[ ! -e "$target/stale.txt" ]] || fail "stale file survived update: $target/stale.txt"
done
pass 'older copies warned and updated without stale files'

repeat_log="$EVIDENCE_DIR/repeat-install.log"
run_install "$update_home" "$repeat_log" || fail 'repeat install failed'
assert_not_contains "$repeat_log" 'warning:'
assert_targets "$update_home"
pass 'repeat install is current and idempotent'

spaced_home="$TMP_DIR/home with spaces"
spaced_log="$EVIDENCE_DIR/spaced-install.log"
mkdir -p "$spaced_home/.codex/skills"
printf 'preserve sibling\n' > "$spaced_home/.codex/skills/unrelated file.txt"
run_install "$spaced_home" "$spaced_log" || fail 'install with spaces failed'
assert_targets "$spaced_home"
cmp -s "$spaced_home/.codex/skills/unrelated file.txt" <(printf 'preserve sibling\n') || fail 'install with spaces removed unrelated file'
pass 'paths with spaces are supported'

invalid_home="$TMP_DIR/invalid-destination"
mkdir -p "$invalid_home/.claude"
printf 'not a directory\n' > "$invalid_home/.claude/skills"
invalid_log="$EVIDENCE_DIR/invalid-destination.log"
if run_install "$invalid_home" "$invalid_log"; then
  fail 'invalid destination unexpectedly succeeded'
fi
cmp -s "$invalid_home/.claude/skills" <(printf 'not a directory\n') || fail 'invalid destination changed the blocking file'
[[ ! -e "$invalid_home/.codex" && ! -e "$invalid_home/.pi" ]] || fail 'invalid destination created later targets after preflight failure'
pass 'invalid destination failed before changing unrelated paths'

missing_root="$TMP_DIR/missing-source"
mkdir -p "$missing_root/scripts"
cp -- "$INSTALLER" "$missing_root/scripts/install.sh"
missing_home="$TMP_DIR/missing-source-home"
mkdir -p "$missing_home"
missing_log="$EVIDENCE_DIR/missing-source.log"
if HOME="$missing_home" bash "$missing_root/scripts/install.sh" > "$missing_log" 2>&1; then
  fail 'missing source unexpectedly succeeded'
fi
cat "$missing_log"
[[ ! -e "$missing_home/.claude" && ! -e "$missing_home/.codex" && ! -e "$missing_home/.pi" ]] || fail 'missing source created install destinations'
pass 'missing source failed without creating destinations'

version_fixture_root="$TMP_DIR/version-outputs"
mkdir -p "$version_fixture_root/archive" "$version_fixture_root/leaf"
versioned_files=(
  "$FIXTURE_DIR/chart/CHART.md"
  "$FIXTURE_DIR/chart/decisions/fixture-decision.md"
  "$FIXTURE_DIR/proposal-seed.md"
  "$FIXTURE_DIR/attended-series/brief.md"
  "$FIXTURE_DIR/attended-series/design.md"
  "$FIXTURE_DIR/attended-series/state.yaml"
  "$FIXTURE_DIR/attended-series/SERIES-fixture.md"
)
for file in "${versioned_files[@]}"; do
  assert_file "$file"
  assert_contains "$file" "$canonical_stamp"
done
cp -- "$FIXTURE_DIR/chart/CHART.md" "$version_fixture_root/archive/CHART.md"
cp -- "$FIXTURE_DIR/chart/decisions/fixture-decision.md" "$version_fixture_root/archive/fixture-decision.md"
assert_contains "$version_fixture_root/archive/CHART.md" "$canonical_stamp"
assert_contains "$version_fixture_root/archive/fixture-decision.md" "$canonical_stamp"
assert_contains "$FIXTURE_DIR/attended-series/state.yaml" "# $canonical_stamp"
assert_not_contains "$FIXTURE_DIR/attended-series/state.yaml" 'chart-skill-version:'
! grep -Eq '^(chart-skill-version|version):' "$FIXTURE_DIR/attended-series/state.yaml" || fail 'state.yaml has a chart version key'
pass 'chart, decision, seed, leaf, series, state, and archive outputs carry the stamp without a state key'

if [[ "$contract_only" == false ]]; then
portable_home="$TMP_DIR/portable-home"
portable_root="$TMP_DIR/portable-run"
mkdir -p "$portable_home" "$portable_root"
HOME="$portable_home" bash "$INSTALLER" > "$EVIDENCE_DIR/portable-install.log" 2>&1
cat "$EVIDENCE_DIR/portable-install.log"
portable_skill="$(target_for_claude "$portable_home")/SKILL.md"
portable_skill_prompt="$(<"$portable_skill")"
portable_seed_asset="$(<"$(target_for_claude "$portable_home")/assets/seed-shapes.md")"
portable_transcript="$EVIDENCE_DIR/portable-agent-transcript.txt"
portable_prompt='Using only the installed chart-issues skill and its local assets, return a compact transcript without calling tools or writing files. You are outside any akrogon checkout. Use these exact headings: Current comparison, Stale comparison, Unavailable comparison, Proposal seed. Under Current comparison, say the installed and canonical stamps match and the copy is current. Under Stale comparison, say a numerically older installed stamp must warn that the copy is older. Under Unavailable comparison, say canonical comparison is unavailable, do not claim freshness or staleness, and do not block proposal-seed work. Under Proposal seed, include the five core seed headings, the canonical chart skill stamp, and state that archive, leaf, series-index, chart-index, decision, and state outputs retain the stamp while state.yaml uses a comment rather than a key.'
portable_request="/skill:chart-issues
$portable_prompt"
portable_status=0
: > "$portable_transcript"
# The installed harness is chosen before the call: existence decides, a runtime failure is a
# loud gate failure, never a second billed attempt.
if command -v pi >/dev/null 2>&1; then
  printf 'portable harness: pi\n'
  (cd "$portable_root" && pi --no-session --no-context-files --no-tools --skill "$portable_skill" --append-system-prompt "$portable_skill_prompt" --append-system-prompt "$portable_seed_asset" --model openai-codex/gpt-5.6-sol --thinking low -p "$portable_request") > "$portable_transcript" 2>&1 || portable_status=$?
elif command -v claude >/dev/null 2>&1; then
  printf 'portable harness: claude\n'
  printf -v portable_claude_request '/chart-issues\n%s' "$portable_prompt"
  (cd "$portable_root" && claude -p --bare --no-session-persistence --permission-mode plan --permission-prompts none --disallowed-tools Bash Edit Write NotebookEdit --append-system-prompt "$portable_skill_prompt" --append-system-prompt "$portable_seed_asset" "$portable_claude_request") > "$portable_transcript" 2>&1 || portable_status=$?
else
  fail 'no installed agent for the portable chart transcript'
fi
(( portable_status == 0 )) || fail "portable chart transcript agent failed (exit $portable_status)"
assert_contains "$portable_transcript" 'Current comparison'
assert_contains "$portable_transcript" 'Stale comparison'
assert_contains "$portable_transcript" 'Unavailable comparison'
assert_contains_ci "$portable_transcript" 'canonical comparison is unavailable'
assert_contains "$portable_transcript" '# Seeded Issue'
assert_contains "$portable_transcript" "$canonical_stamp"
[[ ! -e "$portable_root/issues/open" ]] || fail 'portable agent invocation wrote intake output'
pass 'installed skill handled current, stale, and unavailable comparisons and portable seed output'

else
  printf 'Chunk contract checks only: live agent scenarios are required at leaf verification.\n'
fi

actual_log="$EVIDENCE_DIR/machine-install.log"
bash "$INSTALLER" > "$actual_log" 2>&1
cat "$actual_log"
assert_targets "$HOME"
for mirror in "$HOME/.claude/skills/chart-issues" "$HOME/.codex/skills/chart-issues" "$HOME/.pi/agent/skills/chart-issues"; do
  diff -r --no-dereference "$SKILL_DIR" "$mirror" >> "$COMPARISONS_FILE" || fail "machine mirror differs: $mirror"
done
compare_tree "$SKILL_DIR" "$source_snapshot"
git -C "$ROOT_DIR" diff --check
after_status="$(git -C "$ROOT_DIR" status --porcelain -- . ':(exclude).evidence')"
[[ "$before_status" == "$after_status" ]] || fail 'installer verification changed repository intake paths'
pass 'machine installation, all global comparisons, source preservation, and whitespace check'

if [[ "$contract_only" == true ]]; then
  printf 'PASS: deterministic chunk contract checks complete; live leaf verification remains required\n'
else
  printf 'PASS: chart installation verification complete\n'
fi
