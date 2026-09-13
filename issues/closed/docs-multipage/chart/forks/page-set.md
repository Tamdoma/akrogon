# What pages exist and what happens to guide.html?

## Question
Confirm the file set (index.html plus one file per requested concept plus in-practice.html), that the existing "A working day" and "Use cases" sections fold into "in practice", and whether guide.html is deleted or kept as a redirect to index.html.

### Carries
Reporter page list: the idea, moving parts, state file, install, repo setup, creating work, how next picks work, phases, where files live, merge and broadcast, limits, troubleshooting, leftovers, cheat sheet, plus in practice and index.

## Findings
- Existing section ids already match the list. Reusing them as file names keeps anchors stable: idea, parts, state, install, setup, create, next, phases, files, merge, limits, problems, learn, cheat.
- Nothing in the repo links to guide.html (checked src, skills, plugin, REFERENCE.md).

## Taken
Operator answer (2026-09-11): `4-A`. Files: `index.html`, `in-practice.html`, and one page per section id: idea, parts, state, install, setup, create, next, phases, files, merge, limits, problems, learn, cheat. The existing "A working day" and "Use cases" sections fold into in-practice. `guide.html` is deleted. Reason: nothing in the repo links to guide.html and section ids keep anchors stable. Foreclosed: keeping guide.html as a redirect.

