#!/usr/bin/env bash
set -euo pipefail

case "${1-}" in
  '') (( $# == 0 )) || { printf 'Unexpected arguments\n' >&2; exit 2; }; contract_only=false ;;
  --contract-only) (( $# == 1 )) || { printf 'Unexpected arguments\n' >&2; exit 2; }; contract_only=true ;;
  *) printf 'Usage: %s [--contract-only]\n' "$0" >&2; exit 2 ;;
esac

ROOT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
SKILL_FILE="$ROOT_DIR/skills/chart-issues/SKILL.md"
ASSET_DIR="$ROOT_DIR/skills/chart-issues/assets"
FIXTURE_DIR="$ROOT_DIR/skills/chart-issues/fixtures"
EVIDENCE_DIR="$ROOT_DIR/.evidence/chart-skill-upgrade/chunk-01"
mkdir -p "$EVIDENCE_DIR/runs"
EVIDENCE_DIR="$(mktemp -d "$EVIDENCE_DIR/runs/$(date -u +%Y%m%dT%H%M%SZ)-XXXXXX")"
printf 'Verification evidence: %s\n' "$EVIDENCE_DIR"
CHECK_STARTED_SECONDS=$SECONDS
printf '{"event":"started","at":"%s","contractOnly":%s}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$contract_only" >> "$EVIDENCE_DIR/events.jsonl"
ASSERTIONS_FILE="$EVIDENCE_DIR/assertions.txt"
AGENT_TRANSCRIPT="$EVIDENCE_DIR/agent-transcript.txt"
TMP_DIR="$(mktemp -d)"

cleanup() {
  local status=$?
  rm -rf "$TMP_DIR"
  printf '{"event":"finished","at":"%s","elapsedSeconds":%s,"exitStatus":%s,"costUSD":null,"usageStatus":"not-reported"}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$((SECONDS - CHECK_STARTED_SECONDS))" "$status" >> "$EVIDENCE_DIR/events.jsonl"
}
trap cleanup EXIT

mkdir -p "$EVIDENCE_DIR"
: > "$ASSERTIONS_FILE"

fail() {
  printf 'FAIL: %s\n' "$1" >&2
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

assert_not_contains() {
  local file="$1"
  local text="$2"
  ! grep -Fq -- "$text" "$file" || fail "unexpected '$text' in $file"
}

assert_equal() {
  local expected="$1"
  local actual="$2"
  local label="$3"
  [[ "$expected" == "$actual" ]] || fail "$label: expected '$expected', got '$actual'"
}

assert_three_files() {
  local directory="$1"
  [[ "$(find "$directory" -maxdepth 1 -type f | wc -l)" == 3 ]] || fail "unexpected file count in $directory"
  [[ -z "$(find "$directory" -mindepth 1 -maxdepth 1 ! -type f -print -quit)" ]] || fail "unexpected directory in $directory"
}

assert_one_stamp() {
  local file="$1"
  local stamp_line="$2"
  [[ "$(grep -Fxc -- "$stamp_line" "$file")" == 1 ]] || fail "expected exactly one '$stamp_line' line in $file"
}

# Every handoff Markdown output places the stamp immediately after its title, and the title is
# the exact one the contract names for that shape: line 1 is that title, the first nonblank
# line after it is the exact stamp, and no template placeholder remains. design.md copies every
# binding decision verbatim, and a chart decision carries the stamp itself, so that file
# legitimately holds the stamp once per copied decision on top of its own; the brief and the
# series index carry it exactly once, which their callers assert with assert_one_stamp.
assert_stamp_after_title() {
  local file="$1"
  local title="$2"
  local stamp_line="$3"
  [[ "$(head -n1 -- "$file")" == "$title" ]] || fail "expected '$title' on the first line of $file"
  [[ "$(sed -n '2,$p' -- "$file" | grep -m1 -v '^[[:space:]]*$')" == "$stamp_line" ]] || fail "expected '$stamp_line' immediately after the title in $file"
  assert_not_contains "$file" '<chart handoff only:'
}

# The done criteria section is a numbered list and nothing else, as the contract requires:
# from the heading to the next heading or the end of the file, the first nonblank line is a
# numbered item carrying text, and every other nonblank line is another such item or an
# indented continuation of the item above it. A continuation is wrapped prose, never a nested
# list item: an indented line opening with a Markdown list marker (`-`, `*`, `+` or `N.`) is
# red. An empty marker, top-level prose and a bullet at any depth all turn it red.
assert_numbered_done_criteria() {
  local file="$1"
  local section
  section="$(sed -n '/^## Done-criteria$/,$p' "$file" | sed '1d;/^## /,$d')"
  grep -m1 -v '^[[:space:]]*$' <<<"$section" | grep -Eq '^[0-9]+\.[[:space:]]+[^[:space:]]' || fail "no numbered done criterion with text at the top of the section in $file"
  ! grep -Evq '^([0-9]+\.[[:space:]]+[^[:space:]]|[[:space:]]+[^[:space:]]|[[:space:]]*$)' <<<"$section" || fail "done criteria section holds a line that is not a numbered criterion or its continuation in $file"
  ! grep -Eq '^[[:space:]]+([-*+]|[0-9]+\.)([[:space:]]|$)' <<<"$section" || fail "done criteria section holds a nested list item in $file"
}

assert_no_materialized_output() {
  local fixture_root="$1"
  local label="$2"
  local open_dir="$fixture_root/issues/open"

  [[ -z "$(find "$open_dir" -mindepth 1 -maxdepth 1 -type d -print -quit)" ]] || fail "$label: a leaf directory was materialized"
  [[ -z "$(find "$fixture_root/issues" -name 'state.yaml' -print -quit)" ]] || fail "$label: a state.yaml was materialized"
  [[ -z "$(find "$open_dir" -name 'SERIES-*.md' -print -quit)" ]] || fail "$label: a series index was materialized"
}

# The grounded fixture satisfies the skill's Ground rule: the checkout's own toplevel is the
# configured `akrogon` path and the checkout carries the matching remote. It also carries the
# small command the fixture leaf contracts are written against, so the pre-handoff audit's
# dry-run check has a real entry point and baseline. Both are required for a run that stops
# here to be stopping for the reason its case is testing. The ungrounded fixture is the
# deliberate negative for the ground half of the mode check: its configured `akrogon` path
# is elsewhere and the checkout carries no remote, and the attended ungrounded case below
# runs it.
prepare_chart_fixture() {
  local fixture_root="$1"
  local ground="$2"

  mkdir -p "$fixture_root/.pi/agent/skills" "$fixture_root/issues/open"
  cp -a -- "$ROOT_DIR/skills/chart-issues" "$fixture_root/.pi/agent/skills/chart-issues"
  git -C "$fixture_root" init -q
  git -C "$fixture_root" -c user.email='fixture@example.invalid' -c user.name='Chart Fixture' commit -q --allow-empty -m 'fixture ground'
  case "$ground" in
    grounded)
      local remote="$fixture_root.akrogon.git"
      git init -q --bare "$remote"
      git -C "$fixture_root" remote add origin "$remote"
      git -C "$fixture_root" push -q origin HEAD:refs/heads/main
      printf '%s\n' 'repos:' '  akrogon:' "    path: $fixture_root" '  framework:' '    path: /isolated/framework' > "$fixture_root/issues/config.yaml"
      mkdir -p "$fixture_root/bin"
      printf '%s\n' '#!/usr/bin/env bash' 'set -euo pipefail' '# Baseline: every repo name is accepted and echoed, configured or not.' 'printf "%s\n" "$1"' > "$fixture_root/bin/select-repo.sh"
      chmod +x "$fixture_root/bin/select-repo.sh"
      ;;
    ungrounded)
      printf '%s\n' 'repos:' '  akrogon:' '    path: /isolated/akrogon' '  framework:' '    path: /isolated/framework' > "$fixture_root/issues/config.yaml"
      ;;
    *) fail "unknown fixture ground: $ground" ;;
  esac
}

