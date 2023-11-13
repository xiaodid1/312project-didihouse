import os.path
from flask import Flask, send_from_directory, request, make_response, jsonify
from pymongo import MongoClient
import json
import bcrypt
import hashlib
import secrets
from bson.objectid import ObjectId
from flask_socketio import SocketIO


app = Flask(__name__)
app.config['SECRET_KEY'] = 'auctions'
socketio = SocketIO(app)

mongo_client = MongoClient('mongo')
db = mongo_client["didhouse"]
users = db["users"]
auth_tokens = db["auth_tokens"]
auctions = db["auction"]
# posts = db["posts"]
# likes = db["post_like"]


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/create-auction',methods=['POST'])
def creat_auction():
    auth_token = request.cookies.get("auth_token", None)
    if auth_token:
        hashed_token = hashlib.sha256(auth_token.encode()).hexdigest()
        if auth_tokens.find_one({'auth_token': hashed_token}):
            username = auth_tokens.find_one({'auth_token': hashed_token})['username']
            name = request.form['name']
            description = request.form['description']
            price = request.form['price']
            duration = request.form['duration']
            image_path = 'item_images/cat.jpg'
            if 'image' in request.files:
                image_file = request.files['image']
                print('Image File Name:', image_file.filename)
                image_data = image_file.read()
                print('Image File Data (as bytes):', image_data)
                image_path = "item_images/" + username + '_' + name + '.jpg'
                with open(image_path, "wb") as file:
                    file.write(image_data)

            auctions.insert_one({'username': username, 'name': name,'description': description,'price': price,'duration': duration,'image_file': image_path, 'on_going': True})
            return json.dumps({"message": "Auction Created"}), 200
        

        else:
            return json.dumps({"message": "You have not logged in yet, you are welcome to log in or register"}), 200
    else:
        return json.dumps({"message": "You have not logged in yet, you are welcome to log in or register"}), 200

@socketio.on('connect')
def handle_connect():
    print('Client connected')



@app.route('/all_auction',methods=['GET'])
def all_auction():
    all_on_going = auctions.find({"on_going": True})
    if all_on_going:
        for i in all_on_going:
            i['_id'] = str(i['_id'])
            
    return json.dumps({"auctions": all_on_going}), 200


@app.route('/user_home', methods = ['GET'])
def user_history():
    auth_token = request.cookies.get("auth_token", None)
    if auth_token:
        hashed_token = hashlib.sha256(auth_token.encode()).hexdigest()
        if auth_tokens.find_one({'auth_token': hashed_token}):
            username = auth_tokens.find_one({'auth_token': hashed_token})['username']
            past_auctions = list(auctions.find({'username': username,"on_going": False}))
            win_auctions = list(auctions.find({'winner': username,"on_going": False}))
            
            response_data = {
                "past_auctions": past_auctions,
                "win_auctions": win_auctions
            }
            
            return jsonify(response_data)
        
        else:
            return json.dumps({"message": "You have not logged in yet, you are welcome to log in or register"}), 200
    else:
        return json.dumps({"message": "You have not logged in yet, you are welcome to log in or register"}), 200


@socketio.on("send_price")
def upate_price(incoming_price):
    auth_token = request.cookies.get("auth_token", None)
    if auth_token:
        hashed_token = hashlib.sha256(auth_token.encode()).hexdigest()
        if auth_tokens.find_one({'auth_token': hashed_token}):
            username = auth_tokens.find_one({'auth_token': hashed_token})['username']
            name = request.data['name']
            price =  auctions.find_one({'username': username, 'name': name})['price']
            if incoming_price['price'] > price:
                auctions.update_one({"username": username, "name":name}, {"$set": {"price": price}})
                socketio.emit('update_price', {'price': price})
                

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    print(data['username'])
    print(data['email'])
    print(data['password'])
    username = data['username']
    email = data['email']
    password = data['password']
    if users.find_one({'username': username}):
        return json.dumps({"message": "Username is registered"}), 200
    if users.find_one({'email': email}):
        return json.dumps({"message": "Email is registered"}), 200
    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    users.insert_one({"username": username, "email": email, "password": hashed_pw})
    return json.dumps({"message": "Successfully registered"}), 200


