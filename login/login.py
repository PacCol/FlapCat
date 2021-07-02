# flask imports
from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
import uuid # for public id
from  werkzeug.security import generate_password_hash, check_password_hash
# imports for PyJWT authentication
import jwt
from datetime import datetime, timedelta
from functools import wraps

from __main__ import app

# configuration
# NEVER HARDCODE YOUR CONFIGURATION IN YOUR CODE
# INSTEAD CREATE A .env FILE AND STORE IN IT
app.config['SECRET_KEY'] = 'your secret key'
# database name
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///login/users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
# creates SQLALCHEMY object
db = SQLAlchemy(app)
  
# Database ORMs
class User(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    public_id = db.Column(db.String(50), unique = True)
    email = db.Column(db.String(70), unique = True)
    password = db.Column(db.String(80))
  
# decorator for verifying the JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # jwt is passed in the request header
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        # return 401 if token is not passed
        if not token:
            return jsonify({'message' : 'Token is missing !!'}), 401
  
        try:
            # decoding the payload to fetch the stored details
            data = jwt.decode(token, app.config['SECRET_KEY'])
            current_user = User.query\
                .filter_by(public_id = data['public_id'])\
                .first()
        except:
            return jsonify({
                'message' : 'Token is invalid !!'
            }), 401
        # returns the current logged in users contex to the routes
        return  f(current_user, *args, **kwargs)
  
    return decorated
  
# User Database Route
# this route sends back list of users users
@app.route('/api/user', methods =['GET'])
@token_required
def get_all_users(current_user):
    # querying the database
    # for all the entries in it
    users = User.query.all()
    # converting the query objects
    # to list of jsons
    output = []
    for user in users:
        # appending the user data json
        # to the response list
        output.append({
            'public_id': user.public_id,
            'email' : user.email
        })
  
    return jsonify({'users': output})


# We create a function to login
@app.route("/api/login", methods =["POST"])
def login():

    auth = request.form
  
    if not auth or not auth.get("email") or not auth.get("password"):
        return "required"
  
    user = User.query\
        .filter_by(email = auth.get("email"))\
        .first()
  
    if not user:
        return "not-found"
  
    if check_password_hash(user.password, auth.get('password')):
        token = jwt.encode({
            "public_id": user.public_id,
            "exp" : datetime.utcnow() + timedelta(minutes = 30)
        }, app.config['SECRET_KEY'])
  
        return make_response(jsonify({'token' : token.decode('UTF-8')}), 201)

    return "wrong-password"


# We create a function to create a new account
@app.route("/api/signup", methods =["POST"])
def signup():

    data = request.form

    email = data.get("email")
    password = data.get("password")

    user = User.query\
        .filter_by(email = email)\
        .first()

    if not user:

        print(email)
        print(password)

        user = User(
            public_id = str(uuid.uuid4()),
            email = email,
            password = generate_password_hash(password)
        )
        db.session.add(user)
        db.session.commit()
  
        return "registered"
    else:
        return "already-exists"

db.create_all()