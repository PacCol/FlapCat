import os

from threading import Thread

import cv2
import face_recognition
from imutils import paths
import pickle

# We create some global vars to communicate between threads
state = "not-training"
# The value can be: "not-training" or "training"
needReload = False
stopRequested = False

def needToReload():
    global needReload
    needReload = True

# We create a function to train our model
def trainModel():

    global state
    state = "training"

    imagePaths = list(paths.list_images("recognition/dataset"))

    knownEncodings = []
    knownNames = []

    # For each image, we analyze the face on it
    for (i, imagePath) in enumerate(imagePaths):

        name = imagePath.split(os.path.sep)[-2]

        image = cv2.imread(imagePath)
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        boxes = face_recognition.face_locations(rgb, model="hog")

        encodings = face_recognition.face_encodings(rgb, boxes)

        for encoding in encodings:
            knownEncodings.append(encoding)
            knownNames.append(name)

    data = {"encodings": knownEncodings, "names": knownNames}

    # We save the data in a file
    f = open("recognition/encodings.pickle", "wb")
    f.write(pickle.dumps(data))
    f.close()

    state = "not-training"