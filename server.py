from flask import Flask, redirect, send_from_directory, jsonify, request

import recognition.registering as registering
import recognition.cat as cat

import beforeStart
beforeStart.fix()

# We create a flask server
app = Flask(__name__)


# Web app

@app.route("/")
def index():
    return redirect("/config/index.html")


@app.route("/config/<path:path>")
def webApp(path):
    return send_from_directory("static", path)


# Registering

@app.route("/api/register/start", methods=["POST"])
def register():

    catName = request.form["name"]

    if len(catName) > 10:
        return "name-error"

    catName = "".join(char for char in catName if char.isalnum())

    success = registering.startRegistering(catName, 100)
    return success


@app.route("/api/register/stop", methods=["POST"])
def interruptRegistering():

    success = registering.stopRegistering()

    if success == "already-registering":
        return success
    else:
        return "started"


@app.route("/api/register/state", methods=["GET"])
def getState():
    state = registering.getState()
    return state


@app.route("/api/cat/list", methods=["GET"])
def list():
    list = cat.listCats()
    return jsonify(list)

@app.route("/api/cat/permissions", methods=["POST"])
def authorize():
    catName = request.form["name"]
    authorized = request.form["authorized"]
    success = cat.authorizeCat(catName, authorized)
    return success

@app.route("/api/cat/delete", methods=["POST"])
def delete():
    catName = request.form["name"]
    success = cat.deleteCat(catName)
    return success


# Server
app.run(host="0.0.0.0", port=80)
