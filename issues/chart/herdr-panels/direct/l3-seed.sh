set -eu
t=$(mktemp -d)
mkdir -p $t/.config/herdr-app $t/.config/herdr-app-sessions/one/ $t/.config/herdr-app-sessions/two
echo '{"layout":"flat","workspace.panels":["files","changes"]}' > $t/.config/herdr-app/shared.json
echo '{"workspace.panels":["changes"]}' > $t/.config/herdr-app-sessions/one/shared.json
HOME=$t XDG_RUNTIME_DIR=$t/run /home/ivan/.akrogon/worktrees/herdr-setup/right-panel/bin/herdrapp session seed
for f in $t/.config/herdr-app/shared.json $t/.config/herdr-app-sessions/*/shared.json; do echo "$f: $(jq -c '."workspace.panels"' $f)"; done
rm -rf $t
