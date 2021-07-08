import os, time, datetime

def beep():
    os.system('play -q -n synth 0.5 sin 500 || echo -e "\a"')

def unlock(delay):
    print("======================= DOOR OPENED ================================")
    beep()
    time.sleep(delay)
    print("======================= DOOR CLOSED ================================")