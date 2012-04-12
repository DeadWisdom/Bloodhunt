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
            if not first:
                o.write(",\n  ")
            o.write(redis.get(key))
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

elif command == 'flushdb':
    redis.flushdb()

else:
    usage()
    