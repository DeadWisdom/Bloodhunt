import urllib, re
import genshi
import creoleparser
from config import redis
from schema.util import slug

def menu(macro, environ):
    """Places the contents in a class=".menu" div."""
    return genshi.builder.tag.div(macro.parsed_body(), class_="menu")

def wiki_links_path_func(src):
    if (".com" in src or
        ".net" in src or
        ".org" in src):
        return "http://%s" % src
    return slug(src)

def wiki_links_class_func(src):
    if (".com" in src or
        ".net" in src or
        ".org" in src):
        return "external"
    if not redis.exists("n:" + slug(src)):
        return "missing"

dialect = creoleparser.create_dialect(
              creoleparser.creole11_base,
              wiki_links_class_func=wiki_links_class_func,
              wiki_links_path_func=wiki_links_path_func,
              wiki_links_space_char="-",
              bodied_macros={'menu': menu})

text2html = creoleparser.Parser(dialect)
