#! ./venv/bin/python3

from flask import Flask, redirect, send_from_directory

# We create a flask server
app = Flask(__name__)

import recognition.catRoutes
import recognition.registeringRoutes
import recognition.recognizeRoutes


# Web app

@app.route("/")
def index():
    return redirect("/config/index.html")

@app.route("/config/<path:path>")
def webApp(path):
    return send_from_directory("static", path)


# Server
app.run(host="0.0.0.0", port=5000)
