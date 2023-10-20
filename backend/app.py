import os.path
import bcrypt
import string
import random
from pymongo import MongoClient
from flask import Flask, render_template, send_from_directory, request, make_response

app = Flask(__name__)

mongo_client = MongoClient("mongo")
db = mongo_client["CSE312_Project"]
post_collection = db["Posts"]

def escaped(input:str):
    message = input.replace('&', "&amp;")
    message = message.replace('<', "&lt;")
    message = message.replace('>', "&gt;")
    message = message.replace('"', "&quot;")
    message = message.replace("'", "&#39;")
    return message

@app.route('/')
def home():
    if 'token' in request.cookies and post_collection.find_one({"token": hash(request.cookies['token'])}):
        user = post_collection.find_one({"token": hash(request.cookies['token'])})['username']
        user = escaped(user)
        response = make_response(render_template("home.html", welcome = f"Welcomeback to React Post App, {user}"), 200)
    else:
        response = make_response(render_template("home.html", welcome = "Welcome to React Post App" ), 200)
    response.headers = {'content-type': 'text/html; charset=UTF-8', 'x-content-type-options': 'nosniff'}
    if post_collection.find_one({'counter': {'$exists': True}})==None:
        post_collection.insert_one({'counter': 0})
    return response


@app.route("/static/js/<path:path>")
def js(path):
    if os.path.exists(app.static_folder + "/static/js/" + path):
        resp = send_from_directory(app.static_folder + "/static/js/", path)
        response = make_response(resp, 200)
        response.headers = {'content-type': 'application/javascript; charset=UTF-8', 'x-content-type-options': 'nosniff'}
        return response


@app.route("/static/css/<path:path>")
def css(path):
    if os.path.exists(app.static_folder + "/static/css/" + path):
        resp = send_from_directory(app.static_folder + "/static/css/", path)
        response = make_response(resp, 200)
        response.headers = {'content-type': 'text/css; charset=UTF-8', 'x-content-type-options': 'nosniff'}
        return response


@app.route("/static/media/<path:path>")
def media(path):
    if os.path.exists(app.static_folder + "/static/media/" + path):
        resp = send_from_directory(app.static_folder + "/static/media/", path)
        response = make_response(resp, 200)
        response.headers = {'content-type': 'image/jpeg', 'x-content-type-options': 'nosniff'}
        return response


@app.route("/<path:path>")
def paths(path):
    if os.path.exists(app.static_folder + "/" + path):
        return send_from_directory(app.static_folder + "/", path)


@app.route("/visit-counter")
def count():
    visit = int(request.cookies.get('visited', "0"))
    visit += 1
    response = make_response("You had visited " + str(visit) + " times")
    response.set_cookie('visited', str(visit), max_age=3600)

    return response

@app.route('/register', methods = ['POST'])
def registration():
    username = request.form['username_reg']
    password = request.form['password_reg']
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    post_collection.insert_one({'username': username, 'hashed': hashed})
    response = make_response(render_template("response.html", response_message = "User Register"), 200)
    response.headers = {'content-type': 'text/html; charset=UTF-8', 'x-content-type-options': 'nosniff'}
    return response

@app.route('/login', methods = ['POST'])
def login():
    username = request.form['username_login']
    password = request.form['password_login']
    cookie_flage = True
    if post_collection.find_one({"username": username}):
        user = post_collection.find_one({"username": username})
        hashed = user['hashed']
        if bcrypt.checkpw(password.encode('utf-8'), hashed):
            token = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
            hashedtoken = hash(token)
            post_collection.update_one({"username": username}, {"$set": {"token": hashedtoken}})
            response = make_response(render_template("response.html", response_message = "User Login"), 200)
            response.set_cookie('token',token, max_age=3600,httponly=True)
            response.headers['x-content-type-options'] = 'nosniff'
            cookie_flage = False
        else:
            response = make_response(render_template("response.html", response_message = "login Error"), 200)        
    else:
        response = make_response(render_template("response.html", response_message = "login Error"), 200)        
    

    if cookie_flage:
        response.headers = {'content-type': 'text/html; charset=UTF-8', 'x-content-type-options': 'nosniff'}
    
    return response                   
    



if __name__ == '__main__':
    print("Hello")
    app.run(debug=True, host='0.0.0.0', port=8080)
