from flask import Flask, redirect, send_from_directory, request

# We create a flask server
app = Flask(__name__)

import login.login

import recognition.catRoutes
import recognition.registeringRoutes
import recognition.recognizeRoutes


# Web app

@app.route("/")
def index():
    return redirect("/config/index.html")

@app.route("/config/<path:path>")
def webApp(path):
    if request.remote_addr == "127.0.0.1":
        return send_from_directory("static", path)
    else:
        return "<h1>Pas le droit</h1>"


# Server
app.run(debug=True, host="0.0.0.0", port=5000)
