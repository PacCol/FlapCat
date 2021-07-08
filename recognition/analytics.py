import json

from datetime import datetime, timedelta

from flask import jsonify

from __main__ import app
from login import tokenRequired
from db import db


# We create a class entry
class Entry(db.Model):
    name = db.Column(db.String(10))
    date = db.Column(db.DateTime(), primary_key=True)
    authorized = db.Column(db.Boolean)


def addEntry(catName, authorized):
    entry = Entry(
        name = catName,
        date = datetime.now(),
        authorized = authorized
    )
    db.session.add(entry)
    db.session.commit()


def removeOldEntries():
    limit = datetime.now() - timedelta(days=7)
    Entry.query.filter(Entry.date < limit).delete()

    db.session.commit()


@app.route("/api/entry", methods=["GET"])
def listEntries():
    removeOldEntries()

    entries = Entry.query.all()
    entries.reverse()
    allEntries = []

    for entry in entries:
        allEntries.append({
            "name": entry.name,
            "entryDate" : json.dumps(entry.date.isoformat()),
            "authorized": entry.authorized
        })

    return jsonify(allEntries)


@app.route("/api/entry/reset", methods=["POST"])
@tokenRequired
def resetEntries(currentUser):
    Entry.query.delete()
    db.session.commit()
    return "reseted"