# The agent's skills home is isolated per run: it holds the fixture's own skill copy and no
# other, so the rules under test are read from the artifact under review rather than from an
# installed copy on the machine running the gate.
# codex exec echoes the piped prompt, so the whole loaded SKILL.md sits in every writable
# transcript and a word from the skill text proves nothing there. The agent's own words are the
# text after the last `codex` marker, which is what an attribution assertion reads.
final_agent_message() {
  local transcript="$1"
  awk '/^codex$/ { message = ""; next } { message = message $0 "\n" } END { printf "%s", message }' "$transcript"
}

assert_final_message_contains() {
  local transcript="$1"
  local text="$2"
  final_agent_message "$transcript" | grep -Fq -- "$text" || fail "missing '$text' in the agent's final message in $transcript"
}

run_writable_agent() {
  local working_dir="$1"
  local skill_path="$2"
  local prompt="$3"
  local transcript="$4"

  command -v codex >/dev/null 2>&1 || fail 'Codex is required for the attended handoff transcript'
  local real_codex_home="${CODEX_HOME:-$HOME/.codex}"
  [[ -f "$real_codex_home/auth.json" ]] || fail "no Codex credentials at $real_codex_home/auth.json"
  local isolated_home="$TMP_DIR/codex-homes/$(basename "$working_dir")"
  mkdir -p "$isolated_home/skills"
  cp -a -- "$(dirname "$skill_path")" "$isolated_home/skills/chart-issues"
  cp -- "$real_codex_home/auth.json" "$isolated_home/auth.json"

  local skill_text
  skill_text="$(<"$skill_path")"
  : > "$transcript"
  printf 'writable harness: codex\n'
  local status=0
  (cd "$working_dir" && printf '%s\n\n%s\n' "$skill_text" "$prompt" | CODEX_HOME="$isolated_home" codex exec --ephemeral --ignore-user-config --ignore-rules -C "$working_dir" -s workspace-write -c approval_policy='"never"' --skip-git-repo-check -m gpt-6-astra -) > "$transcript" 2>&1 || status=$?
  (( status == 0 )) || fail "writable agent invocation failed (exit $status)"
  assert_not_contains "$transcript" "$real_codex_home/skills/chart-issues"
}

