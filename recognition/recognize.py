import time

from threading import Thread

from imutils.video import VideoStream
import face_recognition
import imutils
import pickle
import cv2

import recognition.cat as cat
import recognition.registering as registering
import recognition.training as training
import recognition.analytics as analytics
import recognition.lock as lock


# We use some global vars to communicate between threads
state = "not-recognizing"
stopRequested = False
# We use a global var to store the model and the authorizations
model = ""
catList = []


# We create a function to enable the face recognition
def enableRecognition():

    global state

    if registering.getState() != "not-registering":
        registering.stopRegistering()

    if state == "recognizing":
        return "already-started"

    if training.getState() == "not-training":
        state = "recognizing"
        recognitionThread = Thread(target=recognize, args=())
        recognitionThread.start()
        return "started"

    else:
        return "training"

# We create a function to disable the face recognition
def disableRecogition():

    global state
    global stopRequested
    stopRequested = True

    while True:
        if state == "not-recognizing":
            return "stoped"
        time.sleep(0.2)

# We use a function to reload the data
def reloadCats():

    # We load the model
    global model
    model = pickle.loads(open("recognition/encodings.pickle", "rb").read())

    # We reload the authorizations
    global catList
    catList = cat.listCats()

# We create a function to get the current state
def getState():

    global state
    return state


# We create a function to use the face recogition
def recognize():

    global state

    global stopRequested
    stopRequested = False

    reloadCats()

    # We init the face detector
    detector = cv2.CascadeClassifier("recognition/haarcascade/haarcascade_frontalface_default.xml")

    # We init the video stream
    cam = VideoStream(src=0).start()
    # For Raspberry Pi: cam = VideoStream(usePiCamera=True).start()
    time.sleep(2.0)

    # For each frame
    while True:

        # If we want to stop, we exit the function
        if stopRequested:
            cam.stop()
            state = "not-recognizing"
            return

        # We take a picture and resize it (faster)
        frame = cam.read()
        frame = imutils.resize(frame, width=500)

        # We use a grayscale image to detect the faces
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        # We use the colors to recognize a cat
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # We detect the faces
        rects = detector.detectMultiScale(gray, scaleFactor=1.1,
                                        minNeighbors=5, minSize=(30, 30),
                                        flags=cv2.CASCADE_SCALE_IMAGE)

        # We reorder the values
        boxes = [(y, x + w, y + h, x) for (x, y, w, h) in rects]

        # We use our model
        encodings = face_recognition.face_encodings(rgb, boxes)

        # For each face on the image
        for encoding in encodings:
            # We try to find a match
            matches = face_recognition.compare_faces(model["encodings"],encoding)

            # We set the default value
            name = "Unknown"

            # We check if we have found a match
            if True in matches:
                # We search the ids
                matchedIdxs = [i for (i, b) in enumerate(matches) if b]
                counts = {}

                # We take a vote for each face
                for i in matchedIdxs:
                    name = model["names"][i]
                    counts[name] = counts.get(name, 0) + 1

                # We chose the right name (with the vote)
                name = max(counts, key=counts.get)

                # If a cat in the dataset is identified, unlock the door
                if name != "Unknown":
                    # We check if the cat is authorized
                    for x in catList:
                        if name == x["name"] and x["authorized"]:
                            analytics.addEntry(name)
                            lock.unlock(2)