# Issue: run-release

- [state-home](state-home/brief.md): machine state moves from the akrogon checkout to `~/.akrogon`, with an automatic one-time cutover
- [release-deploy](release-deploy/brief.md): the installed command runs a complete release of merged main behind `~/.akrogon/current`, deployed apart from the workspace checkout
- [release-rollback](release-rollback/brief.md): `akrogon rollback` returns to the previous release and holds the bad commit