before_status="$(git -C "$ROOT_DIR" status --porcelain -- . ':(exclude).evidence')"

for asset in question-authoring.md seed-shapes.md materialization-contract.md standing-design.md; do
  assert_file "$ASSET_DIR/$asset"
done
assert_contains "$SKILL_FILE" '## Opening'
assert_contains "$SKILL_FILE" '## Artifacts'
assert_contains "$SKILL_FILE" '## Decision Types'
assert_contains "$SKILL_FILE" '## Chart Lane'
assert_contains "$SKILL_FILE" '## Work Lane'
assert_contains "$SKILL_FILE" '## Handoff'
assert_contains "$SKILL_FILE" '## Boundaries'
assert_contains "$SKILL_FILE" 'main forks'
assert_contains "$SKILL_FILE" 'experienced practitioner'
assert_contains "$SKILL_FILE" 'beginner'
assert_contains "$SKILL_FILE" 'Challenge check'
assert_contains "$SKILL_FILE" 'practitioner'
assert_contains "$SKILL_FILE" 'better-than-training'
assert_contains "$SKILL_FILE" 'model-knowledge'
assert_contains "$SKILL_FILE" '10 minutes'
assert_contains "$SKILL_FILE" 'Veto'
assert_contains "$SKILL_FILE" 'sandbox'
assert_contains "$SKILL_FILE" 'discarded'
assert_contains "$SKILL_FILE" 'operator-attended'
assert_contains "$SKILL_FILE" 'machine seat'
assert_contains "$SKILL_FILE" 'defaults-and-exceptions table'
assert_contains "$SKILL_FILE" 'exactly one series-level'
assert_contains "$SKILL_FILE" 'genuine earlier'
assert_contains "$SKILL_FILE" 'planning supplies'
assert_not_contains "$SKILL_FILE" 'docs/reference/skills/consult-issue'
assert_not_contains "$SKILL_FILE" 'series-materialization-reference'
assert_contains "$ASSET_DIR/question-authoring.md" '## Territory map'
assert_contains "$ASSET_DIR/question-authoring.md" '## Expert-challenge close'
assert_contains "$ASSET_DIR/question-authoring.md" '## Micro-prototype question'
assert_contains "$ASSET_DIR/seed-shapes.md" '## Chart Decision Review'
assert_contains "$ASSET_DIR/seed-shapes.md" 'proposal, never a lock'
assert_contains "$ASSET_DIR/materialization-contract.md" '# Materialization Contract'
assert_contains "$ASSET_DIR/materialization-contract.md" '## Series index'
assert_contains "$ASSET_DIR/materialization-contract.md" 'lifecycle field'
assert_contains "$ASSET_DIR/materialization-contract.md" 'Validate each artifact'
assert_contains "$ASSET_DIR/materialization-contract.md" 'The chart skill stamp is chart-only.'
assert_contains "$SKILL_FILE" 'Chunk files do not exist yet'
assert_not_contains "$SKILL_FILE" 'brief/design/chunk text'
assert_not_contains "$SKILL_FILE" 'verifies per chunk'
cmp -s "$ASSET_DIR/standing-design.md" "$ROOT_DIR/skills/create-issue/assets/standing-design.md" || fail 'standing design is not byte-identical'
assert_contains "$ROOT_DIR/skills/create-issue/SKILL.md" '../chart-issues/assets/materialization-contract.md'
pass 'chart sections and self-contained assets'

