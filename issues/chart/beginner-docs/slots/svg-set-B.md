# Blind notes B: svg-set

Independent notes, 2026-10-23. Read the fork's Question/Carries and updated fact-ownership Taken. Earlier taken audience/architecture decisions remain held. No A notes, merged notes or current Findings read. No GitHub writes, browser session changes or asset creation performed. Only this return file is written.

## Q1. Picture set and useful motion

### Pick, reason and cost

Pick (a), with one substantive correction: do not depict attended, direct, autopilot and watch as four interchangeable ways to run work. Attended/autopilot concern chart decision-making; direct/lifecycle concern delivery route; watch is optional monitoring/recovery during execution. Show these relationships explicitly in the static comparison, or use a comparison table if that is clearer.

Use three animated views only for their distinct teaching jobs: overview shows the request-to-contract boundary and explicit start of lifecycle execution; one-change view shows review/repair and checked landing; chart-door view shows independent consultation, decisions and contract formation. Keep the same overview asset in README and its concept page rather than maintaining two nearly identical versions. Do not make the lifecycle animation suggest a review failure or repair happens on every run, or that B handles every normal merge. Motion highlights the allowed sequence, not actual runtime duration or live status.

Folder relationships remain static. All labels, branch labels and edges remain understandable at rest. Animation should not erase one stage to reveal another.

Cost: each distinct view needs a clear owner and review when that behavior changes. Three animations are justified only by three different explanations, not by a diagram quota.

### Rejected options

(b), animate every concept: motion adds maintenance and competes with reading even where there is no temporal relationship to explain. Folder/config relationships gain little from it.

(c), only overview: satisfies the front-door requirement but leaves independent consultation and the review/repair loop compressed into a diagram too crowded for a beginner. It is viable only if those concepts are sufficiently clear without additional pictures, rather than because one image is an arbitrary limit.

### Evidence, tier, source and date

E1. Tier 1, operator intake: animations only when they help explain concepts. Taken architecture: short README, ordered explanation, task pages and narrated examples without exercises. Both read in this session.

E2. Tier 3, current skills/guide inspected earlier: chart-issues Autopilot/Direct route and in-practice watcher behavior separate chart decisions, delivery and monitoring. merge-issue's normal green landing is command-owned. These contracts determine the arrows, independently of visual style.

### Pitfalls and removal steps

R1. A polished image teaches a wrong workflow. Review an explicit node/edge description against the current source and skills before styling. Particularly separate autopilot handoff from dispatch and optional watch.

R2. Three images become contradictory copies. Give each one scope and reuse the overview. A behavior-changing leaf updates its affected image under the already existing stale-doc obligation.

R3. Readers must wait for a label. Make the complete diagram the base state and animate emphasis only. Keep an adjacent prose explanation and useful img alt text.

### Missing question

Q1a. Can the static “four ways” view be specified as relationships between decision mode, delivery route and monitoring instead? Otherwise option (a) embeds a conceptual defect before implementation.

## Q2. Theme behavior

### Pick, reason and cost

Pick (a): a solid background card with an intentional, accessible palette and one SVG per picture. The asset remains legible whether GitHub surrounds it with light, dark or a higher-contrast theme. Check borders and contrast on both surrounding backgrounds. This costs some visual integration with the page but removes dependence on theme propagation and avoids paired assets.

### Rejected options

(b), internal prefers-color-scheme: not intrinsically wrong. Current MDN documents that an embedded SVG can receive the embedding element's color-scheme. It is therefore inaccurate to say the query always follows only the OS. However, it is also inaccurate to assume the SVG directly reads GitHub's account theme. Behavior depends on the page's embedding styles and browser implementation. We do not control the README's parent CSS. Extra coupling brings no necessary value for these diagrams.

(c), paired assets with picture: GitHub and practitioners document this approach, and it can match the site theme better. But every geometry/label edit must keep both files aligned unless a generator is added. That cost is unnecessary when one card palette can meet readability needs. If chosen, validate GitHub's actual theme selection rather than equating ordinary browser media emulation with the account theme.

### Evidence, tier, source and date

