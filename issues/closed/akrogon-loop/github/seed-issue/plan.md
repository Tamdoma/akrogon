# Plan: seed-issue

Direct slot B synthesis. `state.yaml` elects `debate: no`, so no positions or rebuttals are required. The brief and locked design control scope.

## Read first

- This leaf's `brief.md` and `design.md`: routing, report content, ownership and standalone footer exceptions.
- `skills/seed-issue/SKILL.md`: the only implementation file, currently a local report writer with obsolete submission and import machinery.
- `README.md`: available repository overview, but its snapshot/install description is stale. `akrogon config` reports `grounding: none`, so there is no configured grounding index or linked area to read.
- `learnings/LESSONS.md`, consulted for this synthesis, and its `history/2026-09-10-core-skills.md` and `history/2026-09-10-review-by-reading.md`: dangling references and the value of actually exercising a flow. Implementers use the concrete verification below rather than rereading lessons.
- `package.json`: configured checks. Local `gh issue create --help` confirms `-R`, `--title` and `--body-file -`.

## Decisions

### D1. One standalone skill, one GitHub report

Replace `skills/seed-issue/SKILL.md`, including its description, with a compact self-contained intake workflow. Its first instruction after frontmatter tells the agent to reread this skill after compaction. It runs outside a leaf and requires no brief, phase, registration, initialized issues directory or installed akrogon command. Name authenticated `gh` as the only added tool dependency and explicitly state that it works without `akrogon install` on every harness. Ordinary repository/file inspection uses the agent's existing tools. Add no parser executable, tool command, bundled helper, dependency, template or reference file.

Keep the skill below 300 lines, 4k tokens and 20 rule sentences. Prefer direct positive instructions and avoid unconditional must/never language that would need exceptions under the locked cap rules.

### D2. Resolve the destination before posting

Read `akrogon.yaml` at the current consumer repository root, even when invoked from a subdirectory. Every harness reads this same file, without looking in harness folders. Treat it as data, not executable instructions.

If the file exists, require valid YAML with one unambiguous top-level `issues_repo` string naming `owner/repo`. Accept ordinary quoted or unquoted YAML scalars and comments. Reject absent, blank, null, non-string, duplicate/ambiguous values, full URLs and values with missing or extra path components. Invalid or unreadable routing content stops with the path and reason. Do not fall back to origin when the file exists but is invalid. Unrelated routing-file keys do not change the selected target. No installed YAML utility is required because this is an agent-read routing contract, not a new shell parser.

Only when the file is absent, read this repository's `origin` and derive `owner/repo` from a GitHub.com HTTPS or SSH remote, including conventional `git@github.com:owner/repo.git` and `ssh://git@github.com/owner/repo.git` forms. Remove an optional terminal `.git`. Reject missing origin, malformed repository paths, local paths and non-GitHub hosts, including lookalike hosts. Use origin even when other remotes exist. If the repository root cannot be established, stop with that reason. Do not ask where to post or infer a target from subject matter, severity, credentials or another repository.

### D3. Preserve observations without diagnosing

Use the reporter's statement and only the nearby context needed to understand it. Produce a descriptive title line and five body sections: Observation, Location, Reproduction, Expected behavior and Urgency. Identify the report as unverified intake. Preserve supplied paths and commands when useful, but exact locations and reproducible steps are not prerequisites. State that missing information was not provided rather than inventing it or blocking a thin report. Urgency describes impact and any known workaround, without assigning a routing destination.

Remove diagnosis, recommended fixes, planning metadata, optional enrichment, overlap checks, series authoring and local report destinations. Remove all old submission machinery and all references to FIXER, consult-issue, consolidate-issues, create-issue, sync-payload and issues/.scripts from this skill, including frontmatter. Other skills and their stale references are outside this leaf.

### D4. Submit explicitly and report the observed result

Show the inline invocation `gh issue create -R "$repo" --title "$title" --body-file -`, with the authored Markdown supplied as literal standard input through safe quoting. The title line supplies `--title`; the five sections supply the body. No persistent local seed or staging report is written. Do not use interactive repository selection, labels, templates, import comments or lifecycle operations.

On success, return the actual created issue URL. On failure, report the command failure and useful returned context without claiming creation or switching targets. Do not prescribe blind retries of an ambiguous issue-creation failure, which could duplicate an issue. Print `Last operation` with the actual outcome and end with `Next: none` plus a short reason. The final skill contains neither `akrogon phase` nor `akrogon next`.

