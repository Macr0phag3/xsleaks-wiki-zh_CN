import os

from flask import Flask, request


app = Flask(__name__)


@app.route('/visit')
def visit():
    path = request.args.get('path')
    os.system(f"node visit.js {path}")
    return "ok"

app.run(debug=True, port=8091)