E3. Tier 3, MDN, https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-color-scheme, read 2026-10-23: embedded SVG behavior is based on the parent element's color-scheme, including cross-origin embedding. This establishes a mechanism, not a guarantee about GitHub's current styles.

E4. Tier 3, GitHub Changelog, https://github.blog/changelog/2022-05-19-specify-theme-context-for-images-in-markdown-beta/, read earlier 2026-10-23: documents picture/source theme selection in Markdown. Platane's snk README uses paired SVGs the same way. This supports option (c)'s feasibility, not a requirement to use it.

### Pitfalls and removal steps

R4. GitHub theme and OS theme are tested as if identical. For an actual GitHub probe, set the site theme explicitly and record it. Local wrappers establish contrast and browser behavior only.

R5. Paired assets drift. Avoid pairs under the recommended single-card approach. Do not introduce a generator solely to repair avoidable duplication.

### Missing question

Q2a. Is matching GitHub's background a requirement, or is readability the goal? The intake supports readability. Choose the simpler card unless seamless theming is explicitly wanted.

## Q3. Authoring technique

### Pick, reason and cost

Pick (a): checked-in, handwritten SVG with internal CSS keyframes, no external scripts/fonts/styles. Keep the full static diagram as base markup. Under prefers-reduced-motion: reduce, disable animation and remove any transient emphasis that obscures the diagram. Base labels must already be visible, so an unsupported media query or animation engine does not leave a blank/incomplete image. Use a brief, finite emphasis sequence where possible rather than endless motion beside prose.

Cost: manual layout and keyframe timing for a small fixed set. Keep shapes/text simple and use a viewBox. Check text at actual embedded width, not only full SVG size.

### Rejected options

(b), SMIL: valid and used in real README images, not unsupported by definition. But CSS provides a straightforward common authoring path for emphasis plus reduced-motion behavior. Mixing SMIL timing with CSS suppression invites another interaction to maintain. Use it only if a necessary motion cannot be expressed simply in CSS.

(c), generator/tool: justified for large data-driven or repeatedly laid-out visuals, not established here. A generator adds source/output synchronization and a runtime/dependency surface. Do not adopt a hosted SVG endpoint, scheduled workflow or animation service for static conceptual docs.

### Practitioner evidence, tier, source and date

E5. Tier 2, DenverCoder1 / Readme Typing SVG, https://github.com/DenverCoder1/readme-typing-svg and https://github.com/DenverCoder1/readme-typing-svg/blob/main/src/templates/main.php, read 2026-10-23: supplies SVG images for Markdown and generates declarative SMIL animate elements. Shows SMIL is a real shipping technique. Its hosted endpoint and text-disappearance effect are inappropriate dependencies/interaction for our docs.

E6. Tier 2, Platane / snk, https://github.com/Platane/snk, https://github.com/Platane/snk/blob/main/packages/svg-creator/snake.ts and https://github.com/Platane/snk/blob/main/packages/svg-creator/index.ts, read 2026-10-23: generates self-contained SVG with CSS animation and documents README embedding and theme variants. Its generated animation supports CSS feasibility, not copying its contribution-game generator or indefinite loop.

E7. Tier 3, MDN, https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/SVG_as_an_image and https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion, read 2026-10-23: image contexts disable script and restrict external resources; reduced-motion media queries provide the preference signal. Exact behavior still requires checking the embedded asset.

### Pitfalls and removal steps

R6. A screenshot proves only one instant. Inspect the embedded image at multiple points in its emphasis sequence and with motion disabled. No text should clip or become essential only at one timestamp.

R7. An SVG works as a document but not as an image. Test img embedding, not just opening the raw SVG tab. Do not depend on script, external font fetches, hover controls or interactive SVG links.

R8. The word “animation” becomes another constant distraction. Prefer one complete static explanation with restrained emphasis. Do not use movement as a progress indicator for actual factory state.

### Missing question

Q3a. Can finite emphasis rather than continuous looping be the default? It preserves useful sequence without requiring a pause control that an image embedding cannot conveniently provide.

