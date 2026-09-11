# Review B: chart-issues

Verdict: nits

Base: `398761c2afa453be5b383397c457c78c2066cb3a`
Reviewed head: `308d5ed029f96bf1ae4aea51ec9ec7a14c39c544`

The worktree was clean before and after review, and the reviewed head is one commit ahead of the configured base. Reviewed the authoritative plan and implementation brief/report, original done-criteria, current skill/references, complete changed-file scope and the affected state/config/routing contracts. No peer review was used. No blocking behavioral defect found.

## Findings

N1 — Historical standing text remains inconsistent with the literal exclusion in brief criterion 5. `skills/chart-issues/assets/standing-design.md:10` retains “parks at dispatch,” while its current interpretation expressly disallows opening a leaf with an unfinished known human prerequisite or adding a hold state. The locked design's 2026-09-10 reading note explicitly requires the original standing lines to stay verbatim, and plan D7 records this exact limitation. The implementation preserves that block byte-for-byte and does not restore the retired behavior. This is a documented conflicting text requirement, not an implementation repair to invent. Literal criterion 5 is not certified for the quotation. A future authorized change to the standing lock can remove the wording.

No other Fix or Nit. The fresh reader's general mixed-debate observation does not establish wrong behavior within scope: tiny issues use the explicit no exemption, while the door asks the implementation election once for other work. No extra configurability is required by the brief.

## Verification

- Independently executed a new temporary-repo handoff during this review, with the actual YAML example parsed through live stateSchema. Emitted an epic, two issue indexes and leaf brief/design/state files, replicated one epic-owned source into both leaves, retained chart/intake/original source, and appended the handoff date after successful real status.
- Followed the preflight instructions to refuse a missing prerequisite and an occupied partial-leaf destination before emitting invalid contracts. Confirmed the original sentinel brief survived. This verifies the reader's door decision separately from the CLI's validation.
- Invoked the real next command with the existing fake-herdr executable in the isolated AKROGON_HOME. Both initial phases dispatched correctly:

```text
plan-issue review-first slot=B phase=plan.synthesis
plan-issue review-second slot=A phase=plan.positions
plan-issue review-second slot=B phase=plan.positions
```

- Separately injected externally malformed state with `blocked-by: [missing]`. Real next exited 1 with `Missing leaf: missing`. Source bytes, intake copy and sentinel were preserved. Saved command output in `review-B-evidence.json`, then removed the entire sandbox and temporary review helper. No real panes, sockets, GitHub or install roots were used.
- Independently checked all owned local links, exact standing-block preservation, requested folder deletions, and scope of all changed paths. All passed. `git diff --check <base>..HEAD` passed.
- Verified implementation evidence for the unchanged reviewed content: `bun test` had 46 passes, 0 failures and 487 assertions, format and typecheck exited 0. No code changes or missing full-suite evidence justified repeating those checks. The review-specific handoff exercise above addresses the checker's explicit acceptance responsibility.
- Main skill is 62 lines. Recorded tokenizer evidence is 1,120 o200k_base tokens. The independent reader's seventeen coherent behavioral constraints are a reasonable semantic count rather than a count of imperative words. Opening, stopping, peer blindness/rebuttal/late checks, human completion, provenance, debate and direct handoff all have operative guidance.
- `grounding: none` supplies no index to update. Existing references outside the owned skills are named in the implementation report and belong to other scope. No lesson was introduced, applied or claimed by this diff. No permanent test merely checks prose wording, and the removed fixture/test folders match explicit scope.

The implementation is suitable for merge with N1 disclosed. The command determines the aggregate phase after both initial reviews.
