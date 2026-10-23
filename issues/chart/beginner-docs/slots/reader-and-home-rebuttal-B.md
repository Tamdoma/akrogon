# Rebuttal B — reader-and-home

- Replace “(b) rejected: no prepared-machine product exists (A,B)” with “Prepared-machine-only onboarding leaves readers without a setup path.” B did not establish that no prepared-machine product exists. Inspected src/install.ts and docs/guide/install.md establish prerequisites and setup behavior, not the absence of every prepared environment. Prepared machines remain a supported shortcut in the proposed reading path.

- Replace “wiki … outside review” with “wiki changes require coordination with a separate repository.” A wiki can be reviewed through a Git workflow. The concrete cost is that code and documentation cannot be committed together in the current repository, and local agents need another checkout or remote access. Evidence: GitHub's wiki editing documentation explicitly supports local cloning, branches and Git workflows: https://docs.github.com/en/communities/documenting-your-project-with-wikis/adding-or-editing-wiki-pages, read 2026-10-23.
