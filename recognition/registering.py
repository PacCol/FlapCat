import os, shutil, time

import cv2

from threading import Thread

import recognition.training as training
import recognition.recognize as recognize

import config


# We create some global vars to communicate between threads
state = "not-registering"
# The value can be: "not-registering" or "-%"
stopRequested = False


# We create a function to register a new cat
def startRegistering(catName, imgNbr):

    catName = "".join(char for char in catName if char.isalnum())
    
    if catName == "" or len(catName) > 10:
        return "name-error"

    if recognize.getState() == "recognizing":
        return "recognizing"

    global state

    if state == "not-registering":
        state = "0%"
        registerThread = Thread(target=record, args=(catName, imgNbr))
        registerThread.start()
        return "started"
        
    else:
        stopRegistering()
        success = startRegistering(catName, imgNbr)
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
def record(catName, imgNbr):

    global state

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

    if config.testWithHumans:
        detector = cv2.CascadeClassifier("recognition/haarcascade/haarcascade_frontalface_alt2.xml")
    else:
        detector = cv2.CascadeClassifier("recognition/haarcascade/haarcascade_frontalcatface_extended.xml")

    # We init the image counter
    imgCounter = 0

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
            x = faces[0][0]
            y = faces[0][1]
            w = faces[0][2]
            h = faces[0][3]
            imgName = (
                "recognition/dataset/"
                + catName
                + "/image_{}.jpg".format(imgCounter)
            )
            cv2.imwrite(imgName, frame[y:y+h,x:x+w])
            imgCounter += 1
            state = str(int(imgCounter * 100 / imgNbr)) + "%"

    # We stop the cam
    cam.release()

    state = "not-registering"

    training.needToReload()