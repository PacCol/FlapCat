import os
import re
import time

from threading import Thread

import cv2

import recognition.cat as cat
import recognition.registering as registering
import recognition.training as training
import recognition.analytics as analytics
import recognition.lock as lock

import config


# We use some global vars to communicate between threads
state = "not-recognizing"
stopRequested = False


# We create a function to enable the face recognition
def enableRecognition():

    global state

    if registering.getState() != "not-registering":
        registering.stopRegistering()

    if state == "recognizing":
        return "already-started"

    if training.getState() == "training":
        return "training"

    if not os.path.isfile("recognition/trainer.yaml"):
        return "no-cat-recorded"

    state = "recognizing"
    recognitionThread = Thread(target=recognize, args=())
    recognitionThread.start()
    return "started"


# We create a function to disable the face recognition
def disableRecogition():

    global state
    global stopRequested
    stopRequested = True

    while True:
        if state == "not-recognizing":
            return "stoped"
        time.sleep(0.2)


# We create a function to get the current state
def getState():

    global state
    return state


# We create a function to use the face recogition
def recognize():

    global state

    global stopRequested
    stopRequested = False

    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.read("recognition/trainer.yaml")

    # We init the cam and the face detector
    cam = cv2.VideoCapture(0)
    detector = cv2.CascadeClassifier(config.haarcascade)

    while True:

        # If we want to stop, we exit the function
        if stopRequested:
            cam.release()
            state = "not-recognizing"
            return

        # We take a picture and check the cam state
        ret, frame = cam.read()

        if not ret:
            print("Error: Camera error")
            break

        # We search faces in the picture
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = detector.detectMultiScale(gray, 1.3, 5)

        # For each face that the detector find
        for(x, y, w, h) in faces:

            # We recognize the face and get the id
            result = recognizer.predict(gray[y:y+h, x:x+w])

            if result[1] < config.minFiability:
                id = result[0]

                recognizedCat = cat.Cat.query\
                    .filter_by(id=id)\
                    .first()

                print(recognizedCat.authorized)

                if recognizedCat.authorized:

                    print(recognizedCat.name +
                          " (fiability: " + str(result[1]) + ")")
