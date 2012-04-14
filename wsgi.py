import json
import wiki
from creole import text2html
from schema.util import slug as slugify
from flask import Flask, render_template, jsonify, request, abort, current_app
app = Flask(__name__)
application = app

### Flask Mucking ###
app.jinja_env.filters['creole'] = text2html


## Views ##
@app.route('/', methods=['GET'])
def index():
    return get_nodes('')

@app.route('/<path:path>/', methods=['GET'])
def get_nodes(path):
    nodes = [get_node_or_shell(part) for part in path.split('/') if part.strip()]
    if request.is_xhr:
        return json_response(nodes)
    nodes.insert(0, get_node_or_shell('index'))
    types = wiki.get_types()
    return render_template("index.html", **locals())

@app.route('/<slug>/', methods=['POST'])
def post_node(slug=None):
    value = request.form['value']
    try:
        value = json.loads(value)
        value = wiki.put(slug, value)
        #value['_html'] = text2html(value['content'])
        return jsonify(value)
    except wiki.FormError, e:
        return jsonify({
            '__error__': e.field
        })
    except:
        raise
        abort(400)


## Helpers ##
def get_node_or_shell(slug):
    node = wiki.get(slug)
    if node is not None:
        return node
    if slug.startswith('type:'):
        return { 
            'slug': slug,
            'type': 'type',
            '_html': '<p><em>No content yet.</em></p>',
            '_empty': True 
        }
    return { 
        'slug': slug,
        'type': 'document',
        'name': slug,
        'content': '',
        '_html': '<p><em>No content yet.</em></p>',
        '_empty': True 
    }


def json_response(data):
    return current_app.response_class(json.dumps(data, indent=None if request.is_xhr else 2), mimetype='application/json')


## Signals ##
from flask import request_started
from style import build_css

def on_request(sender, **extra):
    build_css()

request_started.connect(on_request, app)


## Main ##
if __name__ == '__main__':
    app.run(debug = True)
    
    
    