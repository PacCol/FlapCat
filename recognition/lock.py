import os, time

def beep():
    os.system('play -q -n synth 0.5 sin 500 || echo -e "\a"')

def unlock():
    print("======================= DOOR OPENED ================================")
    beep()
    print("======================= DOOR CLOSED ================================")