import urllib, re
from genshi.builder import tag
from genshi.input import HTML
from flask import render_template
import creoleparser
from config import redis
from util import to_slug

def menu(macro, environ):
    """Places the contents in a class=".menu" div."""
    return tag.div(macro.parsed_body(), class_="menu")

def related(macro, environ, predicate, obj):
    """Gets links to related items."""
    import wiki
    links = []
    predicate = to_slug(predicate)
    obj = to_slug(obj)
    for slug in wiki.ask("*", predicate, obj):
        node = wiki.get(slug)
        if node:
            links.append( HTML(render_template(["plate/%s.html" % node.get('type', 'default'), "plate/default.html"], node=node)) )
        else:
            links.append( tag.a(slug, href=slug) )
    return tag.div(links, class_="related")

def hidden(macro, environ):
    return tag.div(macro.parsed_body(), class_="hidden")

def recent(macro, environ):
    """Returns 30 links to the most recently changed nodes."""
    import search
    links = []
    for node in search.recent():
        if node:
            links.append( HTML(render_template("plate/recent_plate.html", node=node)) )
        else:
            links.append( tag.a(slug, href=slug) )
    return tag.div(links, class_="recent")

def wiki_links_path_func(src):
    if (".com" in src or
        ".net" in src or
        ".org" in src):
        return "http://%s" % src
    return to_slug(src)

def wiki_links_class_func(src):
    if (".com" in src or
        ".net" in src or
        ".org" in src):
        return "external"
    if not redis.exists("n:" + to_slug(src)):
        return "missing"

dialect = creoleparser.create_dialect(
              creoleparser.creole11_base,
              wiki_links_class_func=wiki_links_class_func,
              wiki_links_path_func=wiki_links_path_func,
              wiki_links_space_char="-",
              bodied_macros={'menu': menu, 'hidden': hidden},
              non_bodied_macros={'related': related, 'recent': recent})

parser = creoleparser.Parser(dialect, encoding=None)

def text2html(src):
    from wiki import re_related
    src = re_related.sub(r"[[\2]]", src)
    return parser( src )
