import os
import shutil
import threading

import cv2
import face_recognition
from imutils import paths
import pickle


class register(threading.Thread):

    def __init__(self, catName, photosNbr):
        super().__init__(self)
        self.catName = catName
        self.photosNbr = photosNbr

    def run(self):

        if os.path.isdir("dataset/" + self.catName):
            shutil.rmtree("dataset/" + self.catName)

        os.mkdir("dataset/" + self.catName)

        ###############################################################
        ### RECORDING #################################################
        ###############################################################

        cam = cv2.VideoCapture(0)

        detector = cv2.CascadeClassifier("haarcascade/haarcascade_frontalface_default.xml")

        imgCounter = 0

        while imgCounter < self.photosNbr:

            ret, frame = cam.read()

            if not ret:
                print("Error: Camera error")
                break

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = detector.detectMultiScale(gray, 1.3, 5)

            if len(faces) != 0:
                imgName = "dataset/" + name + "/image_{}.jpg".format(imgCounter)
                cv2.imwrite(imgName, frame)
                imgCounter += 1

        cam.release()

        ###############################################################
        ### TRAINING ##################################################
        ###############################################################

        imagePaths = list(paths.list_images("dataset"))

        knownEncodings = []
        knownNames = []

        for (i, imagePath) in enumerate(imagePaths):

            name = imagePath.split(os.path.sep)[-2]

            image = cv2.imread(imagePath)
            rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

            boxes = face_recognition.face_locations(rgb,
                                            model="hog")

            encodings = face_recognition.face_encodings(rgb, boxes)

            for encoding in encodings:
                knownEncodings.append(encoding)
                knownNames.append(name)

        data = {"encodings": knownEncodings, "names": knownNames}
        f = open("encodings.pickle", "wb")
        f.write(pickle.dumps(data))
        f.close()