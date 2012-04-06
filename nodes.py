import json
from creole import text2html
from schema.util import slug as slugify
from config import redis

def get(slug):
    src = redis.get("n:" + slug)
    if src is None:
        return None
    data = json.loads(src)
    data['_html'] = text2html(data['content'])
    return data


def put(slug, fields):
    slug = slugify(slug)
    assert slug
    assert fields['name']
    assert fields['type']
    dct = {
        'slug': slug,
        'name': fields['name'],
        'type': fields['type'],
        'content': fields['content'],
    }
    dct.update(fields)
    dct['slug'] = slug
    redis.set('n:' + slug, json.dumps(dct))
    return dct

"""
def set_node(slug, type, fields):
    key = "n:" + slug
    fields = get_type_fields(type)
    existing = redis.hmget(key)
    data = {}
    try:
        for field in :
            data[k] = conv(fields.get())
    except:
        
        
    for k, v in fields.items():
        
    
    type_set(type, slug, fields)
    return key

def relate(a, b, relation, strength=1):
    key =

class Node(object):
    def __init__(self, key):
        self.key = key
    
    def load(self):
        


set_node("index", "index", {
    'content': "[[]]"
})
"""