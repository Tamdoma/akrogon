# Left click through a short-lived uinput pointer, at the position Hyprland's cursor is moved to.
# Usage: python3 -I input.py click X Y   (X Y in Hyprland layout coordinates); the pointer returns after.
import fcntl, os, struct, subprocess, sys, time
UI_SET_EVBIT, UI_SET_KEYBIT, UI_SET_RELBIT = 0x40045564, 0x40045565, 0x40045566
UI_DEV_SETUP, UI_DEV_CREATE, UI_DEV_DESTROY = 0x405C5503, 0x5501, 0x5502
EV_SYN, EV_KEY, EV_REL, BTN_LEFT = 0, 1, 2, 0x110
def emit(fd, t, c, v):
    os.write(fd, struct.pack("llHHi", 0, 0, t, c, v))
def move(x, y):
    r = subprocess.run(["hyprctl", "eval", f"hl.dispatch(hl.dsp.cursor.move({{ x = {x}, y = {y} }}))"], capture_output=True, text=True)
    if r.returncode != 0 or "error" in r.stdout.lower(): raise RuntimeError(f"cursor move failed: {r.stdout} {r.stderr}")
x, y = int(sys.argv[2]), int(sys.argv[3])
home = subprocess.run(["hyprctl", "cursorpos"], capture_output=True, text=True, check=True).stdout.strip().split(", ")
fd = os.open("/dev/uinput", os.O_WRONLY | os.O_NONBLOCK)
fcntl.ioctl(fd, UI_SET_EVBIT, EV_KEY); fcntl.ioctl(fd, UI_SET_KEYBIT, BTN_LEFT)
fcntl.ioctl(fd, UI_SET_EVBIT, EV_REL); fcntl.ioctl(fd, UI_SET_RELBIT, 0); fcntl.ioctl(fd, UI_SET_RELBIT, 1)
fcntl.ioctl(fd, UI_DEV_SETUP, struct.pack("HHHH80sI", 3, 0x1234, 0x5678, 1, b"herdr-check-pointer", 0))
fcntl.ioctl(fd, UI_DEV_CREATE)
time.sleep(0.6)
try:
    move(x, y); time.sleep(0.15)
    emit(fd, EV_KEY, BTN_LEFT, 1); emit(fd, EV_SYN, 0, 0); time.sleep(0.05)
    emit(fd, EV_KEY, BTN_LEFT, 0); emit(fd, EV_SYN, 0, 0); time.sleep(0.2)
finally:
    move(int(home[0]), int(home[1]))  # the operator's pointer goes back at once
    fcntl.ioctl(fd, UI_DEV_DESTROY); os.close(fd)
