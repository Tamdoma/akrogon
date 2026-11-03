S=$HOME/.config/herdr-app-sessions/tasks-look
python3 - "$S/layouts/.state/flat.json" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
print(json.dumps(d)[:600])
PY
