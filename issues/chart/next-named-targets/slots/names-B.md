# Names — blind Slot B notes

Read Intake, Names Question/Carries and the two related fork questions. No names-A.md or merged file read. The brief lists an opening merged map but prohibits merged files, so it was not read. All evidence checked 2026-10-08. Repository references are relative to /home/ivan/Work/infra/akrogon.

## Q1 — Owner stores, path precedence and ambiguity

### 1. Pick, reason and cost

Recommend adding bare owner names for open owners only, while preserving existing leaf-slug resolution across open/closed and existing folder/worktree path behavior. Closed owner names should not compete with current open owner names. Explicit paths can still address closed records as today. Parked owners stay outside dispatch; parked-leaf diagnostics remain available.

Recommend preserving existing-directory path precedence. If the input already resolves to a directory from cwd, use the current path selection. If it does not, collect all matching open epic/issue owners plus existing leaf-slug candidates, and reject multiple candidates before any dispatch. Include kind and full repo-relative path for each ambiguity candidate, even when two candidates select the same leaves. The report explicitly requests refusal on owner/leaf collisions, not only different selected sets.

Cost: path precedence means a local directory can shadow an owner/slug and cause cwd-dependent results. The operator must accept that qualification to “from anywhere in the repo”; an explicit path such as issues/open/<epic>/<issue> remains the escape for owner-name collisions. Open-only owner names also mean a name stops resolving as an owner when archived, although the existing closed leaf-slug/path forms continue working.

Derive owner identities from validated leaf depth and their ancestor folders, rather than requiring ISSUE.md/EPIC.md to exist. Those files can carry metadata but discovery does not require them. Deduplicate repeated references to the same owner path, not owners sharing the same basename.

### 2. Rejected options and reasons

- Open and closed owners: consistent with allLeaves, but unrelated historical owners can make a currently usable name ambiguous later. Closed owners have no new dispatch work. Use paths for archival access.
- Owner priority, leaf priority or first filesystem match: violates the intake's ambiguity requirement and can silently start the wrong group.
- Union all matching owners: convenient for repeated names but invents a multi-owner dispatch target the report did not request.
- Treat equal leaf sets as unambiguous: changes the requested kind-collision rule and hides which entity the operator named.
- Bare names always win over existing paths, with ./ or absolute syntax forcing paths: more stable across cwd, but changes today's handling of an existing single-component directory. This is a coherent alternative if cwd-independent naming matters more than preserving every old path spelling. It must be an operator choice, not an accidental resolver change.
- Require unique issue basenames across all epics: adds a new repository-wide restriction rather than resolving the real ambiguity locally.

### 3. Evidence, tier, source and date

- Operator tier: #59 Intake, https://github.com/Tamdoma/akrogon/issues/59. It asks for epic, nested/top-level issue and leaf names, preservation of paths/worktrees, and refusal listing collisions. This rules out guessing by kind.
- Better-than-training, repository code: `src/next.ts:1173-1189` expands the cwd-relative path and identifies the registered checkout through its Git common directory. `src/next.ts:1191-1195` gives existing paths precedence and otherwise filters only leaf slugs. `src/next.ts:147` discovers open/closed leaves. `src/config.ts:179-198` confirms worktree identity comes from the common directory.
- Better-than-training, repository shapes: `src/state.ts:114-118` accepts depth two (issue/leaf) or three (epic/issue/leaf). `src/state.ts:132-141` validates duplicate leaf slugs and repo identity, not owner basenames. Two nested issues named review under different epics are therefore possible today when their leaf slugs differ: issues/open/epic-one/review/leaf-one and issues/open/epic-two/review/leaf-two. This conclusion follows from the accepted paths and absence of an owner-name uniqueness check.
- Better-than-training, operator surface: `src/status.ts:174-182` prints each ancestor basename with nesting indentation. Repeated review names appear beneath their respective epic headings, not as unique global names. `src/park.ts:13-19` enumerates only immediate children, and park validates against those at :52. The report's park comparison does not prove nested-name support.
- Better-than-training, compatibility: `src/state.ts:146-158` detects parked leaf names without parsing parked state; `tests/next.test.ts:2356` covers dormant leaves and active preference. Preserve that diagnostic instead of dispatching parked owners.
- Better-than-training, documentation: docs/guide/parts.md explicitly allows a standalone issue and its only leaf to share a name. Under the requested cross-kind ambiguity rule, that common pattern becomes an error requiring a folder path. This is a real compatibility cost to present, not an exotic edge case.
- Practitioner tier: Jeff King, Git contributor, first-hand commit explanation reviewed by Jonathan Nieder and integrated by Git maintainer Junio C Hamano, https://code.googlesource.com/git/+/141856738152d02beac5d4270a310a6007597282 (2013-12-06). Explicit revision/path intent should govern both resolution and diagnostics. This supports clear disambiguation paths rather than misleading missing-name errors.
- Better-than-training, primary Git docs: https://git-scm.com/docs/gitcli documents explicit revision/path separation for ambiguous inputs. https://git-scm.com/docs/gitrevisions documents ordered precedence among ambiguous ref namespaces. These are different policies, not evidence that every CLI rejects all collisions. Akrogon's intake chooses rejection; Git's useful prior art is an explicit escape and accurate diagnostics, not copying its ref precedence.

Synthesis: Git's implementers distinguish explicit intent from ambiguous shorthand. Apply that principle while preserving Akrogon's selected compatibility boundary. Git cannot settle open/closed stores or cwd precedence for this project.

### 4. Pitfalls and what removes each

- Two nested same-name issues silently choose the first: collect and report all distinct owner paths before allocation. Verify refusal produces no Herdr mutation.
- A leaf shares its issue's name: report both kinds/paths and show working explicit folder alternatives. Do not deduplicate them merely because their selected sets are identical.
- An archived owner shadows open work: exclude closed owners from the new owner-name namespace while preserving existing closed leaf/path semantics. Test this distinction.
- Missing index files hide owners: derive names from accepted folder structure, matching status. Do not make metadata-file presence a new discovery condition.
- Malformed leaves disappear and make selection appear complete: preserve discovery's unreadable/foreign/duplicate errors (`src/next.ts:120-166`). Valid siblings may still be selected according to existing partial-discovery behavior. Do not replace recorded parse errors with an invented missing-owner explanation.
- A local unrelated folder wins and sweeps unexpected descendants: retain the current path rule only with its cwd-dependent cost accepted and documented. Verify the same owner from root, subfolder and worktree when no local path shadows it, and separately verify shadowing behavior.

### 5. Questions missing from the fork

- Should two nested issues with the same basename be refused just like cross-kind collisions? Recommend yes, listing both epic-qualified paths.
- Does an issue/leaf name collision fail even when both select exactly the same one leaf? Recommend yes to match the intake, but explicitly show the common documented same-name pattern to the operator.
- Is “from anywhere” unconditional, or subject to existing local-path precedence? The current question exposes the mechanism but must state this cost before the operator chooses. If unconditional naming wins, choose explicit path syntax for paths instead.
- Are owner names inferred from valid leaf ancestry even without an index file, and what diagnostic should an empty owner produce? Recommend structural discovery with a clear no-leaves result for an empty recognized owner, without dispatch. Decide empty-owner recognition explicitly rather than accidentally using file presence.

Blocked wait reasons and the leaf split remain for their own forks. No naming recommendation is treated as settled.
