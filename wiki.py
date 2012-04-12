import json, re
from creole import text2html
from schema.util import slug as slugify
from config import redis

re_related = re.compile(r"\[\[\s*\*([\w-]+)\s+(.*?)\]\]")

def get(slug):
    slug = slugify(slug)
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
    relations = set()
    for k, content in fields.items():
        if isinstance(content, basestring):
            relations.update(get_relations_from_text(content))
    set_relations(slug, relations)
    dct.update(fields)
    dct['slug'] = slug
    redis.set('n:' + slug, json.dumps(dct))
    return dct

def get_relations_from_text(content):
    for rel, obj in re_related.findall(content):
        rel = slugify(rel)
        obj = slugify(obj)
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

test_src = """
    [[*is-a Vampire]]
    [[*is-in Camarilla]]
    [[*resides The Tower]]
    [[*sire-of Jackson]]
    [[*sire-of Gwendolyn Falcor]]
"""