# Grant G1 cleanup read-back: the four launched agent terminals t3-t6 are not live in right-panel-1.
export HERDR_APP_HOME=$HOME/.config/herdr-app-sessions/right-panel-1 HC_SESSION=right-panel-1; unset HC_TERMINAL_SOCKET HC_TERMINAL_ID HC_SCOPE
hc ls --json | jq -c '{session: "right-panel-1", live: [.terminals[] | {address, agent, state}]}'
hc ls --all --json | jq -c '[.terminals[] | select(.address == "t3" or .address == "t4" or .address == "t5" or .address == "t6") | {address, agent, state}]'
hc ls --json | jq -e '[.terminals[] | select(.address == "t3" or .address == "t4" or .address == "t5" or .address == "t6")] | length == 0' >/dev/null && echo "t3-t6 absent from live terminals"
