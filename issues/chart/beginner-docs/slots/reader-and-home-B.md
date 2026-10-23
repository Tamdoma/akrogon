# Blind notes B: reader-and-home

Read 2026-10-23. Independent position. Did not read A's notes, the merged map or the fork's Findings. Only this requested return file is written.

## Q1. First reader

### Pick, reason and cost

Pick (a): someone who can open a terminal and has used one coding agent CLI, with a clean-machine install path. Teach factory concepts from first principles without assuming experienced software development. These are separate requirements: the reader can be new to development while already able to open their agent and follow explicit commands.

Make the practical promise specific: on a Linux machine with a working systemd user manager, help the reader install the prerequisites, configure Akrogon, initialize a project, describe a small change, hand it off, start execution and recognize checked, merged work. Explain terminal location, repository and agent-session prompts as they first appear. Do not promise arbitrary operating systems or application deployment.

Cost: the install chapter must actually start before today's assumed checkout and machine config. It must explain acquisition, required binaries, harness authentication/configuration, the global config and PATH, then show a clear successful setup result. Repository initialization is a later step. This is documentation work, not authorization to add installers or portability features.

Keep a shortcut for readers with prepared machines: confirm effective config and project registration, then enter the same first-change tutorial. That is a navigation link within option (a), not a second full installation narrative.

### Rejected options

(b), prepared machine only: acceptable as a shortcut, insufficient as the primary promise. It hides who creates the required config and prerequisites and strands public GitHub readers without a prepared environment. It also fails to repair the concrete gap in today's install page, which assumes an Akrogon checkout already exists.

(c), true non-developer with no stated baseline: too vague to be a verifiable end-to-end promise. Current operation needs an agent CLI, Git repositories, authenticated tools and a Linux/systemd session. It would expand this rewrite into generic computing, OS setup and Git/agent training unless the operator defines a narrow supported environment. Explain concepts for this reader, but do not claim the machinery no longer needs those prerequisites.

Do not reject non-developers as users. Reject an unstated prerequisite floor. The opening explanation can be understandable to anyone while the installation instructions state what the machine and operator need.

### Evidence, tier, source and date

E1. Tier 1, operator intake, issues/chart/beginner-docs/INTAKE.md, Source: operator 2026-10-23 /chart-issues, read 2026-10-23: asks for first principles, very beginner-friendly material and people who want to build things. It does not specify a supported OS or promise zero CLI experience.

E2. Tier 3, current documentation, docs/guide/install.md sections Prerequisites, The command and Global config, read earlier this session 2026-10-23: requires Bun, Git, Herdr, configured harness CLIs, flock, authenticated gh for GitHub actions and a systemd user manager at systemd 254 or later. Existing command checks omit a systemd version check. Installation begins from an existing checkout.

E3. Tier 3, current source, src/install.ts install and planSkillLinks, inspected 2026-10-23: reads global config before installation, links the command into ~/.local/bin and the systemd slice into ~/.config/systemd/user, runs systemctl --user daemon-reload, installs configured Herdr harness integrations and links the plugin. It does not acquire prerequisites or bootstrap the machine config.

E4. Tier 3, current source, src/config.ts readGlobal, inspected 2026-10-23: reads and schema-parses config.yaml from globalHome and throws on failure. A clean-machine guide cannot treat this as an optional file created by install.

E5. Tier 3, current source, src/scope.ts, inspected 2026-10-23: uses systemd-run, systemctl, the user bus and XDG_RUNTIME_DIR, with /proc and /sys/fs/cgroup defaults. Linux/systemd is an operational requirement, not just an incidental install command. The numeric systemd floor comes from current install documentation, not a new version compatibility experiment in this consultation.

E6. Tier 3, current docs, docs/guide/setup.md sections The easy way, The direct way and What init-akrogon adds to init, read earlier this session 2026-10-23: the setup skill inspects the project and proposes settings, while init writes/validates configuration. This supports a beginner path through the skill rather than first requiring manual state and config construction.

### Pitfalls and what removes them

R1. “Clean machine” is interpreted as “any OS.” State the actual supported environment before commands. Keep unsupported-machine installation outside the tutorial rather than inventing WSL, container or macOS workarounds.

R2. A tutorial works only on the author's already configured machine. Trace the sequence against a missing global config, missing checkout and absent PATH entry. Use documented source behavior to verify ordering. Any real fresh-environment run must be isolated and explicitly scoped at implementation.

R3. The first task becomes a terminal/Git textbook. Link prerequisite learning where needed, provide exact commands and expected results, and keep factory concepts in the local flow. Do not require learning the whole state schema before starting.

R4. Credentials become example content. Explain which tool needs authentication and where configuration expects it. Use placeholders and authentication instructions, never literal working credentials.

