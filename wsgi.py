import json
import nodes
from creole import text2html
from flask import Flask, render_template, jsonify, request, abort
app = Flask(__name__)
application = app

## Views ##
@app.route('/')
def index():
    return get_node('index')
    return render_template("index.html", **locals())

@app.route('/<slug>/')
def get_node(slug=None):
    node = nodes.get(slug)
    if node is None:
        return jsonify({
            'slug': slug,
            'type': 'document',
            'name': slug,
            'content': '',
            '_html': '<p><em>No content yet</em></p>',
            '_empty': True,
        })
    if request.is_xhr:
        return jsonify(node)
    if slug == 'index':
        nodeset = [node]
    else:
        nodeset = [nodes.get('index'), node]
    return render_template("index.html", **locals())


@app.route('/<slug>/', methods=['POST'])
def post_node(slug=None):
    value = request.form['value']
    try:
        value = json.loads(value)
        value = nodes.put(slug, value)
        value['_html'] = text2html(value['content'])
        return jsonify(value)
    except:
        raise
        abort(400)

## Signals ##
from flask import request_started
from style import build_css

def log_request(sender, **extra):
    build_css()

request_started.connect(log_request, app)


## Main ##
if __name__ == '__main__':
    app.run(debug = True)
    
    
    