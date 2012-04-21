import json
import wiki
import search
from creole import text2html
from schema.util import slug as slugify
from flask import Flask, render_template, jsonify, request, abort, current_app, render_template_string, Markup
from sessions import RedisSessionInterface

app = Flask(__name__)
application = app
app.debug = True
app.session_interface = RedisSessionInterface()

### Flask Mucking ###
app.jinja_env.filters['creole'] = text2html

@app.template_filter()
def field(node, attr, label=None):
    label = label or attr.title()
    val = node.get(slugify(attr), None) or node.get(attr, '')
    if not val:
        return ""
    return Markup("<dt>%s</dt><dd>%s</dd>" % (label, text2html(val)))

## Views ##
@app.route('/:search/', methods=['GET'])
def search_nodes():
    q = request.args.get('q').strip().lower()
    if len(q) < 3:
        abort(400)
    nodes = unique_list( search.query(q), max=40 )
    nodes = map(render_summary, nodes)
    nodes = map(render_dates, nodes)
    return json_response(nodes)

@app.route('/', methods=['GET'])
def index():
    return get_nodes('')

@app.route('/<path:path>/', methods=['GET'])
def get_nodes(path):
    nodes = [get_node_or_shell(part) for part in path.split('/') if part.strip()]
    if request.is_xhr:
        nodes = map(render_details, nodes)
        return json_response(nodes)
    nodes.insert(0, get_node_or_shell('index'))
    nodes = map(render_details, nodes)
    types = wiki.get_types()
    return render_template("index.html", **locals())

@app.route('/<slug>/', methods=['POST'])
def post_node(slug=None):
    value = request.form['value']
    try:
        value = json.loads(value)
        value = wiki.put(slug, value)
        value = render_details(value)
        return jsonify(value)
    except wiki.FormError, e:
        return jsonify({
            '__error__': e.field
        })
    except:
        raise
        abort(400)

@app.route('/login', methods=['POST'])
def login():
    session['username'] = request.form['username']
    session['password'] = request.form['password']
    return 


## Helpers ##
def render_details(node):
    node['_html'] = render_template_string( wiki.get_type_template(node['type'], 'details'), node=node)
    return node

def render_summary(node):
    node['_html'] = render_template_string( wiki.get_type_template(node['type'], 'summary'), node=node)
    return node
    
def render_dates(node):
    if ('updated' in node and node['updated']):
        node['updated'] = node['updated'].strftime('%Y-%m-%dT%H:%M:%S')
    return node

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

def unique_list(seq, max=None):
   seen = {}
   result = []
   for item in seq:
       marker = item['slug']
       if marker in seen:
           continue
       seen[marker] = 1
       result.append(item)
       if max is not None and len(result) >= max:
           break
   return result


## Signals ##
from flask import request_started
from style import build_css

def on_request(sender, **extra):
    build_css()

request_started.connect(on_request, app)


## Main ##
if __name__ == '__main__':
    app.run(debug = True)
    
    
    