## Q4. GitHub proof and available tools

### Pick, reason and cost

Pick (a), conditional on the operator authorizing the explicitly described GitHub write. This consultant has not performed it and the current brief forbids it. It gives the strongest small proof of the uncertain deployment boundary before the whole visual set is built.

A should prepare the tiny self-contained sample and exact throwaway branch plan for review before requesting the write approval. One Markdown page must embed the SVG using the intended final relative-link/img form. Check actual github.com rendering in explicit light and dark site themes, normal/reduced motion and a narrow viewport. Record URLs/commit and screenshots outside the disposable branch before deleting it. The probe should test the chosen one-card CSS technique, not introduce a different service/embedding route.

Cost: a temporary remote branch, browser inspection, evidence retention and cleanup. It does not require a PR, merge, site deployment or changing default-branch docs. No such write is authorized by these notes.

### Rejected options

(b), practitioners plus local check: good evidence of browser/format feasibility, but not the exact GitHub-rendered result for our asset. It can be an explicit lower-confidence acceptance choice if the operator declines a remote probe. Do not quietly call it equivalent GitHub proof.

(c), check only after merge: discovers image-path/sanitization/contrast problems after publishing the whole rewrite. The uncertainty is cheap to test earlier.

### Evidence, tier, source and date

E8. Tier 3, GitHub Docs, https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-anonymized-urls, read 2026-10-23: Camo proxies images; content types and caching can affect display. Prefer repository-relative static assets over a hosted dynamic endpoint. Do not claim every repository SVG necessarily follows the same external Camo route.

E9. Tier 3, GitHub Markup README, https://github.com/github/markup/blob/master/README.md, read 2026-10-23: GitHub sanitizes generated HTML and applies further image/CDN filters. This is the Markdown HTML pipeline, not proof that it strips internal style elements from separately fetched SVG image bytes. Browser image restrictions and server delivery are distinct. No inspected source establishes the complete current production SVG sanitation policy, so do not invent one.

E10. Tier 3, upstream Camo source, https://github.com/atmos/camo/blob/master/server.coffee, inspected read-only 2026-10-23: image response content-type handling is visible. This repository is not proof of every detail of GitHub's current production proxy. A mistaken github/camo URL returned 404; the upstream linked by GitHub docs is atmos/camo.

E11. Tier 3, machine inventory 2026-10-23: /home/ivan/.local/bin/blepsis resolves to /home/ivan/Work/infra/blepsis/blepsis; blepsis --help exposes managed headless render_html/capture_creative, screenshots, viewport setting and reduced-motion emulation. /usr/bin/chromium exists. No browser was launched here. Existing tools can support inspection without adding a docs build system.

E12. Tier 3, repository dependency inventory 2026-10-23: node_modules/playwright-core exists locally, but package.json inspected this session does not declare Playwright. Availability in today's node_modules is not a reproducible project dependency. If a new automated Playwright check is chosen, follow the standing design's consumer dev-dependency requirement. Prefer existing appropriate tooling for a bounded visual inspection over adding a maintained screenshot suite solely for this rewrite.

### Pitfalls and removal steps

R9. HTTP success or a downloaded SVG is mistaken for a rendered animation. Inspect the actual GitHub Markdown page and image embedding with timed visual evidence.

R10. Local emulation is labeled GitHub validation. Keep the result's scope explicit. Single-browser headless evidence also does not prove every browser or theme.

R11. Temporary probe becomes permanent product/tooling. Keep sample/evidence in chart scratch or the designated evidence store, remove the remote branch after capture and add no generator or scheduled action.

### Missing question

Q4a. Will the operator authorize the bounded branch probe, or explicitly accept local/practitioner evidence with its remaining GitHub uncertainty? A must present that choice rather than leaving an unowned post-merge check.

## Locks and confidence

Implementation A remains claude, claude-opus-5-5, medium. No GitHub write permission is inferred. High confidence in the documented browser primitives and inspected practitioner techniques. Current GitHub treatment of the proposed final asset remains unmeasured until the probe; practitioner examples are not an end-to-end validation of our own SVG.
