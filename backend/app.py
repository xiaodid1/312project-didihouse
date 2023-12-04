import os.path
from flask import Flask, send_from_directory, request, make_response
from pymongo import MongoClient
import json
import bcrypt
import hashlib
import secrets
from flask_socketio import SocketIO
from config import EMAIL, EMAIL_P
from bson.objectid import ObjectId
import smtplib

app = Flask(__name__)
mongo_client = MongoClient('mongo')
db = mongo_client["didhouse"]
users = db["users"]
auth_tokens = db["auth_tokens"]
auctions = db["auction"]
verify = db["verify"]
app.config['SECRET_KEY'] = '404NotFound'
socketIo = SocketIO(app, cors_allowed_origins='https://auction404notfound.com')
password1 = 'xdd'
password2 = 'xxx'
password3 = 'x'
hashed_pw1 = bcrypt.hashpw(password1.encode(), bcrypt.gensalt())
hashed_pw2 = bcrypt.hashpw(password2.encode(), bcrypt.gensalt())
hashed_pw3 = bcrypt.hashpw(password3.encode(), bcrypt.gensalt())
users.insert_one({"username": 'xdd', "email": 'xdd@gmail.com', "password": hashed_pw1})
users.insert_one({"username": 'xxx', "email": 'xxx@gmail.com', "password": hashed_pw2})
users.insert_one({"username": 'x', "email": 'x@gmail.com', "password": hashed_pw3})

# posts = db["posts"]
# likes = db["post_like"]


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return send_from_directory(app.static_folder, 'index.html')


def send_duration(auction_id, duration):
    auction = auctions.find_one({'_id': ObjectId(auction_id)})
    if auction and auction['duration'] == duration:
        duration_time = int(duration)
        while duration_time != -1:
            socketIo.emit('time_left', {'auction_id': auction_id, 'time': str(duration_time)})
            duration_time -= 1
            socketIo.sleep(1)
        auctions.update_one({'_id': ObjectId(auction_id)}, {'$set': {'Status': 'Ended'}})
        ended_auction = auctions.find_one({'_id': ObjectId(auction_id)})
        socketIo.emit('auction_end', {'auction_id': auction_id, 'winner': ended_auction['winner']})
    else:
        return


@app.route('/start-auction/<string:auction_id>', methods=['POST'])
def start_auction(auction_id):
    auth_token = request.cookies.get("auth_token", None)
    if auth_token:
        hashed_token = hashlib.sha256(auth_token.encode()).hexdigest()
        user = auth_tokens.find_one({'auth_token': hashed_token})
        if user:
            auction = auctions.find_one({'_id': ObjectId(auction_id)})
            if auction:
                if auction['username'] == user['username'] and auction['Status'] == 'Waiting':
                    auctions.update_one({'_id': ObjectId(auction_id)}, {'$set': {'Status': 'Ongoing'}})
                    socketIo.emit('new_auction_started', {'auction_id': auction_id})
                    socketIo.start_background_task(send_duration, auction_id, auction['duration'])
                    return json.dumps({'message': 'Auction Started'}), 200
                else:
                    return json.dumps({'message': 'Invalid Action'}), 200
            else:
                return json.dumps({'message': 'No Auction Associate'}), 200
        else:
            return json.dumps({"message": "You have not logged in yet, you are welcome to log in or register"}), 200
    else:
        return json.dumps({"message": "You have not logged in yet, you are welcome to log in or register"}), 200


@app.route('/post-bit/<string:auction_id>', methods=['POST'])
def update_bit(auction_id):
    data = request.get_json()
    bit = data['new_bid']
    auth_token = request.cookies.get("auth_token", None)
    if auth_token:
        hashed_token = hashlib.sha256(auth_token.encode()).hexdigest()
        user = auth_tokens.find_one({'auth_token': hashed_token})
        if user:
            auction = auctions.find_one({'_id': ObjectId(auction_id)})
            if auction:
                if auction['username'] != user['username'] and auction['Status'] == 'Ongoing' and float(bit) > float(auction['price']):
                    auctions.update_one({'_id': ObjectId(auction_id)}, {'$set': {'price': bit, 'winner': str(user['username'])}})
                    socketIo.emit('new_bid_posted', {'new_bid': bit, 'auction_id': auction_id})
                    return json.dumps({'message': 'Bit placed successfully'})
                else:
                    if float(bit) <= float(auction['price']):
                        return json.dumps({'message': 'Bid must be be greater than previous bid'})
                    else:
                        return json.dumps({'message': 'Invalid Action'}), 200
            else:
                return json.dumps({'message': 'No Auction Associate'}), 200
        else:
            return json.dumps({"message": "You have not logged in yet, you are welcome to log in or register"}), 200
    else:
        return json.dumps({"message": "You have not logged in yet, you are welcome to log in or register"}), 200


@app.route('/get-auction/<string:auction_id>', methods=['GET'])
def get_auction(auction_id):
    auth_token = request.cookies.get("auth_token", None)
    if auth_token:
        hashed_token = hashlib.sha256(auth_token.encode()).hexdigest()
        if auth_tokens.find_one({'auth_token': hashed_token}):
            auction = auctions.find_one({'_id': ObjectId(auction_id)})
            if auction:
                auction['_id'] = str(auction['_id'])
                return json.dumps({'auction': auction}), 200
            else:
                return json.dumps({"message": "No Auction Associate"}), 200
        else:
            return json.dumps({"message": "You have not logged in yet, you are welcome to log in or register"}), 200
    else:
        return json.dumps({"message": "You have not logged in yet, you are welcome to log in or register"}), 200


