from flask import request, jsonify
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

import jwt
from datetime import datetime, timedelta
from functools import wraps

from __main__ import app
from db import db


# We create a class user
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(50), unique=True)
    email = db.Column(db.String(70), unique=True)
    password = db.Column(db.String(80))


# We check the token
def tokenRequired(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if "x-access-token" in request.headers:
            token = request.headers["x-access-token"]

        if not token:
            return "token-missing", 401

        try:
            data = jwt.decode(token, app.config["SECRET_KEY"])
            currentUser = User.query\
                .filter_by(public_id=data["public_id"])\
                .first()
        except:
            return "invalid-token", 401

        return f(currentUser, *args, **kwargs)

    return decorated


# We create a function to login
@app.route("/api/login", methods=["POST"])
def login():

    auth = request.json

    if not auth or not auth["email"] or not auth["password"]:
        return "required"

    user = User.query\
        .filter_by(email=auth["email"])\
        .first()

    if not user:
        return "not-found"

    if check_password_hash(user.password, auth["password"]):
        token = jwt.encode({
            "public_id": user.public_id,
            "exp": datetime.utcnow() + timedelta(hours=5)
        }, app.config["SECRET_KEY"])

        return jsonify({"token": token.decode("UTF-8")})

    return "wrong-password"


# We create a function to create a new account
@app.route("/api/signup", methods=["POST"])
@tokenRequired
def signup(currentUser):

    auth = request.json

    if not auth or not auth["email"] or not auth["password"]:
        return "required"

    email = auth["email"]
    password = auth["password"]

    users = User.query.all()
    for user in users:
        if email == user.email:
            return "already-exists"

    user = User(
        public_id=str(uuid.uuid4()),
        email=email,
        password=generate_password_hash(password)
    )
    db.session.add(user)
    db.session.commit()

    return "registered"


# We create a function to get all users
@app.route("/api/user/list", methods=["GET"])
@tokenRequired
def getUsers(currentUser):
    if currentUser.email == "admin":
        users = User.query.all()
        output = []
        for user in users:
            output.append({
                "public_id": user.public_id,
                "email": user.email
            })
    else:
        output = [{
            "public_id": currentUser.public_id,
            "email": currentUser.email
        }]
    return jsonify(output)


# We create a function to change the password
@app.route("/api/user/password", methods=["POST"])
@tokenRequired
def changePassword(currentUser):

    email = request.json["email"]
    newPassword = request.json["password"]

    user = User.query\
        .filter_by(email=email)\
        .first()

    if not user:
        return "not-found"

    if currentUser.email == email or currentUser.email == "admin":
        user.password = generate_password_hash(newPassword)
        db.session.commit()
        return "changed"

    return "not-permitted", 401


# We create a function to delete a user
@app.route("/api/user/delete", methods=["POST"])
@tokenRequired
def deleteUser(currentUser):

    email = request.json["email"]

    user = User.query\
        .filter_by(email=email)\
        .first()

    if not user:
        return "not-found"

    if (currentUser.email == email or currentUser.email == "admin") and email != "admin":
        db.session.delete(user)
        db.session.commit()
        return "deleted"

    return "not-permitted", 401


def createAdmin():
    users = User.query.all()

    for user in users:
        if "admin" == user.email:
            return

    user = User(
        public_id=str(uuid.uuid4()),
        email="admin",
        password=generate_password_hash("admin")
    )

    db.session.add(user)
    db.session.commit()
