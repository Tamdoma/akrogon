# shot.sh <name>: fresh frame of the test window into live/<name>.png
L=$(dirname "$0"); HERDR_APP_HOME=$HOME/.config/herdr-app-sessions/right-panel-1 HC_SESSION=right-panel-1 herdr-app shot "$L/$1.png" >/dev/null && echo "$L/$1.png"
