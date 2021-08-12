from __main__ import app

app.config["SECRET_KEY"] = "chat"
app.config["PORT"] = 5000

raspberryPi = False

# For detection
haarcascade = "recognition/haarcascade/haarcascade_frontalcatface_extended.xml"

openingDelay = 30