R5. Prepared users repeat installation or copy a second drifting guide. Give them one skip-ahead entry after a short readiness check, then reuse the same tutorial.

### Missing question

Q1a. Does “clean machine” mean a supported Linux desktop session with systemd already running, or must this rewrite also teach installing the operating system? My pick assumes the former. That boundary should be written into the contract rather than left to each author.

## Q2. Documentation home

### Pick, reason and cost

Pick (a): README plus repository Markdown under docs/, rendered directly on GitHub, with no documentation build.

This meets the stated output and fits existing agent workflows. Code, human docs, SVGs and skill corrections can be reviewed and merged in one change. Local agents can read the same tracked files without web access or a generated artifact. Keep docs/reference-index.md as the code/grounding index. Add or improve a distinct human docs entry page and link it from README. The grounding index can point to that human entry without becoming the tutorial itself.

Cost: authors must maintain a small explicit navigation structure and check repository links and anchors. GitHub Markdown offers fewer site navigation/search controls than a dedicated docs site, and SVGs must work in GitHub's image context. Those are acceptable constraints for this request. A hosting change does not itself resolve the current mixed-purpose pages and repeated rules.

### Rejected options

(b), GitHub Pages using VitePress/MkDocs: a reasonable later choice if there is a concrete requirement for site navigation, documentation search or another site feature. It can retain Markdown as canonical source, so it is not inherently a duplicate-content problem and does not inherently stop agents reading files. However, the named option adds a generator dependency, configuration, build/publish process and validation of links/assets across source and rendered URLs. None of those is currently necessary to meet “the entire documentation on GitHub.” Reject for current scope, not because Pages is intrinsically expensive or technically unsuitable.

(c), GitHub wiki: least suitable. Wiki content is in a separate .wiki.git repository. Feature code and corresponding docs would require coordinated changes in two repositories, and local agents would need another checkout or remote access for grounding. Copying wiki content into docs/ would add a second source of truth. Easy browser editing does not compensate for that maintenance split in this factory.

### Evidence, tier, source and date

E7. Tier 1, operator intake, same source/date as E1: explicitly asks for an improved README and documentation on GitHub. No Pages deployment, generator or wiki requirement is stated.

E8. Tier 3, repository source, docs/reference-index.md, inspected 2026-10-23: links code, tests, skills, integration, documentation, issue records and lessons through relative local paths. It currently links documentation to guide/. Existing setup documentation explains grounding as the index -> relevant area -> source path read by planning and implementation agents. Preserve that use.

E9. Tier 3, repository configuration, package.json inspected earlier this session 2026-10-23: Bun/TypeScript project with test/typecheck/format scripts and no documentation generator dependency. A built site would introduce a new maintenance surface.

E10. Tier 3, GitHub primary documentation, read 2026-10-23, https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages : Pages publishes a static site from a repository, optionally with a build. Therefore the build cost is specific to choosing a generator such as those named in option (b), not an unavoidable property of all Pages use.

E11. Tier 3, GitHub primary documentation, read 2026-10-23, https://docs.github.com/en/communities/documenting-your-project-with-wikis/adding-or-editing-wiki-pages : wiki contents are cloned from a separate YOUR-REPOSITORY.wiki.git repository and made live through its default branch. Supports the coordination and local-access cost above.

E12. Tier 3, GitHub primary documentation, read earlier this session 2026-10-23, https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams : GitHub renders diagrams in Markdown files. Useful visual documentation does not require a separate site.

### Pitfalls and what removes them

R6. Repo Markdown becomes a directory dump. Give the human entry page a short first-run route plus task-based links. Do not rely on alphabetical directory listings as navigation.

R7. Agents confuse the human learning path with code grounding. Keep the current grounding index's responsibility and add one explicit human-entry link. Human chapter order and source-area structure serve different needs.

R8. Every feature is documented in README, guide and skill prose separately. Assign one canonical location per detail and summarize/link elsewhere. A future site can render that same source if justified, without copying content now.

R9. File moves break old GitHub links. Inventory current in-repository inbound links and heading references before moving pages, update owned links, and preserve inexpensive entry stubs for important old page URLs where needed. Do not assume a site redirect exists on GitHub file rendering.

R10. Local SVG rendering passes but GitHub presentation fails. Validate the actual image embedding on GitHub early, including static/reduced-motion comprehension and both themes. Hosting choice (a) does not waive this check.

### Missing question

Q2a. Is there any required reader capability that repository Markdown cannot provide, such as a dedicated searchable docs site? If none is named, choose (a) and spend the scope on the reading path, accuracy and examples.

## Lock carried forward

Implementation A for every resulting leaf remains harness claude, model claude-opus-5-5, effort medium. These notes do not change B or the charting consultants.
