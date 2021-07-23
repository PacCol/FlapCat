from flask import request

from __main__ import app
from login import tokenRequired

import recognition.registering as registering


@app.route("/api/register/start", methods=["POST"])
@tokenRequired
def register(currentUser):
    catName = request.json["name"]
    success = registering.startRegistering(catName, 20)
    return success


@app.route("/api/register/stop", methods=["POST"])
@tokenRequired
def interruptRegistering(currentUser):
    success = registering.stopRegistering()
    return success


@app.route("/api/register/state", methods=["GET"])
def getRegisteringState():
    state = registering.getState()
    return state
