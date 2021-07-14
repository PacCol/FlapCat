import os
import shutil

import recognition.registering as registering
import recognition.training as training
import recognition.recognize as recognize

from db import db


# We create a class cat
class Cat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(10), unique=True)
    authorized = db.Column(db.Boolean)


# We create a function to list the registered cats
def listCats():
    cats = Cat.query.all()
    list = []
    for cat in cats:
        list.append({
            "id": cat.id,
            "name": cat.name,
            "authorized": cat.authorized
        })
    return list


# We create a function to rename a cat
def renameCat(id, newName):

    newName = "".join(char for char in newName if char.isalnum())

    if newName == "" or len(newName) > 10:
        return "name-error"

    if registering.getState() != "not-registering":
        registering.stopRegistering()

    if recognize.getState() == "recognizing":
        return "recognizing"

    if os.path.isdir("recognition/dataset/" + str(id)):
        cat = Cat.query\
            .filter_by(id=id)\
            .first()
        cat.name = newName
        db.session.commit()
        return "cat-renamed"
    else:
        return "not-found"


# We create a function to edit the permissions
def authorizeCat(id, authorized):

    if registering.getState() != "not-registering":
        registering.stopRegistering()

    if os.path.isdir("recognition/dataset/" + str(id)):
        cat = Cat.query\
            .filter_by(id=id)\
            .first()
        cat.authorized = authorized
        db.session.commit()
        return "cat-renamed"
    else:
        return "not-found"


# We create a function to delete a cat
def deleteCat(id):

    if registering.getState() != "not-registering":
        registering.stopRegistering()

    if recognize.getState() == "recognizing":
        return "recognizing"

    if os.path.isdir("recognition/dataset/" + str(id)):
        shutil.rmtree("recognition/dataset/" + str(id))
        cat = Cat.query\
            .filter_by(id=id)\
            .first()
        db.session.delete(cat)
        db.session.commit()
        training.needToReload()
        return "cat-deleted"
    else:
        return "not-found"
