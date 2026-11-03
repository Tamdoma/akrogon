# PT 4 saved-open case: Tasks open, its mod removed, window reloaded; then what clears the error.
set -u
L=$(dirname "$0"); S=$HOME/.config/herdr-app-sessions/right-panel-1
export HERDR_APP_HOME=$S HC_SESSION=right-panel-1; unset HC_TERMINAL_SOCKET HC_TERMINAL_ID HC_SCOPE
sw() { herdr-app do layout.switch --name board >/dev/null; sleep 1; herdr-app do layout.switch --name flat >/dev/null; sleep 2; }
nodes() { python3 -c 'import json,sys; print(json.dumps(json.load(open(sys.argv[1])).get("nodes")))' "$S/layouts/.state/flat.json"; }
ln -sfn "$HOME/.config/herdr-app/mods/tasks" "$S/mods/tasks"; sw
sh "$L/drive.sh" open tasks >/dev/null; echo "1 tasks open: $(nodes)"
rm "$S/mods/tasks"; sw
echo "2 reload with tasks absent: $(nodes)"; herdr-app status | jq -c '{errors}'
herdr-app do layout.select --stack panel-body --child files >/dev/null; sleep 1
echo "3 after selecting another view:"; herdr-app status | jq -c '{errors}'
sw; echo "4 after the next reload:"; herdr-app status | jq -c '{errors}'
ln -sfn "$HOME/.config/herdr-app/mods/tasks" "$S/mods/tasks"; sw; echo "5 tasks link restored"; herdr-app status | jq -c '{errors}'
