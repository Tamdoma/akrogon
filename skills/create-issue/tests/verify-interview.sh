#!/usr/bin/env bash
set -euo pipefail

case "${1-}" in
  '') (( $# == 0 )) || { printf 'Unexpected arguments\n' >&2; exit 2; }; contract_only=false ;;
  --contract-only) (( $# == 1 )) || { printf 'Unexpected arguments\n' >&2; exit 2; }; contract_only=true ;;
  *) printf 'Usage: %s [--contract-only]\n' "$0" >&2; exit 2 ;;
esac

ROOT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
SKILL_FILE="$ROOT_DIR/skills/create-issue/SKILL.md"
FIXTURE_DIR="$ROOT_DIR/skills/create-issue/fixtures"
EVIDENCE_DIR="$ROOT_DIR/.evidence/chart-skill-upgrade/chunk-03"
mkdir -p "$EVIDENCE_DIR/runs"
EVIDENCE_DIR="$(mktemp -d "$EVIDENCE_DIR/runs/$(date -u +%Y%m%dT%H%M%SZ)-XXXXXX")"
printf 'Verification evidence: %s\n' "$EVIDENCE_DIR"
CHECK_STARTED_SECONDS=$SECONDS
printf '{"event":"started","at":"%s","contractOnly":%s}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$contract_only" >> "$EVIDENCE_DIR/events.jsonl"
OUTPUT_FILE="$EVIDENCE_DIR/verification-output.txt"
ASSERTIONS_FILE="$EVIDENCE_DIR/assertions.txt"
TRANSCRIPT_DIR="$EVIDENCE_DIR/transcripts"
TMP_DIR="$(mktemp -d)"

mkdir -p "$EVIDENCE_DIR" "$TRANSCRIPT_DIR"
: > "$OUTPUT_FILE"
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

assert_contains() {
  local file="$1"
  local text="$2"
  grep -Fq -- "$text" "$file" || fail "missing '$text' in $file"
}

assert_contains_ci() {
  local file="$1"
  local text="$2"
  grep -Fqi -- "$text" "$file" || fail "missing case-insensitive '$text' in $file"
}

assert_not_contains() {
  local file="$1"
  local text="$2"
  ! grep -Fq -- "$text" "$file" || fail "unexpected '$text' in $file"
}

assert_empty_directory() {
  local directory="$1"
  [[ -d "$directory" ]] || return 0
  [[ -z "$(find "$directory" -mindepth 1 -maxdepth 1 -print -quit)" ]] || fail "unexpected output in $directory"
}

assert_three_files() {
  local directory="$1"
  [[ "$(find "$directory" -maxdepth 1 -type f | wc -l)" == 3 ]] || fail "unexpected file count in $directory"
  [[ -z "$(find "$directory" -mindepth 1 -maxdepth 1 ! -type f -print -quit)" ]] || fail "unexpected directory in $directory"
}

prepare_fixture() {
  local fixture_root="$1"

  mkdir -p "$fixture_root/.pi/agent/skills/create-issue" \
    "$fixture_root/.pi/agent/skills/chart-issues/assets" \
    "$fixture_root/issues"
  cp -a -- "$ROOT_DIR/skills/create-issue/." "$fixture_root/.pi/agent/skills/create-issue/"
  cp -- "$ROOT_DIR/skills/chart-issues/assets/materialization-contract.md" \
    "$fixture_root/.pi/agent/skills/chart-issues/assets/materialization-contract.md"
  printf '%s\n' 'repos:' '  akrogon:' '    path: /isolated/akrogon' '  framework:' '    path: /isolated/framework' > "$fixture_root/issues/config.yaml"
  git -C "$fixture_root" init -q
}

run_readonly_agent() {
  local working_dir="$1"
  local skill_path="$2"
  local prompt="$3"
  local transcript="$4"

  : > "$transcript"
  # The installed harness is chosen before the call: existence decides, a runtime failure is a
  # loud gate failure, never a second billed attempt.
  if command -v pi >/dev/null 2>&1; then
    printf 'readonly harness: pi\n'
    (cd "$working_dir" && pi --no-session --no-context-files --no-tools --skill "$skill_path" --model openai-codex/gpt-5.6-sol --thinking low -p "$prompt") > "$transcript" 2>&1
    return
  fi
  if command -v claude >/dev/null 2>&1; then
    local skill_text
    skill_text="$(<"$skill_path")"
    printf 'readonly harness: claude\n'
    (cd "$working_dir" && claude -p --bare --no-session-persistence --permission-mode plan --permission-prompts none --disallowed-tools Bash Edit Write NotebookEdit --append-system-prompt "$skill_text" "$prompt") > "$transcript" 2>&1
    return
  fi
  fail 'no installed read-only agent harness (pi or claude)'
}

run_writable_agent() {
  local working_dir="$1"
  local skill_path="$2"
  local prompt="$3"
  local transcript="$4"

  command -v codex >/dev/null 2>&1 || fail 'Codex is required for the artifact-emission transcript'
  local skill_text
  skill_text="$(<"$skill_path")"
  : > "$transcript"
  printf 'writable harness: codex\n'
  local status=0
  (cd "$working_dir" && printf '%s\n\n%s\n' "$skill_text" "$prompt" | codex exec --ephemeral --ignore-user-config --ignore-rules -C "$working_dir" -s workspace-write -c approval_policy='"never"' --skip-git-repo-check -m gpt-6-astra -) > "$transcript" 2>&1 || status=$?
  (( status == 0 )) || fail "writable agent invocation failed (exit $status)"
}

before_status="$(git -C "$ROOT_DIR" status --porcelain -- . ':(exclude).evidence')"
assert_file "$SKILL_FILE"
assert_file "$FIXTURE_DIR/transcript.md"
assert_file "$FIXTURE_DIR/import/chart-proposal.md"
assert_file "$ROOT_DIR/skills/create-issue/tests/verify-interview.sh"
bash -n "$ROOT_DIR/skills/create-issue/tests/verify-interview.sh"

assert_contains "$SKILL_FILE" 'issue-proportional territory map'
assert_contains "$SKILL_FILE" 'Main forks'
assert_contains "$SKILL_FILE" 'Questions an experienced practitioner would ask'
assert_contains "$SKILL_FILE" 'Mistakes a beginner might make without noticing'
assert_contains "$SKILL_FILE" 'Before round 1'
assert_contains "$SKILL_FILE" 'Chart Decision Review'
assert_contains "$SKILL_FILE" 'agree-or-better-idea'
assert_contains "$SKILL_FILE" 'one explicit operator ruling'
assert_contains "$SKILL_FILE" 'Only the importing operator'
assert_contains "$SKILL_FILE" 'Challenge check'
assert_contains "$SKILL_FILE" 'zero questions'
assert_contains "$SKILL_FILE" 'Do not score proposals or add a review round'
assert_contains "$SKILL_FILE" 'proposal table entry or source-chart recommendation cannot answer'
assert_contains "$SKILL_FILE" 'one series confirmation'
assert_contains "$SKILL_FILE" 'no per-leaf create-issue interview'
assert_not_contains "$SKILL_FILE" 'better-than-training'
assert_not_contains "$SKILL_FILE" 'micro-prototype'
assert_not_contains "$SKILL_FILE" 'scripts/install.sh'
assert_not_contains "$SKILL_FILE" 'Chart skill version:'
cmp -s "$FIXTURE_DIR/import/chart-proposal.md" "$ROOT_DIR/skills/chart-issues/fixtures/proposal-seed.md" || fail 'colleague fixture differs from chunk 02 proposal seed'
assert_contains "$FIXTURE_DIR/transcript.md" '## Territory map (before round 1)'
assert_contains "$FIXTURE_DIR/transcript.md" '## Chart Decision Review'
[[ "$(grep -Fc 'Challenge check' "$FIXTURE_DIR/transcript.md")" == 4 ]] || fail 'fixture transcript does not close every round'
assert_contains "$FIXTURE_DIR/transcript.md" 'zero-question substantive round'
pass 'create-issue contract, fixtures, scope exclusions, and transcript coverage'

if [[ "$contract_only" == false ]]; then
readonly_root="$TMP_DIR/readonly"
prepare_fixture "$readonly_root"
readonly_prompt='Use the loaded create-issue skill in this isolated akrogon checkout. Do not call tools, do not write files, and stop before final confirmation. Produce one reply with two parts. Part 1: return a compact transcript for this small creation request: "Create small-change. Make the command-line invalid-repo error actionable and keep valid-repo behavior unchanged." Show an issue-proportional Territory map before Round 1 with Main forks, Questions an experienced practitioner would ask, and Mistakes a beginner might make without noticing. Show one Question and its explicit operator answer. Close that round with the exact heading Challenge check and the question "What would an experienced practitioner challenge in this round'\''s answers?". Then show a zero-question substantive round and close it with Challenge check. Head that round exactly "Zero-question round". Do not emit any file path and do not use chart-only research, prototype, installer, or series machinery. Part 2: return five compact records with these exact headings: Rejected proposal, Omitted ruling, Missing machinery lock, Invalid repo, Absent confirmation. In Rejected proposal, show that the importing operator may reject a colleague chart proposal only by writing a different explicit ruling, and that the other gates still apply. In each of the other four records, state that emission is blocked and no recommendation or default silently closes the missing answer. For Invalid repo, list akrogon and framework and leave the repo question open. For Absent confirmation, leave the final confirmation unanswered. Include Chart Decision Review with one proposal, one importing-agent agree-or-better-idea line, and one operator ruling only in the rejected-proposal record.'
readonly_status=0
run_readonly_agent "$readonly_root" "$readonly_root/.pi/agent/skills/create-issue/SKILL.md" "$readonly_prompt" "$TRANSCRIPT_DIR/readonly.txt" || readonly_status=$?
(( readonly_status == 0 )) || fail "read-only transcript failed (exit $readonly_status)"
assert_contains_ci "$TRANSCRIPT_DIR/readonly.txt" 'Territory map'
assert_contains_ci "$TRANSCRIPT_DIR/readonly.txt" 'Main forks'
assert_contains_ci "$TRANSCRIPT_DIR/readonly.txt" 'experienced practitioner'
assert_contains_ci "$TRANSCRIPT_DIR/readonly.txt" 'beginner'
assert_contains_ci "$TRANSCRIPT_DIR/readonly.txt" 'Challenge check'
assert_contains "$TRANSCRIPT_DIR/readonly.txt" 'Zero-question round'
assert_empty_directory "$readonly_root/issues/open"
pass 'small creation showed proportional territory and challenge closes without premature output'

for heading in 'Rejected proposal' 'Omitted ruling' 'Missing machinery lock' 'Invalid repo' 'Absent confirmation'; do
  assert_contains "$TRANSCRIPT_DIR/readonly.txt" "$heading"
done
assert_contains "$TRANSCRIPT_DIR/readonly.txt" 'akrogon'
assert_contains "$TRANSCRIPT_DIR/readonly.txt" 'framework'
assert_contains_ci "$TRANSCRIPT_DIR/readonly.txt" 'blocked'
pass 'rejected proposals, omitted rulings, missing locks, invalid repos, and absent confirmation stay gated'

create_root="$TMP_DIR/create"
prepare_fixture "$create_root"
mkdir -p "$create_root/issues/open"
create_prompt='Use the loaded create-issue skill in this isolated attended akrogon checkout. This is a scripted operator interview. Do not ask for input. Do not write any file until the explicit final confirmation below. Do not commit. Request: Create small-change. Make the command-line invalid-repo error actionable, and keep the change limited to that command-line error. Before Round 1, show a short issue-proportional territory map with Main forks, Questions an experienced practitioner would ask, and Mistakes a beginner might make without noticing. The map is only for this small issue. Round 1 operator answers: scope = "Only the command-line invalid-repo error changes. Leave browser UI and valid-repo behavior unchanged."; repo = "akrogon"; priority = "Normal priority (n)."; ownership = "All steps are agent-owned. No physical operator action is required."; rollout = "Use the normal release. Add no migration, rollout flag, or approval hold.". Close Round 1 with Challenge check and record that the invalid-name failure contract is the remaining question. Round 2 operator answer: "Reject an unconfigured repo name with a nonzero exit and list every configured repo key. Change no files on rejection.". Close Round 2 with Challenge check and no new challenge. Run a zero-question substantive close with Challenge check and no new challenge. Ask consult and record the explicit operator answer "Skip consult.". The shared-understanding summary must include scope, done criteria, exclusions, architecture, rollout, ownership, repo, priority, and consult. The operator then gives this final confirmation exactly: "Yes. This is our shared understanding. Write the leaf." Only after that confirmation write exactly issues/open/small-change/brief.md, design.md, and state.yaml. Copy the local standing-design.md into design.md, include exactly one consult-election: no line, use phase consult-position, priority n, and repo akrogon. Do not write a seed, chunk, chart decision table, series index, or any other output.'
run_writable_agent "$create_root" "$create_root/.pi/agent/skills/create-issue/SKILL.md" "$create_prompt" "$TRANSCRIPT_DIR/create-emission.txt"
create_leaf="$create_root/issues/open/small-change"
assert_contains_ci "$TRANSCRIPT_DIR/create-emission.txt" 'Territory map'
assert_contains_ci "$TRANSCRIPT_DIR/create-emission.txt" 'Challenge check'
assert_file "$create_leaf/brief.md"
assert_file "$create_leaf/design.md"
assert_file "$create_leaf/state.yaml"
assert_three_files "$create_leaf"
assert_contains "$create_leaf/brief.md" '# Brief: small-change'
assert_contains "$create_leaf/brief.md" '## What'
assert_contains "$create_leaf/brief.md" '## Why'
assert_contains "$create_leaf/brief.md" '## Done-criteria'
assert_contains "$create_leaf/design.md" '# Design: small-change'
assert_contains "$create_leaf/design.md" '## Binding decisions, verbatim'
assert_contains "$create_leaf/design.md" '## Leaf architecture'
assert_contains "$create_leaf/design.md" 'Never mock auth.'
assert_contains "$create_leaf/design.md" 'Reject an unconfigured repo name'
assert_not_contains "$create_leaf/design.md" 'Chart Decision Review'
[[ "$(grep -Ec '^consult-election: (yes|no)$' "$create_leaf/design.md")" == 1 ]] || fail 'ordinary creation election count is not one'
assert_contains "$create_leaf/design.md" 'consult-election: no'
assert_contains "$create_leaf/state.yaml" 'slug: small-change'
assert_contains "$create_leaf/state.yaml" 'phase: consult-position'
assert_contains "$create_leaf/state.yaml" 'priority: n'
assert_contains "$create_leaf/state.yaml" 'repo: akrogon'
for file in brief.md design.md state.yaml; do
  assert_not_contains "$create_leaf/$file" 'Chart skill version'
done
[[ ! -e "$create_root/issues/open/small-change.md" ]] || fail 'ordinary creation wrote an intake seed'
[[ ! -e "$create_root/issues/open/SERIES-small-change.md" ]] || fail 'ordinary creation wrote a series index'
pass 'ordinary creation emitted only the three contract files after confirmation'

import_root="$TMP_DIR/import"
prepare_fixture "$import_root"
mkdir -p "$import_root/issues/open" "$import_root/external"
external_seed="$import_root/external/chart-proposal.md"
cp -- "$FIXTURE_DIR/import/chart-proposal.md" "$external_seed"
external_digest_before="$(sha256sum "$external_seed")"
import_prompt='Use the loaded create-issue skill in this isolated attended akrogon checkout. This is a scripted colleague-seed import. Do not ask for input. Read the external seed at external/chart-proposal.md first. Do not write any file until the explicit final confirmation below. Do not commit. Resolve the slug colleague-import. The seed is a chart proposal, never an operator lock. Before Round 1 show a short issue-proportional territory map for this single import with Main forks, Questions an experienced practitioner would ask, and Mistakes a beginner might make without noticing. Before that round render exactly one Chart Decision Review table with exactly one row for # Fixture decision. The row must contain the chart proposal, one importing-agent agree-or-better-idea line with this better idea: "Use the normal single-issue import because this door is not an attended chart handoff.", and this explicit operator ruling: "Reject the direct handoff proposal. Import as one normal single issue because this door is not an attended chart handoff." Do not score it or add a review round. Ask the normal issue questions and record these explicit operator decisions: scope = "Import this one bounded issue and do not create a series index."; repo = "akrogon"; priority = "Normal priority (n)."; ownership = "All steps are agent-owned. No physical operator action is required."; consult = "Skip consult.". The operator rejects the source chart proposal, but rules the replacement above. Close every round with Challenge check, including a zero-question substantive close. Summarize the operator-ruled result and ask the existing final confirmation. The operator confirms exactly: "Yes. This is our shared understanding. Write the leaf." Only after confirmation, copy the external seed bytes unchanged to issues/open/colleague-import.md, prepend exactly "Archived: imported into colleague-import on 2026-09-05" followed by a newline, create exactly issues/open/colleague-import/brief.md, design.md, and state.yaml, and set seed_path: issues/open/colleague-import.md. Use phase consult-position, priority n, repo akrogon, exactly one consult-election: no line, and the local standing design. Do not create a chunk or series index. Leave the external source unchanged.'
run_writable_agent "$import_root" "$import_root/.pi/agent/skills/create-issue/SKILL.md" "$import_prompt" "$TRANSCRIPT_DIR/import-emission.txt"
import_leaf="$import_root/issues/open/colleague-import"
assert_contains_ci "$TRANSCRIPT_DIR/import-emission.txt" 'Territory map'
assert_contains_ci "$TRANSCRIPT_DIR/import-emission.txt" 'Challenge check'
assert_contains_ci "$TRANSCRIPT_DIR/import-emission.txt" 'Chart Decision Review'
assert_contains_ci "$TRANSCRIPT_DIR/import-emission.txt" 'agree-or-better-idea'
assert_contains "$TRANSCRIPT_DIR/import-emission.txt" 'Reject the direct handoff proposal'
assert_file "$import_root/issues/open/colleague-import.md"
assert_file "$import_leaf/brief.md"
assert_file "$import_leaf/design.md"
assert_file "$import_leaf/state.yaml"
assert_three_files "$import_leaf"
archive_body="$TMP_DIR/archive-body.md"
tail -n +2 "$import_root/issues/open/colleague-import.md" > "$archive_body"
cmp -s "$external_seed" "$archive_body" || fail 'archived seed body differs from external source'
[[ "$external_digest_before" == "$(sha256sum "$external_seed")" ]] || fail 'external source changed during import'
assert_contains "$import_root/issues/open/colleague-import.md" 'Archived: imported into colleague-import on 2026-09-05'
assert_contains "$import_leaf/state.yaml" 'seed_path: issues/open/colleague-import.md'
assert_contains "$import_leaf/design.md" 'Reject the direct handoff proposal'
assert_contains "$import_leaf/design.md" '## Binding decisions, verbatim'
assert_contains "$import_leaf/design.md" '## Leaf architecture'
[[ "$(grep -Ec '^consult-election: (yes|no)$' "$import_leaf/design.md")" == 1 ]] || fail 'import election count is not one'
assert_contains "$import_leaf/design.md" 'consult-election: no'
assert_contains "$import_leaf/state.yaml" 'repo: akrogon'
assert_contains "$import_leaf/state.yaml" 'priority: n'
for file in brief.md design.md state.yaml; do
  assert_not_contains "$import_leaf/$file" 'Chart skill version'
done
[[ ! -e "$import_root/issues/open/SERIES-colleague-import.md" ]] || fail 'colleague import wrote a series index'
pass 'colleague import reviewed one proposal, rejected it explicitly, preserved the seed, and emitted the three files'

else
  printf 'Chunk contract checks only: live agent scenarios are required at leaf verification.\n'
fi

for file in "$FIXTURE_DIR/create/sample-change/brief.md" "$FIXTURE_DIR/create/sample-change/design.md" "$FIXTURE_DIR/create/sample-change/state.yaml" "$FIXTURE_DIR/import/sample-change/brief.md" "$FIXTURE_DIR/import/sample-change/design.md" "$FIXTURE_DIR/import/sample-change/state.yaml" "$FIXTURE_DIR/import/seed.md" "$FIXTURE_DIR/import/chart-proposal.md"; do
  assert_file "$file"
done
assert_contains "$FIXTURE_DIR/import/sample-change/state.yaml" 'seed_path: issues/open/sample-change.md'
assert_contains "$FIXTURE_DIR/import/seed.md" 'Archived: imported into sample-change on 2026-09-05'
assert_contains "$FIXTURE_DIR/import/sample-change/design.md" 'consult-election: no'
for file in "$FIXTURE_DIR/create/sample-change/brief.md" "$FIXTURE_DIR/create/sample-change/design.md" "$FIXTURE_DIR/create/sample-change/state.yaml" "$FIXTURE_DIR/import/sample-change/brief.md" "$FIXTURE_DIR/import/sample-change/design.md" "$FIXTURE_DIR/import/sample-change/state.yaml"; do
  assert_not_contains "$file" 'Chart skill version'
done
assert_contains "$FIXTURE_DIR/import/chart-proposal.md" 'Chart skill version: 1'
assert_contains "$FIXTURE_DIR/import/chart-proposal.md" 'Chart decision `# Fixture decision` — proposal:'
pass 'ordinary and chunk 02 colleague import fixtures retain their separate contracts'

after_status="$(git -C "$ROOT_DIR" status --porcelain -- . ':(exclude).evidence')"
[[ "$before_status" == "$after_status" ]] || fail 'agent verification changed tracked repository paths'
for mirror in "$HOME/.claude/skills/create-issue" "$HOME/.codex/skills/create-issue" "$HOME/.pi/agent/skills/create-issue"; do
  diff -r --no-dereference "$ROOT_DIR/skills/create-issue" "$mirror" >/dev/null || fail "create-issue mirror differs: $mirror"
done
pass 'isolated invocations left repository state unchanged and mirrors are byte-identical'

git -C "$ROOT_DIR" diff --check
pass 'repository whitespace check'

if [[ "$contract_only" == true ]]; then
  printf 'PASS: deterministic chunk contract checks complete; live leaf verification remains required\n'
else
  printf 'PASS: create-issue interview verification complete\n'
fi
