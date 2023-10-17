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
post_collection.insert_one({'use': 'counter', 'value': 0})

@app.route("/")
def index():
    if request.cookies.get('token') and post_collection.find_one({"token": request.cookies.get('token')}):
        user = post_collection.find_one({"token": request.cookies.get('token')})['username']
        render_template("index.html", welcome = f"Welcomeback to React Post App, {user}")
    else:
        render_template("index.html", welcome = "Welcome to React Post App" )
    resp = app.send_static_file("index.html")
    response = make_response(resp, 200)
    response.headers = {'content-type': 'text/html; charset=UTF-8', 'x-content-type-options': 'nosniff'}
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

@app.route('/registration', method = 'POST')
def registration():
    username = request.form['username_reg']
    password = request.form['password_reg']
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password, salt)
    post_collection.insert_one({'username': username, 'hashed': hashed})
    render_template("message.html", response_message = "User Register")
    resp = app.send_static_file("message.html")
    response = make_response(resp, 200)
    return response

@app.route('/login', method = 'POST')
def login():
    username = request.form['username_login']
    password = request.form['password_login']
    cflag = False
    if post_collection.find_one({"username": username}):
        user = post_collection.find_one({"username": username})
        hashed = user['hashed']
        if bcrypt.checkpw(password, hashed):
            token = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
            hashedtoken = hash(token)
            post_collection.update_one({"username": username}, {"$set": {"token": hashedtoken}})
            render_template("message.html", response_message = "User Login")
            cflag = True
        else:
            render_template(index.html, response_message = "login Error")           
    else:
        render_template(index.html, response_message = "login Error")  

    resp = app.send_static_file("message.html")
    response = make_response(resp, 200)
    
    if cflag:
        response.set_cookie('token', token, max_age=3600)

    return response          
    



if __name__ == '__main__':
    print("Hello")
    app.run(debug=True, host='0.0.0.0', port=8080)
