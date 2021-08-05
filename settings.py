import os, time

from threading import Thread

from flask import request, jsonify

from __main__ import app
from db import db

from login import tokenRequired

import recognition.recognize as recognize


# We create a class settings
class Settings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    imgNbr = db.Column(db.Integer)
    fiability = db.Column(db.Integer)
    minFiability = db.Column(db.Integer)


def initSettings():
    if Settings.query.count() == 0:
        settings = Settings(
            imgNbr = 50,
            fiability = 1,
            minFiability = 50
        )
        db.session.add(settings)
        db.session.commit()


def getSettings():
    settings = Settings.query.one()
    output = {
        "imgNbr": settings.imgNbr,
        "fiability": settings.fiability,
        "minFiability": settings.minFiability
    }
    return output


@app.route("/api/settings/list", methods=["GET"])
def getJsonSettings():

    settings = Settings.query.one()
    output = {
        "imgNbr": settings.imgNbr,
        "fiability": settings.fiability,
        "minFiability": settings.minFiability
    }
    return jsonify(output)


@app.route("/api/settings/update", methods=["POST"])
@tokenRequired
def updateSettings(currentUser):

    if currentUser.email != "admin":
        return "not-permitted"

    if recognize.getState() == "recognizing":
        return "recognizing"

    if not request.json or not request.json["imgNbr"] or not request.json["fiability"] or not request.json["minFiability"]:
        return "required"
    
    settings = Settings.query.one()

    settings.imgNbr = request.json["imgNbr"]
    settings.fiability = request.json["fiability"]
    settings.minFiability = request.json["minFiability"]

    db.session.commit()
    return "updated"


@app.route("/api/settings/reset", methods=["POST"])
@tokenRequired
def resetSettings(currentUser):

    if currentUser.email != "admin":
        return "not-permitted"

    if recognize.getState() == "recognizing":
        return "recognizing"

    settings = Settings.query.one()

    settings.imgNbr = 50
    settings.fiability = 1
    settings.minFiability = 50

    db.session.commit()
    return "reseted"


@app.route("/api/settings/shutdown", methods=["POST"])
@tokenRequired
def shutdown(currentUser):
    
    if currentUser.email != "admin":
        return "not-permitted"

    shutdownThread = Thread(target=shutdownAfterDelay, args=())
    shutdownThread.start()

    return "shutting-down"


def shutdownAfterDelay():
    time.sleep(3)
    os.system("poweroff")