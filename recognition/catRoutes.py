from flask import jsonify, request

from __main__ import app
from login import tokenRequired

import recognition.cat as cat


@app.route("/api/cat/list", methods=["GET"])
def list():
    list = cat.listCats()
    return jsonify(list)


@app.route("/api/cat/rename", methods=["POST"])
@tokenRequired
def rename(currentUser):
    id = request.form["id"]
    newName = request.form["newName"]
    success = cat.renameCat(id, newName)
    return success


@app.route("/api/cat/permissions", methods=["POST"])
@tokenRequired
def authorize(currentUser):
    id = request.form["id"]
    authorized = request.form["authorized"]

    if authorized == "true":
        authorized = True
    else:
        authorized = False

    success = cat.authorizeCat(id, authorized)
    return success


@app.route("/api/cat/delete", methods=["POST"])
@tokenRequired
def delete(currentUser):
    id = request.form["id"]
    success = cat.deleteCat(id)
    return success
