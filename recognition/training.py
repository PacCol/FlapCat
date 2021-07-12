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


# We create a function to reload the model after edit
def needToReload():
    global state

    stopTraining()

    while True:
        if state == "not-training":
            state = "training"

            trainingThread = Thread(target=trainModel, args=())
            trainingThread.start()

            return

        time.sleep(0.1)


# We create a function to get the current state
def getState():
    global state
    return state


# We create a function to train our model
def trainModel():

    global state

    detector = cv2.CascadeClassifier(config.haarcascade)
    recognizer = cv2.face.LBPHFaceRecognizer_create()

    imagePaths = list(paths.list_images("recognition/dataset"))

    if len(imagePaths) != 0:

        catFaces = []
        ids = []

        for imagePath in imagePaths:

            PIL_img = Image.open(imagePath).convert("L")
            img_numpy = np.array(PIL_img, "uint8")
            id = int(imagePath.split(os.path.sep)[-2])
            faces = detector.detectMultiScale(img_numpy)

            for (x, y, w, h) in faces:
                catFaces.append(img_numpy[y:y+h, x:x+w])
                ids.append(id)

        recognizer.train(catFaces, np.array(ids))
        recognizer.save("recognition/trainer.yaml")

    else:
        os.remove("recognition/trainer.yaml")

    state = "not-training"


def stopTraining():
    global state
    if state == "training":
        trainingThread.join()
        state = "not-training"


trainingThread = Thread(target=trainModel, args=())
