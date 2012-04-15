import json, re
import fields, search
from datetime import datetime
from util import to_slug
from creole import text2html
from config import redis
from flask import render_template_string

### Nodes ###
def get(slug):
    slug = to_slug(slug)
    if ':' in slug:
        left, _, right = slug.partition(':')
        if left == 'type':
            return get_type(right)
    if slug == 'type':
        return get_type(slug)
    src = redis.get("n:" + slug)
    if src is None:
        return None
    node = json.loads(src)
    if not 'type' in node:
        node['type'] = 'document'
    return node

def put(slug, value, update=True):
    slug = to_slug(slug)
    if ':' in slug:
        left, _, right = slug.partition(':')
        if left == 'type':
            return put_type(right, value)
    elif slug == 'type':
        raise RuntimeError("Unnable to alter 'type'.  That's hard coded.")
    
    type = get_type(value['type']) or get_default_type()
    try:
        value = fields.process(type['fields'], value)
    except TypeError:
        raise FormError(type['fields'])
    
    value['type'] = type['slug'].split(':', 1)[1]
    value['slug'] = slug
    if update:
        value['updated'] = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
    relations = set()
    for k, content in value.items():
        if isinstance(content, basestring):
            relations.update(get_relations_from_text(content))
    set_relations(slug, relations)
    redis.set('n:' + slug, json.dumps(value))
    search.index_node(value)
    return value

class FormError(TypeError):
    def __init__(self, field):
        self.field = field
        super(FormError, self).__init__("Error processing form.")


### Relations ###
re_related = re.compile(r"\[\[\s*\*([\w-]+)\s+(.*?)\]\]")

def get_relations_from_text(content):
    for rel, obj in re_related.findall(content):
        rel = to_slug(rel)
        obj = to_slug(obj)
        yield rel, obj

def set_relations(subj, relation_set):
    current = ask(subj)
    for tup in (current - relation_set):
        unrelate(subj, *tup)
    for tup in (relation_set - current):
        relate(subj, *tup)

def relate(subj, predicate, obj):
    redis.sadd("r:%s:%s" % (subj, predicate), obj)
    redis.sadd("r:%s:%s" % (obj, predicate), subj)
    redis.sadd("r:%s::%s" % (obj, subj), predicate)
    redis.sadd("n:%s:subj" % subj, "%s:%s" % (predicate, obj))
    redis.sadd("n:%s:obj" % obj, "%s:%s" % (subj, predicate))

def unrelate(subj, predicate, obj):
    redis.srem("r:%s:%s" % (subj, predicate), obj)
    redis.srem("r:%s:%s" % (obj, predicate), subj)
    redis.srem("r:%s::%s" % (obj, subj), predicate)
    redis.srem("n:%s:subj" % subj, "%s:%s" % (predicate, obj))
    redis.srem("n:%s:obj" % obj, "%s:%s" % (subj, predicate))

def ask(subj, predicate="*", obj='*'):
    if '*' not in (subj, predicate, obj):
        return redis.sismember('r:%s:%s' % (subj, predicate), obj)
    
    if subj == predicate == obj == '*':
        raise RuntimeError('ask() cannot query in the form "* * *".')
    if subj == obj == '*':
        raise RuntimeError('ask() cannot query in the form "* <predicate> *".')
    
    if subj == predicate == '*':
        return set(tuple(x.split(':')) for x in redis.smembers('n:%s:obj' % obj))
    if obj == predicate == '*':
        return set(tuple(x.split(':')) for x in redis.smembers('n:%s:subj' % subj))
    
    if subj == '*':
        return redis.smembers("r:%s:%s" % (obj, predicate))
    if predicate == '*':
        return redis.smembers("r:%s::%s" % (obj, subj))
    if obj == '*':
        return redis.smembers('r:%s:%s' % (subj, predicate))


### Types ###
def get_type(slug):
    if not slug:
        return None
    src = redis.get("n:type:" + slug)
    if src is None:
        return None
    data = json.loads(src)
    return data

def put_type(slug, value):
    supertype = get_type_type()
    try:
        value = fields.process(supertype['fields'], value)
    except TypeError:
        raise FormError(supertype['fields'])
    value['slug'] = 'type:' + slug
    value['type'] = 'type'
    value['updated'] = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
    redis.sadd("types", slug)
    redis.set('n:type:' + slug, json.dumps(value))
    set_type_template(slug, 'details', value.get('details'))
    set_type_template(slug, 'summary', value.get('summary'))
    return value

def get_type_template(slug, key='details'):
    return redis.hget('t:%s' % key, slug) or '-'

def set_type_template(slug, key, value):
    if value:
        redis.hset("t:%s" % key, slug, value)

def get_types():
    result = {
        'type': get_type_type()
    }
    for slug in redis.smembers('types'):
        src = redis.get('n:type:' + slug)
        if src is None:
            redis.srem('types', slug)
        else:
            result[slug] = json.loads(src)
    return result

def get_default_type():
    return {
        'slug': 'type:document',
        'type': 'type',
        'fields': [
            {'name': 'name', 'type': 'string', 'length': 64},
            {'name': 'content', 'type': 'page'},
        ],
        'details': '{{node.content|creole}}',
        'summary': '{{node.content|creole|striptags|truncate(length=140)}}',
    }

def get_type_type():
    return {
        'slug': 'type',
        'type': 'type',
        'details': '{% for field in node.fields %}{{field|pprint}}{% endfor %}',
        'summary': '{{node.slug}}',
        'fields': [
            {'name': 'fields', 'type': 'yaml'},
            {'name': 'summary', 'type': 'page', 'help': 'Template for a summary.', 'required': False},
            {'name': 'details', 'type': 'page', 'details': 'Template for the full view.', 'required': False},
            {'name': 'width', 'type': 'integer', 'help': 'Default pixel with of the type.', 'required': False, 'default': 700},
        ]
    }

### Migration ###
def rebuild_nodes():
    for key in redis.keys('n:*'):
        try:
            node = get(key[2:])
        except Exception, e:
            continue
        put(node['slug'], node, False)
