import os
import shutil

import recognition.training as training

# We create a function to list the registered cats
def listCats():

    list = []
    dirs = os.listdir("recognition/dataset")

    for name in dirs:

        f = open("recognition/dataset/" + name + "/authorized.txt", "r")
        authorized = f.read()
        f.close()

        if authorized == "true":
            authorized = True
        else:
            authorized = False

        cat = {"name": name, "authorized": authorized}
        list.append(cat)

    return list

# We create a function to rename a cat
def renameCat(catName, newName):
    if os.path.isdir("recognition/dataset/" + catName):
        os.rename("recognition/dataset/" + catName, "recognition/dataset/" + newName)
        training.needToReload()
        return "cat-renamed"
    else:
        return "not-found"

# We create a function to edit the permissions
def authorizeCat(catName, authorized):
    if os.path.isdir("recognition/dataset/" + catName):
        f = open("recognition/dataset/" + catName + "/authorized.txt", "w")
        f.write(authorized)
        f.close()
        return "permission-changed"
    else:
        return "not-found"

# We create a function to delete a cat
def deleteCat(catName):
    if os.path.isdir("recognition/dataset/" + catName):
        shutil.rmtree("recognition/dataset/" + catName)
        training.needToReload()
        return "cat-deleted"
    else:
        return "not-found"