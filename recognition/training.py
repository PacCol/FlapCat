from PIL import Image
import numpy as np
import os
import time

from threading import Thread

import cv2
from imutils import paths

import config


# We create some global vars to communicate between threads
state = "not-training"
# The value can be: "not-training" or "training"
stopRequested = False


# We create a function to reload the model after edit
def needToReload():
    global state
    global stopRequested

    stopTraining()

    trainingThread = Thread(target=trainModel, args=())
    trainingThread.start()


# We create a function to get the current state
def getState():
    global state
    return state


# We create a function to train our model
def trainModel():

    global state
    global stopRequested

    stopRequested = False

    print("Start ============= training")

    detector = cv2.CascadeClassifier(config.haarcascade)
    recognizer = cv2.face.LBPHFaceRecognizer_create()

    imagePaths = list(paths.list_images("recognition/dataset"))

    if len(imagePaths) != 0:

        try:

            catFaces = []
            ids = []

            for imagePath in imagePaths:

                if stopRequested:
                    state = "not-training"
                    print("Stop ============= training")
                    return

                PIL_img = Image.open(imagePath).convert("L")
                img_numpy = np.array(PIL_img, "uint8")
                id = int(imagePath.split(os.path.sep)[-2])
                faces = detector.detectMultiScale(img_numpy)

                for (x, y, w, h) in faces:
                    catFaces.append(img_numpy[y:y+h, x:x+w])
                    ids.append(id)

            if stopRequested:
                state = "not-training"
                print("Stop ============= training")
                return

            recognizer.train(catFaces, np.array(ids))

            if stopRequested:
                state = "not-training"
                print("Stop ============= training")
                return

            recognizer.save("recognition/trainer.yaml")

        except:
            print("Stop ============= training")
            pass

    else:
        try:
            os.remove("recognition/trainer.yaml")
        except:
            pass

    state = "not-training"

    print("Stop ============= training")


def stopTraining():

    global state
    global stopRequested
    stopRequested = True

    while True:
        if state == "not-training":
            return "stoped"
        time.sleep(0.2)