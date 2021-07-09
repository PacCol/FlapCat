import os, time

from threading import Thread

import cv2
import face_recognition
from imutils import paths
import pickle


# We create some global vars to communicate between threads
state = "not-training"
# The value can be: "not-training" or "training"
stopRequested = False


# We create a function to reload the model after edit
def needToReload():
    print("needToReload")
    global state
    global stopRequested
    stopRequested = True
    while True:
        print("looping")
        if state == "not-training":
            print("stoped")
            stopRequested = False
            trainingThread = Thread(target=trainModel, args=())
            trainingThread.start()
            print("restarted")
            return
        time.sleep(0.2)

# We create a function to get the current state
def getState():
    global state
    return state


# We create a function to train our model
def trainModel():

    # We try to train the model
    # (The user can record a new cat, rename a cat, delete a cat...)
    try:

        global state
        state = "training"

        imagePaths = list(paths.list_images("recognition/dataset"))

        knownEncodings = []
        knownNames = []

        # For each image, we analyze the face on it
        for (i, imagePath) in enumerate(imagePaths):

            # If we want to stop, we exit the function
            print("testing")
            if stopRequested:
                print("exiting")
                state = "not-training"
                return

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
    
    except:
        needToReload()