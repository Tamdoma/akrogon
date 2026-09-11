# Seed issue verification

Fresh verification of the rewritten skill, 2026-09-11. Base: `f281241901d0f1c8a2bfd5943be838fb14f5eb9c`.

## Method

`baseline.md` records the old skill exercised before editing. `inputs.json` preserves actual root-file bytes, repository roots and `git remote -v` output from disposable repositories initialized with `git init -q` and configured with `git remote add`. V1 inspection started in nested/deeper and used `git rev-parse --show-toplevel` to establish the root.

The implementing agent read those inputs and applied the skill's routing contract. The positive routes and negative reasons were explicit agent decisions. There is no routing parser or algorithm under test. Each accepted case then executed its preserved `command.sh` through Bash with PATH pointing first to a temporary substituted gh executable. `boundary-source.txt` preserves that boundary's source. Each case directory contains its actual result and, when invoked, captured argv/stdin in `calls.jsonl`. Invalid cases were visibly stopped by the agent before submission, with zero gh calls. Their results validate this agent's reading of the instructions, not an automated rejection implementation.

The boundary made no network request. The URL ending in /issues/42 is the substitute's actual output, not a real created GitHub issue. The substituted error in V8 returned exit 1 and HTTP 401, with one invocation and no retry or success URL. No authentication behavior was mocked beyond this explicit CLI process substitution.

## Results

23 scenarios passed: seven successful submissions, fifteen routing stops, and one controlled submission failure. Every submitted argv and stdin matched the chosen target, literal title and authored five-section report exactly. V7 preserved shell-sensitive title and body bytes, with no marker file execution and missing details stated as Not provided.

| Case | gh calls | Actual outcome |
| --- | --- | --- |
| V1 | 1 | Last operation: created https://github.com/upstream/intake/issues/42 |
| V2 | 1 | Last operation: created https://github.com/upstream/intake/issues/42 |
| V3-https | 1 | Last operation: created https://github.com/consumer/app/issues/42 |
| V3-scp | 1 | Last operation: created https://github.com/consumer/app/issues/42 |
| V3-ssh | 1 | Last operation: created https://github.com/consumer/app/issues/42 |
| V4-missing | 0 | Last operation: stopped at /tmp/seed-issue-ho8tsjat/V4-missing/akrogon.yaml: missing top-level issues_repo |
| V4-blank | 0 | Last operation: stopped at /tmp/seed-issue-ho8tsjat/V4-blank/akrogon.yaml: blank issues_repo |
| V4-null | 0 | Last operation: stopped at /tmp/seed-issue-ho8tsjat/V4-null/akrogon.yaml: null issues_repo |
| V4-list | 0 | Last operation: stopped at /tmp/seed-issue-ho8tsjat/V4-list/akrogon.yaml: issues_repo is a list, not a string |
| V4-yaml | 0 | Last operation: stopped at /tmp/seed-issue-ho8tsjat/V4-yaml/akrogon.yaml: invalid YAML: unclosed flow sequence |
| V4-duplicate | 0 | Last operation: stopped at /tmp/seed-issue-ho8tsjat/V4-duplicate/akrogon.yaml: duplicate issues_repo keys are ambiguous |
| V4-url | 0 | Last operation: stopped at /tmp/seed-issue-ho8tsjat/V4-url/akrogon.yaml: issues_repo is a full URL, not owner/repo |
| V4-extra | 0 | Last operation: stopped at /tmp/seed-issue-ho8tsjat/V4-extra/akrogon.yaml: issues_repo has an extra path component |
| V4-path | 0 | Last operation: stopped at /tmp/seed-issue-ho8tsjat/V4-path/akrogon.yaml: issues_repo has no owner |
| V5-missing | 0 | Last operation: stopped at /tmp/seed-issue-ho8tsjat/V5-missing origin: origin is missing |
| V5-host | 0 | Last operation: stopped at /tmp/seed-issue-ho8tsjat/V5-host origin: origin host gitlab.com is not GitHub.com |
| V5-lookalike | 0 | Last operation: stopped at /tmp/seed-issue-ho8tsjat/V5-lookalike origin: origin host github.com.evil.test is not GitHub.com |
| V5-path | 0 | Last operation: stopped at /tmp/seed-issue-ho8tsjat/V5-path origin: origin repository path has an extra component |
| V5-local | 0 | Last operation: stopped at /tmp/seed-issue-ho8tsjat/V5-local origin: origin is a local path |
| V5-query | 0 | Last operation: stopped at /tmp/seed-issue-ho8tsjat/V5-query origin: origin repository path has a query suffix |
| V6 | 1 | Last operation: created https://github.com/consumer/app/issues/42 |
| V7 | 1 | Last operation: created https://github.com/consumer/app/issues/42 |
| V8 | 1 | Last operation: gh issue create failed (exit 1): HTTP 401: controlled authentication error for consumer/app |

The only tracked changed file is `skills/seed-issue/SKILL.md`: 68 lines, 496 words, 3,539 UTF-8 bytes, below 4,000 tokens even using one token per byte as a conservative ceiling. Manual review counts 12 directive sentences plus one descriptive dependency sentence, below 20. Removed names/modes are absent, all-harness routing is explicit, no harness folder is read, and the final footer has no next task. Unreadable-file and unestablished-root handling were reviewed in the text but not separately exercised.

Targeted check passed (exit 0, no output):

```bash
AKROGON_BASE=f281241901d0f1c8a2bfd5943be838fb14f5eb9c git diff --check
```

## Minimal safe boundary replay

Run from this verification directory. This recreates only the substituted process boundary and replays the preserved V7 literal submission. It deliberately does not automate routing. The temporary executable and captures are deleted on exit.

```bash
set -eu
verification_dir="$PWD"
seed_temp=$(mktemp -d)
trap 'rm -rf "$seed_temp"' EXIT
mkdir "$seed_temp/bin" "$seed_temp/capture" "$seed_temp/repo"
cp "$verification_dir/boundary-source.txt" "$seed_temp/bin/gh"
chmod +x "$seed_temp/bin/gh"
git init -q "$seed_temp/repo"
cd "$seed_temp/repo"
PATH="$seed_temp/bin:$PATH" CAPTURE_DIR="$seed_temp/capture" CASE_ID=V7 bash "$verification_dir/V7/command.sh"
cat "$seed_temp/capture/calls.jsonl"
test ! -e SHOULD_NOT_EXIST
test ! -e ALSO_NOT_EXIST
```

## Limits

These are semantic instruction checks plus real local Git/Bash and a substituted gh boundary. They do not prove live GitHub authentication, service behavior, or independent execution across every harness/model. No new parser, dependency, permanent fixture or committed test suite was introduced. Full repository checks belong to slot B. Temporary repositories and the executable substitute were removed after evidence capture.