@app.route('/all-auction', methods=['GET'])
def all_auction():
    print('in')
    all_on_going = list(auctions.find({}))
    print(all_on_going)
    if all_on_going:
        for i in all_on_going:
            i['_id'] = str(i['_id'])
    return json.dumps({"auctions": all_on_going}), 200


@app.route('/user_infor', methods=['GET'])
def user_history():
    auth_token = request.cookies.get("auth_token", None)
    if auth_token:
        hashed_token = hashlib.sha256(auth_token.encode()).hexdigest()
        if auth_tokens.find_one({'auth_token': hashed_token}):
            username = auth_tokens.find_one({'auth_token': hashed_token})['username']
            created_auctions = list(auctions.find({'username': username}))
            win_auctions = list(auctions.find({'winner': username, "Status": 'Ended'}))
            print(created_auctions)
            print(win_auctions)
            for i in created_auctions:
                i['_id'] = str(i['_id'])
            for i in win_auctions:
                i['_id'] = str(i['_id'])
            response_data = {
                "created_auctions": created_auctions,
                "win_auctions": win_auctions
            }
            return json.dumps(response_data)

        else:
            return json.dumps({"message": "You have not logged in yet, you are welcome to log in or register"}), 200
    else:
        return json.dumps({"message": "You have not logged in yet, you are welcome to log in or register"}), 200


@app.route('/create-auction', methods=['POST'])
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
            new_auction = auctions.insert_one(
                {'username': username, 'name': name, 'description': description, 'price': price, 'duration': duration,
                 'image_file': '', 'Status': 'Waiting', 'winner': ''})
            image_path = '/static/media/error.7cf9ac3d577901f8d32c.jpg'
            if 'image' in request.files:
                image_file = request.files['image']
                image_data = image_file.read()
                image_path = '/static/media/' + username + '_' + str(new_auction.inserted_id) + '.jpg'
                with open(app.static_folder + image_path, "wb") as file:
                    file.write(image_data)
            auctions.update_one({'_id': new_auction.inserted_id}, {'$set': {'image_file': image_path}})
            socketIo.emit('new_auction_created', {'auction_id': str(new_auction.inserted_id),
                                                  'username': username,
                                                  'image_file': image_path,
                                                  'name': name,
                                                  'description': description,
                                                  'price': price,
                                                  'duration': duration,
                                                  'Status': 'Waiting',
                                                  'winner': ''})
            return json.dumps({"message": "Auction Created", 'auction_id': str(new_auction.inserted_id)}), 200

        else:
            return json.dumps({"message": "You have not logged in yet, you are welcome to log in or register"}), 200
    else:
        return json.dumps({"message": "You have not logged in yet, you are welcome to log in or register"}), 200


@app.route('/favicon.ico', methods=['GET'])
def show():
    resp = send_from_directory(app.static_folder + "/static/media/", 'error.7cf9ac3d577901f8d32c.jpg')
    response = make_response(resp, 200)
    response.headers = {'content-type': 'image/jpeg', 'x-content-type-options': 'nosniff'}
    return response


@app.route('/email_verify', methods=['GET'])
def verify_email():
    hashtoken = request.args.get('t')
    name = request.args.get('u')
    verify.find_one({'username': name})
    if verify:
        token = verify['verify_token']
        hashed = hashlib.sha256(token.encode()).hexdigest()
        if hashtoken == hashed:
            verify.update_one({'username': name}, {'$set': {'status': 'Yes'}})
            return 'Email Verified Successfully', 200
        else:
            return 'Invalid Token', 304
    else:
        return 'Not Such User', 304


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
    verify_token = secrets.token_hex(20)
    hashed = hashlib.sha256(verify_token.encode()).hexdigest()
    verify.insert_one({'username': username, 'verify_token': hashed, 'status': 'No'})
    message = f'PLease click this link to verify your email address: http://auction404notfound.com/email_verify?t='
    message += hashed
    message += f'&u=' + username
    with smtplib.SMTP('smtp.gmail.com', 587) as sender:
        sender.starttls()
        sender.login(EMAIL, EMAIL_P)
        sender.sendmail(EMAIL, email, message)
    return json.dumps({"message": "Successfully registered, verification email send"}), 200


@app.route('/auth-check', methods=['GET'])
def auth_check():
    auth_token = request.cookies.get("auth_token", None)
    if auth_token:
        hashed_token = hashlib.sha256(auth_token.encode()).hexdigest()
        auth = auth_tokens.find_one({'auth_token': hashed_token})
        if auth:
            ver = verify.find_one({'username': auth['username']})
            return json.dumps({"username": auth['username'], 'verif': ver['status']}), 200
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
        user = users.find_one({'username': username})
        hashed_pw = user['password']
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
    # app.run(debug=True, host='0.0.0.0', port=8080)
    socketIo.run(app, debug=True, host='0.0.0.0', port=8080, allow_unsafe_werkzeug=True)
