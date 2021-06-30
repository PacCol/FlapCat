from flask import request

from __main__ import app

import recognition.recognize as recognize

@app.route("/api/recognize/start", methods=["POST"])
def startRecognition():
    success = recognize.enableRecognition()
    return success

@app.route("/api/recognize/stop", methods=["POST"])
def stopRecognition():
    success = recognize.disableRecogition()
    return success