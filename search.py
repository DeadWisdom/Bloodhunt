import pyes
from datetime import datetime
from pyes import WildcardQuery, MatchAllQuery

mapping = {
    'slug': {
        'index': 'analyzed',
        'stored': 'yes',
        'type': 'string',
        'boost': 10.0
    },
    'type': {
        'index': 'analyzed',
        'stored': 'yes',
        'type': 'string',
        'boost': 0.5
    },
    'updated': {
        'type': 'date',
        'format': "yyyy-MM-dd'T'HH:mm:ss"
    },
    '_text': {
        'index': 'analyzed',
        'stored': 'no',
        'type': 'string',
        'boost': 1.0
    }
}

es = pyes.ES(['127.0.0.1:9200'])

try:
    es.create_index("bloodhunt")
    es.put_mapping("node", {'properties':mapping}, ["bloodhunt"])
except:
    pass


### Index 
def rebuild_index():
    import wiki
    es.delete_index("bloodhunt")
    es.create_index("bloodhunt")
    es.put_mapping("node", {'properties': mapping}, ["bloodhunt"])

def index_node(node, bulk=False):
    parts = []
    for k, v in node.items():
        if isinstance(v, basestring):
           parts.append(v) 
    node['_text'] = "\n".join(parts)
    result = es.index(node, "bloodhunt", "node", node['slug'], bulk=bulk)
    return result

def query(text):
    q = WildcardQuery('_text', '*' + text + '*')
    results = es.search( q )
    return results

def recent():
    q = MatchAllQuery()
    return reversed( es.search( q, sort=['updated'] ) )

from pyes import Query
class CustomQuery(Query):
    def __init__(self, query):
        self.query = query
    
    def serialize(self):
        return self.query
    