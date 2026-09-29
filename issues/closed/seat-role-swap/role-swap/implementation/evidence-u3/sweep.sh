#!/bin/sh
cd /home/ivan/Work/infra/akrogon/issues/worktrees/role-swap-u3
rg -n 'slot=[AB]|--slot [AB]|review-[AB]\.md|[Ss]eat [AB]|[Ss]lot [AB]|\bAs [AB]\b|\b[AB] (merges|implements|reviews|re-?checks|synthesi)' docs/guide/idea.md docs/guide/phases.md docs/guide/merge.md docs/guide/cheat.md docs/guide/install.md docs/guide/parts.md README.md src/AREA.md
echo "sweep_exit=$?"
