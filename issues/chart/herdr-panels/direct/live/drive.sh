# drive.sh <op> <view> : set panel.request through the session-only driver, then print layout state
set -eu
L=$(dirname "$0"); S=$HOME/.config/herdr-app-sessions/right-panel-1
export HERDR_APP_HOME=$S HC_SESSION=right-panel-1; unset HC_TERMINAL_SOCKET HC_TERMINAL_ID HC_SCOPE
printf '{"key":"panel.request","value":{"op":"%s","view":"%s","seq":%s}}' "$1" "$2" "$(date +%s%3N)" > "$L/request.json"
herdr-app do mod.open --name driver >/dev/null
sleep 1.5
sh "$L/state.sh"