@app.route('/auth-check', methods=['GET'])
def auth_check():
    auth_token = request.cookies.get("auth_token", None)
    if auth_token:
        hashed_token = hashlib.sha256(auth_token.encode()).hexdigest()
        if auth_tokens.find_one({'auth_token': hashed_token}):
            return json.dumps({"username": auth_tokens.find_one({'auth_token': hashed_token})['username']}), 200
        else:
            return json.dumps({"message": "You have not logged in yet, you are welcome to log in or register"}), 200
    else:
        return json.dumps({"message": "You have not logged in yet, you are welcome to log in or register"}), 200


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']
    if not users.find_one({'username': username}):
        return json.dumps({"message": "User not found please register first"}), 200
    else:
        hashed_pw = users.find_one({'username': username})['password']
        if bcrypt.checkpw(password.encode(), hashed_pw):
            auth_token = secrets.token_hex(20)
            hashed_token = hashlib.sha256(auth_token.encode()).hexdigest()
            auth_tokens.insert_one({'username': username, 'auth_token': hashed_token})
            resp = make_response(json.dumps({"message": "Successfully logged in"}), 200)
            resp.set_cookie("auth_token", auth_token, httponly=True)
            return resp
        else:
            return json.dumps({"message": "Username and password are not matched please try again"}), 200


@app.route("/static/js/<path:path>")
def js(path):
    if os.path.exists(app.static_folder + "/static/js/" + path):
        resp = send_from_directory(app.static_folder + "/static/js/", path)
        response = make_response(resp, 200)
        response.headers = {'content-type': 'application/javascript; charset=UTF-8',
                            'x-content-type-options': 'nosniff'}
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


@app.route("/visit-counter")
def count():
    visit = int(request.cookies.get('visited', "0"))
    visit += 1
    response = make_response("You had visited " + str(visit) + " times")
    response.set_cookie('visited', str(visit), max_age=3600)

    return response

# @app.route('/dashboard-post/<string:user>', methods=['POST'])
# def post(user):
#     post_data = request.get_json()
#     title = post_data['title']
#     description = post_data['description']
#     posts.insert_one({'user': user, "title": title, "description": description, "likes": 0})
#     return json.dumps({"message": "Successfully Posted"}), 200


# @app.route('/setLike/<string:user>/<string:postid>', methods=['POST'])
# def like(user, postid):
#     if user != "null":
#         likes.insert_one({'user': user, 'post_id': postid})
#         posts.update_one({'_id': ObjectId(postid)}, {"$inc": {"likes": 1}})
#         return json.dumps({}), 200
#     else:
#         return json.dumps({"message": "Please log in first"}), 200


# @app.route('/setDislike/<string:user>/<string:postid>', methods=['POST'])
# def dislike(user, postid):
#     likes.delete_one({'user': user, 'post_id': postid})
#     posts.update_one({'_id': ObjectId(postid)}, {"$inc": {"likes": -1}})
#     return json.dumps({}), 200


# @app.route('/posts-his/<string:user>', methods=['GET'])
# def posts_his(user):
#     post_in_db = list(posts.find({}))
#     if post_in_db:
#         for i in post_in_db:
#             i['_id'] = str(i['_id'])
#             if user != "null":
#                 if likes.find_one({'user': user, 'post_id': i['_id']}):
#                     i['liked'] = 1
#                 else:
#                     i['liked'] = 0
#     return json.dumps({"posts": post_in_db}), 200


if __name__ == '__main__':
    print("Hello")
    app.run(debug=True, host='0.0.0.0', port=8080)
