import os

from flask import Flask, send_from_directory


app = Flask(__name__)


@app.route('/')
def index():
    return send_from_directory(f'{os.path.join(app.root_path)}', 'poc.html')

app.run(debug=True, threaded=True)
