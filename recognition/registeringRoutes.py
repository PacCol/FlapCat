from flask import request

from __main__ import app

import recognition.registering as registering

@app.route("/api/register/start", methods=["POST"])
def register():
    catName = request.form["name"]
    success = registering.startRegistering(catName, 100)
    return success


@app.route("/api/register/stop", methods=["POST"])
def interruptRegistering():
    success = registering.stopRegistering()
    return success


@app.route("/api/register/state", methods=["GET"])
def getRegisteringState():
    state = registering.getState()
    return state