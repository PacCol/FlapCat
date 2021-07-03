from os import stat_result
from flask import request

from __main__ import app
from login.login import tokenRequired

import recognition.recognize as recognize

@app.route("/api/recognize/start", methods=["POST"])
@tokenRequired
def startRecognition(currentUser):
    success = recognize.enableRecognition()
    return success

@app.route("/api/recognize/stop", methods=["POST"])
@tokenRequired
def stopRecognition(currentUser):
    success = recognize.disableRecogition()
    return success

@app.route("/api/recognize/state", methods=["GET"])
def getRecognitionState():
    state = recognize.getState()
    return state