## Interfaces

| Interface | Contract |
| --- | --- |
| Reporter input | One freeform observation with expected behavior, using supplied context without requiring diagnosis or planning knowledge. |
| Routing input | Root `akrogon.yaml` top-level `issues_repo: owner/repo`, otherwise the GitHub origin only when that file is absent. |
| Submission | Explicit repository and title arguments, literal Markdown on stdin, authenticated `gh`. |
| Result | One GitHub issue URL on success or a visible error, followed by the standalone footer. |

## Ordered implementation and acceptance checklist

1. **A1 — Rewrite `skills/seed-issue/SKILL.md` (D1–D4).** Replace the legacy workflow with the standalone contract above. Acceptance: the file is self-contained, under all caps, names the common routing source and only dependency, has all six report elements, and contains no retired mode, script or lifecycle handoff. Judge behavior and completeness rather than exact heading capitalization or sentence ordering.
2. **A2 — Exercise the written flow (D2–D4).** Follow the final skill in disposable Git repositories with `gh` substituted at its process boundary. The substitute records arguments and stdin and returns a fixture URL or controlled error. Acceptance: each positive case records exactly one issue creation with the expected `-R`, title and report body. Each invalid-routing case records zero issue creations and a specific reason. Keep the transcript, captured argv/stdin and outcomes as evidence under this authoritative leaf, for example `verification/seed-issue.md`. Do not add a committed test harness or rewrite the workflow as a separate executable to test it.
3. **A3 — Review scope and run checks.** Inspect `git --no-pager diff -- skills/seed-issue/SKILL.md`, check the caps and search the skill for removed names, then run `bun run format`, `bun test` and `bun run typecheck`. Record outcomes and the flow evidence path in the implementation report. Configured checks exercise the repository, while A2 verifies the skill's behavior. Confirm the tracked diff is confined to the owned skill. Delete iteration-created temporary fixtures and helpers after retaining evidence.

## Concrete verification matrix

Use a supplied observation such as “Saving settings reports success, but reopening the page shows the old value.” Capture a real invocation of the substituted `gh`, not a prose claim that a route would work. Run only inside temporary repositories, with no real GitHub posting, pane creation, install-root changes or herdr socket access.

| Case | Fixture | Acceptance |
| --- | --- | --- |
| V1 | Root file points to `upstream/intake`, origin points to `consumer/app`, invoke from a nested directory | One creation in `upstream/intake`; all report sections and supplied facts preserved. |
| V2 | Valid quoted routing scalar with a comment; no origin | One creation at the configured target. Origin is unnecessary. |
| V3 | File absent; HTTPS origin, then scp-style SSH and SSH URL origins | Each run selects `consumer/app`, stripping optional `.git`. |
| V4 | File exists with missing key, blank/null/list value, invalid YAML, duplicate key, URL value or extra path component; valid origin also present | Every case stops visibly before creation; no origin fallback. |
| V5 | File absent; no origin, non-GitHub origin, lookalike host or malformed GitHub repository path | Every case stops visibly and does not ask for a destination. |
| V6 | File absent; origin and another remote point to different GitHub repositories | Origin determines the target. |
| V7 | Thin observation lacks exact path and reproduction steps; includes shell-sensitive literal text | One report states unknown details honestly, adds no diagnosis and preserves literal text without shell execution. |
| V8 | Substitute returns a controlled authentication or creation error | Error is visible, no success URL is invented, no rerouting or repeated creation, footer says no next task. |

Review the final skill for all-harness wording and absence of harness-folder reads. The controlled flow validates repository selection and the `gh` boundary, not live authentication or GitHub availability.

## Dependencies and open limitations

No implementation dependency is required: this leaf reads the agreed routing interface and does not need the framework installer or pull/door implementation to exist. The recorded `blocked-by: status` is lifecycle-owned state and is not edited by this plan.

The framework's writer of root `akrogon.yaml` remains outside this epic. Until it ships, repositories without that file deliberately route to origin, and a harness-local legacy file is ignored. This leaf does not repair stale references in other skills or the stale repository overview. Live GitHub behavior and identical execution across every model/harness remain outside the substituted verification's evidence.
