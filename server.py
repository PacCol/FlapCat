from flask import Flask, redirect, send_from_directory

app = Flask(__name__)

@app.route("/")
def index():
    return redirect("/config/index.html")

@app.route("/config/<path:path>")
def webApp(path):
    return send_from_directory("static", path)

if(__name__ == "__main__"):
    app.run(host="0.0.0.0", port=80)
