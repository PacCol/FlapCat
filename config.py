from __main__ import app

app.config["SECRET_KEY"] = "chat"
app.config["PORT"] = 5000

raspberryPi = False
haarcascade = "recognition/haarcascade/haarcascade_frontalface_alt2.xml"
minFiability = 50
