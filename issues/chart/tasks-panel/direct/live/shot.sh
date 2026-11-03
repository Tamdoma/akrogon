# shot.sh <name>: fresh frame of the test window into live/<name>.png
L=$(dirname "$0"); HERDR_APP_HOME=$HOME/.config/herdr-app-sessions/tasks-look HC_SESSION=tasks-look herdr-app shot "$L/$1.png" >/dev/null && echo "$L/$1.png"
