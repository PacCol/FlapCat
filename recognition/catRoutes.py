from flask import jsonify, request

from __main__ import app

import recognition.cat as cat

@app.route("/api/cat/list", methods=["GET"])
def list():
    list = cat.listCats()
    return jsonify(list)

@app.route("/api/cat/exist", methods=["GET"])
def exist():
    catName = request.headers.get("name")
    exist = cat.isRegistered(catName)
    if exist:
        return "true"
    else:
        return "false"

@app.route("/api/cat/rename", methods=["POST"])
def rename():
    catName = request.form["name"]
    newName = request.form["newName"]
    success = cat.renameCat(catName, newName)
    return success

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