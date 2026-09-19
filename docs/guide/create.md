# Create

Four doors in, from most to least planning. All four are things you do in your own agent session, with you present. The loop never decides what to build — and thank goodness, because it would pick the most entertaining thing, not the most useful.

## Which door for what

You have a goal but the route is unclear and will take many sessions: use /chart-issues. You get a chart of forks you take one by one. It ends by writing leaves with blocked-by wired between them. That's [Chart](chart.md), next page.

You have one clear thing to build: still use /chart-issues. Same door. A small item whose map finds no fog writes the same chart structure and goes straight to handoff: brief.md, design.md, state.yaml. It doesn't skip the structure, it just doesn't linger. Our export-csv is exactly this — small, clear, straight through.

You have one observation — X happened, Y should have: use /seed-issue. You get a GitHub issue in the right repo. No planning, no diagnosis. Give it the exact command, error line, and what you expected, and it keeps all of it. I file seeds constantly. Half my best leaves started as annoyed one-liners.

You have open GitHub issues: run akrogon pull. You get one file per issue in issues/seeds/. It runs at every Herdr start. /chart-issues imports the seeds at open. When the leaf merges, the GitHub issue is closed with the commit.

Why decide before agents start? A choice made during planning gets re-argued in every later phase. A choice written in the brief is settled. Agents build faster when there's nothing left to argue about. I've watched a leaf burn two fix rounds re-litigating something the brief could have settled in one line. Write it down.

## Or just write the files

Prerequisites: repo set up, you know the slug. Which directory you're in: the registered checkout for widgets, on main. Not the worktree. Issue files only live in the checkout.

The minimum is a brief.md saying what and why, and a state.yaml. Commit them in the registered checkout and push. Here is export-csv, the running example we will carry all the way to merged:

    mkdir -p issues/open/export-csv/export-csv
    cat > issues/open/export-csv/export-csv/brief.md <<'EOF'
    # Export CSV

    Add widgets export --format csv that prints id,name,price rows to stdout.
    Reads the local store, no network. Header row plus one line per widget.

    Done when: widgets export --format csv prints a header and correct rows, widgets export --format json still works, tests cover both.
    EOF
    cat > issues/open/export-csv/export-csv/state.yaml <<'EOF'
    slug: export-csv
    phase: plan.synthesis
    created: 2026-09-11
    repo: widgets
    debate: "no"
    blocked-by: []
    EOF
    akrogon sync

Note the nesting: issues/open/export-csv/export-csv/. Issue folder holding a leaf folder. Depth two. A single-level issues/open/export-csv/state.yaml gets refused — the tool wants the issue folder so you can add a second leaf later without moving. I know, it looks redundant for one leaf. It pays off on leaf two.

What you should see: sync prints nothing on success, or sync issues commit plus rebase and push lines. Then akrogon status shows export-csv at plan.synthesis, no blockers.

What to do when it fails: if sync refuses with staged paths outside eligible records, you have unrelated files staged — unstage them, sync only takes issues/ minus seeds, locks, and worktrees. If status says missing leaf or repo mismatch, check slug spelling and that repo: widgets matches the registration key exactly.

## Ordering with blocked-by

If leaf api must land before leaf ui, put blocked-by: [api] in the ui state. That's the whole ordering system. Leaves with no blockers start whenever there's capacity, in parallel. When a leaf merges, the leaves that named it become free on the next next. The list itself is never edited by the tool — you edit it, the chart handoff writes it for you when you go through the chart.

For export-csv we start with an empty list. Later, if export-json must wait for it, you would put blocked-by: [export-csv] in export-json's state. One line. Done.

Previous: [Setup](setup.md) · Next: [Chart](chart.md) · [Home](../../README.md)
