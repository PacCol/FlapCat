import os
import shutil, time

from threading import Thread

import cv2
import face_recognition
from imutils import paths
import pickle


# We create some global vars to communicate between threads
state = "not-registering"
# The value can be: "not-registering", "before-registering", "-%" or "processing"
stopRequested = False


# We create a function to register a new cat
def startRegistering(catName, imgNbr):
    global state
    if state == "not-registering":
        state = "before-registering"
        registerThread = Thread(target=register, args=(catName, imgNbr))
        registerThread.start()
    else:
        return("already-registering")

# We create a function to register a new cat
def register(catName, imgNbr):
    record(catName, imgNbr)
    trainModel()

# We create a function to interrupt the registering process
def stopRegistering():
    global state
    global stopRequested
    stopRequested = True
    while True:
        time.sleep(0.2)
        if state == "not-registering":
            break

# We create a function to get the current state
def getState():
    global state
    return state


# We create a fuction to record a cat
def record(catName, imgNbr):

    # We init the image counter
    imgCounter = 0
    global state
    state = "0%"

    global stopRequested
    stopRequested = False

    # We create a folder for the cat
    if os.path.isdir("recognition/dataset/" + catName):
        shutil.rmtree("recognition/dataset/" + catName)

    os.mkdir("recognition/dataset/" + catName)

    # By default the cat is authorized
    f = open("recognition/dataset/" + catName + "/authorized.txt", "w")
    f.write("true")
    f.close()

    # We init the cam and the face detector
    cam = cv2.VideoCapture(0)
    detector = cv2.CascadeClassifier("recognition/haarcascade/haarcascade_frontalface_default.xml")

    # We want to take as many shots as requested
    while imgCounter < imgNbr:

        # If we want to stop, we exit the function
        if stopRequested:
            cam.release()
            shutil.rmtree("recognition/dataset/" + catName)
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
        if len(faces) != 0:
            imgName = (
                "recognition/dataset/"
                + catName
                + "/image_{}.jpg".format(imgCounter)
            )
            cv2.imwrite(imgName, frame)
            imgCounter += 1
            state = str(int(imgCounter * 100 / imgNbr)) + "%"

    # We stop the cam
    cam.release()


# We create a function to train our model
def trainModel():

    global state
    state = "processing"

    time.sleep(5)

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

    state = "not-registering"