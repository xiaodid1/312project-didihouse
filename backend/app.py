import os.path

from flask import Flask, render_template, send_from_directory, request, make_response

app = Flask(__name__)


@app.route("/")
def index():
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


if __name__ == '__main__':
    print("Hello")
    app.run(debug=True, host='0.0.0.0', port=8080)
