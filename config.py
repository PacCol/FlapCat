from __main__ import app

app.config["SECRET_KEY"] = "chat"
app.config["PORT"] = 5000

raspberryPi = False
testWithHumans = False