if [[ "$contract_only" == false ]]; then
fixture_root="$TMP_DIR/seat"
mkdir -p "$fixture_root/issues" "$fixture_root/.claude/skills/chart-issues"
cp "$SKILL_FILE" "$fixture_root/.claude/skills/chart-issues/SKILL.md"
printf '%s\n' 'repos:' '  akrogon:' '    path: /isolated/akrogon' '  framework:' '    path: /isolated/framework' > "$fixture_root/issues/config.yaml"

operator_replies="$(<"$FIXTURE_DIR/operator-replies.md")"
agent_prompt="Use the loaded chart-issues skill in this isolated fixture. Do not call tools or write files. The operator replies are explicit and complete:
$operator_replies
Return a compact transcript with the headings Territory map, Challenge check, Locks batch, and Series confirmation. Include no materialized paths."
# The installed harness is chosen before the call: existence decides, a runtime failure is a
# loud gate failure, never a second billed attempt or an automatic retry.
agent_status=0
: > "$AGENT_TRANSCRIPT"
if command -v pi >/dev/null 2>&1; then
  printf 'readonly harness: pi\n'
  (cd "$fixture_root" && pi --no-session --no-context-files --no-tools --skill "$SKILL_FILE" --model openai-codex/gpt-5.6-sol --thinking low -p "$agent_prompt") > "$AGENT_TRANSCRIPT" 2>&1 || agent_status=$?
