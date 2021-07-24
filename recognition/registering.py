import os
import shutil
import time

import cv2

from threading import Thread

import recognition.training as training
import recognition.recognize as recognize

import config
from db import db


# We create some global vars to communicate between threads
state = "not-registering"
# The value can be: "not-registering" or "-%"
stopRequested = False


# We create a function to register a new cat
def startRegistering(catName):

    from recognition.cat import Cat

    catName = "".join(char for char in catName if char.isalnum())

    if catName == "" or len(catName) > 10:
        return "name-error"

    if recognize.getState() == "recognizing":
        return "recognizing"

    global state

    if state == "not-registering":
        state = "0%"

        # We check if the name is already used
        cat = Cat.query\
            .filter_by(name=catName)\
            .first()

        if cat:
            return "already-used"

        # We insert the cat in the database
        cat = Cat(
            name=catName,
            authorized=True
        )

        db.session.add(cat)
        db.session.commit()

        id = cat.id

        # We create a folder for the cat
        if os.path.isdir("recognition/dataset/" + str(id)):
            shutil.rmtree("recognition/dataset/" + str(id))

        os.mkdir("recognition/dataset/" + str(id))

        registerThread = Thread(target=record, args=(cat.id, config.imgNbr))
        registerThread.start()
        return "started"

    else:
        stopRegistering()
        success = startRegistering(catName, config.imgNbr)
        return success


# We create a function to interrupt the registering process
def stopRegistering():

    global state
    global stopRequested
    stopRequested = True

    while True:
        if state == "not-registering":
            return "stoped"
        time.sleep(0.2)


# We create a function to get the current state
def getState():

    global state
    return state


# We create a fuction to record a cat
def record(id, imgNbr):

    from recognition.cat import Cat

    global state

    global stopRequested
    stopRequested = False

    # We init the cam and the face detector
    cam = cv2.VideoCapture(0)
    detector = cv2.CascadeClassifier(config.haarcascade)

    # We init the image counter
    imgCounter = 0

    # We want to take as many shots as requested
    while imgCounter < imgNbr:

        # If we want to stop, we exit the function
        if stopRequested:

            cam.release()

            shutil.rmtree("recognition/dataset/" + str(id))

            cat = Cat.query\
                .filter_by(id=id)\
                .first()

            db.session.delete(cat)
            db.session.commit()

            state = "not-registering"
            return

        # We take a picture and check the cam state
        ret, frame = cam.read()

        if not ret:
            print("Error: Camera error")
            break

        # We search faces in the picture
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = detector.detectMultiScale(gray, 1.3, 5)

        # If we find a face, we take a picture
        for (x, y, w, h) in faces:
            imgName = (
                "recognition/dataset/"
                + str(id)
                + "/image_{}.jpg".format(imgCounter)
            )
            cv2.imwrite(imgName, gray[y:y+h, x:x+w])
            imgCounter += 1
            state = str(int(imgCounter * 100 / imgNbr)) + "%"

    # We stop the cam
    cam.release()

    state = "not-registering"

    training.needToReload()
