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
    catName = request.form["name"]
    newName = request.form["newName"]
    success = cat.renameCat(catName, newName)
    return success

@app.route("/api/cat/permissions", methods=["POST"])
@tokenRequired
def authorize(currentUser):
    catName = request.form["name"]
    authorized = request.form["authorized"]
    success = cat.authorizeCat(catName, authorized)
    return success

@app.route("/api/cat/delete", methods=["POST"])
@tokenRequired
def delete(currentUser):
    catName = request.form["name"]
    success = cat.deleteCat(catName)
    return success