elif command -v claude >/dev/null 2>&1; then
  printf 'readonly harness: claude\n'
  (cd "$fixture_root" && claude -p --bare --no-session-persistence --permission-mode plan --permission-prompts none --disallowed-tools Bash Edit Write NotebookEdit "/chart-issues
$agent_prompt") > "$AGENT_TRANSCRIPT" 2>&1 || agent_status=$?
else
  fail 'no installed agent for the isolated chart transcript'
fi
(( agent_status == 0 )) || fail "chart transcript agent failed (exit $agent_status)"
assert_contains "$AGENT_TRANSCRIPT" 'Territory map'
assert_contains "$AGENT_TRANSCRIPT" 'Challenge check'
assert_contains "$AGENT_TRANSCRIPT" 'Locks batch'
assert_contains "$AGENT_TRANSCRIPT" 'Series confirmation'
[[ ! -e "$fixture_root/issues/open" ]] || fail 'agent invocation wrote intake output'
pass 'installed agent rendered the chart interview without intake writes'

# Each live prompt supplies only session facts, settled chart content and operator answers. It
# never names an output path, heading, file shape, stamp, validation step or prohibition: those
# come from the skill under test, so weakening a production rule changes what these runs write.
leaf_one_contract='Leaf chart-leaf-one: What = "Make bin/select-repo.sh exit nonzero on a repo name that is not a key under repos: in issues/config.yaml."; Why = "A silent accept hides the operator mistake."; done criteria = "bin/select-repo.sh exits nonzero for a name absent from issues/config.yaml." and "bin/select-repo.sh still prints a configured name and exits zero."'
leaf_two_contract='Leaf chart-leaf-two: What = "List every configured repo key in bin/select-repo.sh rejection message."; Why = "The operator must see the valid keys."; done criteria = "The rejection message lists every key under repos: in issues/config.yaml." and "No other bin/select-repo.sh output changes."; chart-leaf-two waits for chart-leaf-one as serial: chart-leaf-one.'
handoff_decision='# Fixture decision — Resolution: reject an unconfigured repo name with a nonzero exit and list every configured repo key. Reason: silent acceptance hides the operator mistake. Foreclosed: warn and continue.'
attended_session='You are the operator-attended chart session in this akrogon checkout, using the loaded chart-issues skill. The operator is present and every answer this session needs is given below, so do not ask further questions and do not commit.'

handoff_root="$TMP_DIR/attended-handoff"
prepare_chart_fixture "$handoff_root" grounded
handoff_skill="$handoff_root/.pi/agent/skills/chart-issues/SKILL.md"
handoff_prompt="$attended_session The chart is settled and holds this binding decision: \"$handoff_decision\" It hands off two leaves as the series fixture-series. $leaf_one_contract $leaf_two_contract Locks batch operator answers: repo akrogon, priority n, ownership agent-owned, consult no. The operator's answer to the single series confirmation is to confirm the locks table, leaf contracts and dependency barriers exactly as shown."
run_writable_agent "$handoff_root" "$handoff_skill" "$handoff_prompt" "$EVIDENCE_DIR/handoff-emission.txt"
for leaf in chart-leaf-one chart-leaf-two; do
  leaf_dir="$handoff_root/issues/open/$leaf"
  assert_file "$leaf_dir/brief.md"
  assert_file "$leaf_dir/design.md"
  assert_file "$leaf_dir/state.yaml"
  assert_three_files "$leaf_dir"
  assert_contains "$leaf_dir/brief.md" "# Brief: $leaf"
  assert_contains "$leaf_dir/brief.md" '## What'
  assert_contains "$leaf_dir/brief.md" '## Why'
  assert_contains "$leaf_dir/brief.md" '## Done-criteria'
  assert_numbered_done_criteria "$leaf_dir/brief.md"
  assert_contains "$leaf_dir/design.md" "# Design: $leaf"
  assert_contains "$leaf_dir/design.md" '## Binding decisions, verbatim'
  assert_contains "$leaf_dir/design.md" '## Leaf architecture'
  assert_contains "$leaf_dir/design.md" 'Never mock auth.'
  assert_contains "$leaf_dir/design.md" 'reject an unconfigured repo name with a nonzero exit'
  assert_equal '1' "$(grep -c '^consult-election: \(yes\|no\)$' "$leaf_dir/design.md")" "$leaf election count"
  assert_contains "$leaf_dir/state.yaml" "slug: $leaf"
  assert_contains "$leaf_dir/state.yaml" 'phase: consult-position'
  assert_contains "$leaf_dir/state.yaml" 'priority: n'
  assert_contains "$leaf_dir/state.yaml" 'repo: akrogon'
  assert_not_contains "$leaf_dir/state.yaml" 'chart-skill-version:'
  assert_one_stamp "$leaf_dir/brief.md" 'Chart skill version: 3'
  assert_stamp_after_title "$leaf_dir/brief.md" "# Brief: $leaf" 'Chart skill version: 3'
  assert_stamp_after_title "$leaf_dir/design.md" "# Design: $leaf" 'Chart skill version: 3'
  assert_one_stamp "$leaf_dir/state.yaml" '# Chart skill version: 3'
done
series_index="$handoff_root/issues/open/SERIES-fixture-series.md"
assert_file "$series_index"
assert_one_stamp "$series_index" 'Chart skill version: 3'
assert_stamp_after_title "$series_index" '# Series Index: fixture-series' 'Chart skill version: 3'
assert_contains "$series_index" '| Order | Leaf'
assert_contains "$series_index" 'serial: chart-leaf-one'
assert_not_contains "$series_index" '| Status |'
assert_not_contains "$series_index" '| Priority |'
assert_not_contains "$series_index" '| Ownership |'
assert_not_contains "$series_index" '| Consult |'
[[ -z "$(find "$handoff_root/issues/open" -name 'chunk-*.md' -print -quit)" ]] || fail 'attended handoff wrote a chunk file'
[[ ! -e "$handoff_root/issues/open/chart-leaf-one.md" ]] || fail 'attended handoff wrote a proposal seed'
assert_equal '7' "$(find "$handoff_root/issues/open" -type f | wc -l)" 'attended handoff emitted file count'
pass 'attended handoff emitted each leaf, the series index, and no chunk or seed'

# The collision case is the attended case's paired control: same grounded fixture, same session
# facts, same locks and confirmation, one leaf instead of two, and a pre-seeded destination as
# the only difference. The attended run above materialized, so a refusal here is attributable to
# the occupied destination and to nothing else in the fixture. The occupant is an ordinary
# earlier brief for the same slug carrying no instruction of its own, so the stop can only come
# from the loaded copy's preflight rule and deleting that rule turns this case red.
one_leaf_handoff="The chart is settled and holds this binding decision: \"$handoff_decision\" It hands off one leaf. $leaf_one_contract"
collision_root="$TMP_DIR/collision"
prepare_chart_fixture "$collision_root" grounded
collision_leaf="$collision_root/issues/open/chart-leaf-one"
mkdir -p "$collision_leaf"
sed 's/fixture-leaf/chart-leaf-one/' "$FIXTURE_DIR/attended-series/brief.md" > "$collision_leaf/brief.md"
collision_digest_before="$(sha256sum "$collision_leaf/brief.md")"
collision_prompt="$attended_session $one_leaf_handoff Locks batch operator answers: repo akrogon, priority n, ownership agent-owned, consult no. The operator's answer to the single series confirmation is to confirm the locks table and leaf contract exactly as shown."
run_writable_agent "$collision_root" "$collision_root/.pi/agent/skills/chart-issues/SKILL.md" "$collision_prompt" "$EVIDENCE_DIR/handoff-collision.txt"
[[ "$collision_digest_before" == "$(sha256sum "$collision_leaf/brief.md")" ]] || fail 'collision run changed the existing leaf'
[[ ! -e "$collision_leaf/design.md" && ! -e "$collision_leaf/state.yaml" ]] || fail 'collision run completed the occupied leaf'
[[ -z "$(find "$collision_root/issues/open" -name 'SERIES-*.md' -print -quit)" ]] || fail 'collision run wrote a series index'
assert_equal '1' "$(find "$collision_root/issues/open" -type f | wc -l)" 'collision run emitted file count'
# The stop must be the preflight's. With the preflight paragraphs deleted from the skill copy the
# agent still preserves the occupant out of general caution and explains the stop without the
# rule's words, so the file checks above stay green and only this line turns red. It reads the
# agent's final message only: the echoed prompt carries the rule text in every transcript.
assert_final_message_contains "$EVIDENCE_DIR/handoff-collision.txt" 'occupied'
pass 'an occupied leaf destination stopped the handoff with the occupant intact'

# The preflight covers only the paths this run creates. A materializing attended handoff writes
# no proposal seed, so a tracked intake seed already at the seed path this leaf would otherwise
# get is not an occupied destination: the leaf is still written and the seed is left as it is.
# The old unconditional seed check stopped this run; the narrowed rule lets it through.
seed_beside_root="$TMP_DIR/seed-beside-leaf"
prepare_chart_fixture "$seed_beside_root" grounded
seed_beside_path="$seed_beside_root/issues/open/chart-leaf-one.md"
cp -- "$FIXTURE_DIR/proposal-seed.md" "$seed_beside_path"
git -C "$seed_beside_root" add issues/open/chart-leaf-one.md
git -C "$seed_beside_root" -c user.email='fixture@example.invalid' -c user.name='Chart Fixture' commit -q -m 'tracked intake seed'
seed_beside_digest_before="$(sha256sum "$seed_beside_path")"
seed_beside_prompt="$attended_session $one_leaf_handoff Locks batch operator answers: repo akrogon, priority n, ownership agent-owned, consult no. The operator's answer to the single series confirmation is to confirm the locks table and leaf contract exactly as shown."
run_writable_agent "$seed_beside_root" "$seed_beside_root/.pi/agent/skills/chart-issues/SKILL.md" "$seed_beside_prompt" "$EVIDENCE_DIR/handoff-seed-beside-leaf.txt"
[[ "$seed_beside_digest_before" == "$(sha256sum "$seed_beside_path")" ]] || fail 'seed-beside-leaf run changed the tracked intake seed'
seed_beside_leaf="$seed_beside_root/issues/open/chart-leaf-one"
assert_file "$seed_beside_leaf/brief.md"
assert_file "$seed_beside_leaf/design.md"
assert_file "$seed_beside_leaf/state.yaml"
assert_three_files "$seed_beside_leaf"
assert_contains "$seed_beside_leaf/brief.md" '# Brief: chart-leaf-one'
assert_numbered_done_criteria "$seed_beside_leaf/brief.md"
assert_one_stamp "$seed_beside_leaf/brief.md" 'Chart skill version: 3'
assert_stamp_after_title "$seed_beside_leaf/brief.md" '# Brief: chart-leaf-one' 'Chart skill version: 3'
assert_stamp_after_title "$seed_beside_leaf/design.md" '# Design: chart-leaf-one' 'Chart skill version: 3'
assert_contains "$seed_beside_leaf/state.yaml" 'slug: chart-leaf-one'
assert_equal '4' "$(find "$seed_beside_root/issues/open" -type f | wc -l)" 'seed-beside-leaf run emitted file count'
pass 'a tracked intake seed beside the leaf path did not stop the handoff'

# Machine seat, ground true and attendance false. The mode rule is measured by what the run
# writes: weakening it to let a machine seat materialize turns these assertions red.
seat_root="$TMP_DIR/machine-seat"
prepare_chart_fixture "$seat_root" grounded
seat_prompt="You are a dispatched machine seat running unattended in this akrogon checkout, using the loaded chart-issues skill. No operator is present and none can answer anything in this session, so do not ask questions and do not commit. $one_leaf_handoff Carry the settled chart through its handoff step now."
run_writable_agent "$seat_root" "$seat_root/.pi/agent/skills/chart-issues/SKILL.md" "$seat_prompt" "$EVIDENCE_DIR/handoff-machine-seat.txt"
assert_no_materialized_output "$seat_root" 'machine seat in an akrogon checkout'
assert_equal '1' "$(find "$seat_root/issues/open" -type f | wc -l)" 'machine seat emitted file count'
seat_seed="$(find "$seat_root/issues/open" -maxdepth 1 -type f -name '*.md' -print -quit)"
[[ -n "$seat_seed" ]] || fail 'machine seat wrote no proposal seed'
assert_contains "$seat_seed" '# Seeded Issue'
assert_one_stamp "$seat_seed" 'Chart skill version: 3'
assert_stamp_after_title "$seat_seed" '# Seeded Issue' 'Chart skill version: 3'
pass 'a machine seat in an akrogon checkout emitted a proposal seed and no leaf'

# Attended session, ground false: the checkout is not the configured akrogon repository. The
# ground rule is measured by what the run writes, exactly as the machine-seat case measures
# attendance.
ground_root="$TMP_DIR/ungrounded"
prepare_chart_fixture "$ground_root" ungrounded
ground_prompt="$attended_session $one_leaf_handoff Locks batch operator answers: repo akrogon, priority n, ownership agent-owned, consult no. The operator's answer to the single series confirmation is to confirm the locks table and leaf contract exactly as shown."
run_writable_agent "$ground_root" "$ground_root/.pi/agent/skills/chart-issues/SKILL.md" "$ground_prompt" "$EVIDENCE_DIR/handoff-ungrounded.txt"
assert_no_materialized_output "$ground_root" 'attended session outside the akrogon ground'
assert_equal '1' "$(find "$ground_root/issues/open" -type f | wc -l)" 'ungrounded session emitted file count'
ground_seed="$(find "$ground_root/issues/open" -maxdepth 1 -type f -name '*.md' -print -quit)"
[[ -n "$ground_seed" ]] || fail 'ungrounded session wrote no proposal seed'
assert_contains "$ground_seed" '# Seeded Issue'
assert_one_stamp "$ground_seed" 'Chart skill version: 3'
assert_stamp_after_title "$ground_seed" '# Seeded Issue' 'Chart skill version: 3'
pass 'an attended session outside the akrogon ground emitted a proposal seed and no leaf'

# Absent series confirmation, in the one mode that may materialize.
absent_root="$TMP_DIR/absent-confirmation"
prepare_chart_fixture "$absent_root" grounded
absent_prompt="$attended_session $one_leaf_handoff Locks batch operator answers: repo akrogon, priority n, ownership agent-owned, consult no. The operator gives no answer at all to the series confirmation and will give none in this session."
run_writable_agent "$absent_root" "$absent_root/.pi/agent/skills/chart-issues/SKILL.md" "$absent_prompt" "$EVIDENCE_DIR/handoff-absent-confirmation.txt"
assert_no_materialized_output "$absent_root" 'absent series confirmation'
pass 'an absent series confirmation materialized nothing'

# Repo lock answer outside the fixture config's repos: keys.
repo_root="$TMP_DIR/invalid-repo"
prepare_chart_fixture "$repo_root" grounded
repo_prompt="$attended_session $one_leaf_handoff Locks batch operator answers: repo chartfixture-absent, priority n, ownership agent-owned, consult no. The operator's answer to the single series confirmation is to confirm the locks table and leaf contract exactly as shown."
run_writable_agent "$repo_root" "$repo_root/.pi/agent/skills/chart-issues/SKILL.md" "$repo_prompt" "$EVIDENCE_DIR/handoff-invalid-repo.txt"
assert_no_materialized_output "$repo_root" 'unconfigured repo lock answer'
pass 'an unconfigured repo lock answer materialized nothing'

else
  printf 'Chunk contract checks only: live agent scenarios are required at leaf verification.\n'
fi

attended_fixture="$FIXTURE_DIR/attended-series"
for artifact in brief.md design.md state.yaml SERIES-fixture.md; do
  assert_file "$attended_fixture/$artifact"
done
assert_contains "$attended_fixture/brief.md" '# Brief: fixture-leaf'
assert_contains "$attended_fixture/brief.md" '## Done-criteria'
assert_numbered_done_criteria "$attended_fixture/brief.md"
assert_stamp_after_title "$attended_fixture/brief.md" '# Brief: fixture-leaf' 'Chart skill version: 3'
assert_stamp_after_title "$attended_fixture/design.md" '# Design: fixture-leaf' 'Chart skill version: 3'
assert_stamp_after_title "$attended_fixture/SERIES-fixture.md" '# Series Index: fixture' 'Chart skill version: 3'
assert_contains "$ASSET_DIR/materialization-contract.md" '`Done-criteria` is a numbered list.'
assert_contains "$attended_fixture/design.md" '## Binding decisions, verbatim'
assert_contains "$attended_fixture/design.md" '## Leaf architecture'
assert_equal '1' "$(grep -c '^consult-election: \(yes\|no\)$' "$attended_fixture/design.md")" 'fixture election count'
assert_contains "$attended_fixture/state.yaml" 'phase: consult-position'
assert_contains "$attended_fixture/state.yaml" 'priority: n'
assert_contains "$attended_fixture/state.yaml" 'repo: akrogon'
assert_contains "$attended_fixture/SERIES-fixture.md" '| Order | Leaf'
assert_not_contains "$attended_fixture/SERIES-fixture.md" '| Status |'
assert_not_contains "$attended_fixture/SERIES-fixture.md" '| Priority |'
assert_not_contains "$attended_fixture/SERIES-fixture.md" '| Ownership |'
assert_not_contains "$attended_fixture/SERIES-fixture.md" '| Consult |'
pass 'leaf and series fixture shapes'

proposal_fixture="$FIXTURE_DIR/proposal-seed.md"
assert_file "$proposal_fixture"
assert_contains "$proposal_fixture" '# Seeded Issue'
assert_stamp_after_title "$proposal_fixture" '# Seeded Issue' 'Chart skill version: 3'
assert_contains "$proposal_fixture" '## Observed Behavior'
assert_contains "$proposal_fixture" '## Expected Behavior'
assert_contains "$proposal_fixture" '## Where It Happened'
assert_contains "$proposal_fixture" '## Reproduction Context'
assert_contains "$proposal_fixture" '## Urgency'
assert_contains "$proposal_fixture" '## Constraints And Exclusions'
assert_not_contains "$proposal_fixture" 'state.yaml'
assert_not_contains "$proposal_fixture" 'consult-election:'
pass 'proposal seed shape is state-free'

# Presence only: these greps catch a deleted rule sentence and nothing more. A rule weakened by
# an appended exception leaves every one of them green, so the mode, confirmation, repo and
# collision rules are measured by the live negative runs above, not here.
assert_contains "$SKILL_FILE" 'establish both facts'
assert_contains "$SKILL_FILE" 'never from a mode flag'
assert_contains "$SKILL_FILE" 'A machine seat in an akrogon'
assert_contains "$SKILL_FILE" 'emits a proposal seed'
assert_contains "$SKILL_FILE" 'An absent, partial, or revision answer'
assert_contains "$SKILL_FILE" 'repo answer must be one of the current'
assert_contains "$SKILL_FILE" 'destination preflight'
assert_contains "$ASSET_DIR/materialization-contract.md" 'every destination is unoccupied'
assert_contains "$ASSET_DIR/materialization-contract.md" 'never merge into or overwrite an existing'
pass 'mode, confirmation, repo, and collision rule sentences are present in the production contract'

assert_contains "$SKILL_FILE" 'Lower-tier returns are redone when a higher tier was reasonably available.'
assert_contains "$SKILL_FILE" 'records the tier'
assert_contains "$SKILL_FILE" 'one-letter veto'
assert_contains "$SKILL_FILE" 'timeout is a valid negative result'
assert_contains "$SKILL_FILE" 'only its measured finding'
if grep -Fq 'prototype-code' "$FIXTURE_DIR/operator-replies.md"; then fail 'prototype code leaked into fixture'; fi
pass 'research tier rejection and prototype veto/timeout/discard rules'

after_status="$(git -C "$ROOT_DIR" status --porcelain -- . ':(exclude).evidence')"
assert_equal "$before_status" "$after_status" 'repository intake write status'

for mirror in "$HOME/.claude/skills/chart-issues" "$HOME/.codex/skills/chart-issues" "$HOME/.pi/agent/skills/chart-issues"; do
  diff -r "$ROOT_DIR/skills/chart-issues" "$mirror" >/dev/null || fail "chart mirror differs: $mirror"
done
for mirror in "$HOME/.claude/skills/create-issue/SKILL.md" "$HOME/.codex/skills/create-issue/SKILL.md" "$HOME/.pi/agent/skills/create-issue/SKILL.md"; do
  cmp -s "$ROOT_DIR/skills/create-issue/SKILL.md" "$mirror" || fail "create-issue mirror differs: $mirror"
done
pass 'all touched global mirrors are byte-identical'

if [[ "$contract_only" == true ]]; then
  printf 'PASS: deterministic chunk contract checks complete; live leaf verification remains required\n'
else
  printf 'PASS: chart workflow verification complete\n'
fi
