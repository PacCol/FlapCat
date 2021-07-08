import json

from datetime import datetime

from flask import jsonify

from __main__ import app
from db import db

# We create a class entry
class Entry(db.Model):
    name = db.Column(db.String(10))
    date = db.Column(db.DateTime(), primary_key=True)

def addEntry(catName):
    entry = Entry(
        name = catName,
        date = datetime.now()
    )
    db.session.add(entry)

    entries = Entry.query.all()
    entries.reverse()
    if len(entries) > 5:
        entryToDelete = entries[5]
        db.session.delete(entryToDelete)
    
    db.session.commit()

@app.route("/api/entry", methods=["GET"])
def listEntries():
    entries = Entry.query.all()
    entries.reverse()
    output = []
    for entry in entries:
        output.append({
            "name": entry.name,
            "entryDate" : json.dumps(entry.date.isoformat())
        })
    return jsonify(output)