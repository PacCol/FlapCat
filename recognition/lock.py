import os, time, datetime

from threading import Thread

import config


def beep():
    os.system('play -q -n synth 0.5 sin 500 || echo -e "\a"')


unlockDaemonRunning = False
openingDatetime = datetime.datetime.now()


def unlock():
    global openingDatetime
    openingDatetime = datetime.datetime.now()

    global unlockDaemonRunning

    if not unlockDaemonRunning:
        unlockDaemonThread = Thread(target=unlockDaemon, args=())
        unlockDaemonThread.start()
    

def unlockDaemon():

    print("======================= DOOR OPENED ================================")

    global unlockDaemonRunning
    unlockDaemonRunning = True

    global openingDatetime

    while True:
        closingDatetime = openingDatetime + datetime.timedelta(0, config.openingDelay)

        if datetime.datetime.now() > closingDatetime:
            print("======================= DOOR CLOSED ================================")
            unlockDaemonRunning = False
            return

        time.sleep(0.5)