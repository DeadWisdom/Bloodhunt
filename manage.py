#!env/bin/python

"""Usage: manage.py command

Options:
  -h --help            show this help message and exit

Subcommands:
  dumpdata <path>       Dump all node data to the given file.
  loaddata <path>       Load node data from the given file.
  flushdb               Destroys all data in the database.
"""

import sys, json
from config import redis

def usage(status=-1):
    print "Usage: python manage.py <command>"
    print "Available commands:"
    print "  help            - Prints this help."
    print "  dumpdata <path> - Dumps all nodes to the given file."
    print "  loaddata <path> - Loads data from the given file."
    print "  flushdb         - Destroys all data in the database."
    sys.exit(status)

if len(sys.argv) < 2:
    usage()

command = sys.argv[1]

if command == 'help':
    usage(0)
    
if command == 'runserver':
    from wsgi import app
    app.run(debug = True)

elif command == 'dumpdata':
    try:
        path = sys.argv[2]
    except:
        usage()
    
    with open(path, "w") as o:
        o.write("[\n  ")
        first = True
        for key in redis.keys("n:*"):
            try:
                src = redis.get(key)
            except:
                continue
            if not first:
                o.write(",\n  ")
            o.write(src)
            first = False
        o.write("\n]")
    
    print "Dumped data to %s" % path

elif command == "loaddata":
    try:
        path = sys.argv[2]
    except:
        usage()
    
    with open(path) as o:
        data = json.load(o)
    
    for node in data:
        redis.set( 'n:' + node['slug'], json.dumps(node))
    
    print "Loadded data from %s" % path

elif command == 'fixdb':
    import wiki, search
    types = wiki.get_types()
    for k, v in types.items():
        if k == 'type':
            continue
        try:
            wiki.put_type(k, v)
        except wiki.FormError, e:
            print e.field
    search.rebuild_index()
    wiki.rebuild_nodes()
    print "Wiki Rebuilt."

elif command == 'flushdb':
    redis.flushdb()

else:
    usage()
    
