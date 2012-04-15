import json
import util
import schema


def slug_filter(field, value):
    return util.to_slug(value)

def string_filter(field, value):
    if value is None:
        return u''
    value = unicode(value)
    length = field.get('length')
    if length is not None:
        if len(value) > length:
            raise TypeError("must be %s or less characters." % length)
    return value

def page_filter(field, value):
    if value is None:
        return u''
    return unicode(value)

def integer_filter(field, value):
    try:
        return int(value)
    except:
        raise TypeError("not an integer")

def select_filter(field, value):
    value = slug_filter(value)
    choices = field.get('choices')
    if value not in choices:
        raise TypeError("%r not available as a choice." % value)
    return value

def list_filter(field, value):
    item = field['item']
    return [filter(item, v) for v in value]

def tuple_filter(field, value):
    fields = field['items']
    return tuple(filter(*pair) for pair in zip(fields, value))

def dict_filter(field, value):
    fields = field['items']
    errors = False
    result = {}
    for subfield in fields:
        key = subfield['name']
        subvalue = value.get(key, None)
        try:
            result[key] = filter(subfield, subvalue)
        except Exception, e:
            subfield['__error'] = unicode(e)
            field['__error'] = "There was an error in the fields below."
            errors = True
    if errors:
        raise TypeError("Error converting dict.")
    return result

def yaml_filter(field, value):
    if isinstance(value, basestring):
        return json.loads(value)
    return value

def constant_filter(field, value):
    return field['value']

def filter(field, value):
    required = field.get('required', True)
    if not value:
        if 'default' in field:
            value = field['default']
        elif required:
            raise TypeError("is required.")
    t = field['type']
    filter_func = fields[t]
    return filter_func(field, value)

def process(fields, value):
    field = {
        'items': fields
    }
    return dict_filter(field, value)

fields = {
    'slug': slug_filter,
    'string': string_filter,
    'page': page_filter,
    'integer': integer_filter,
    'select': select_filter,
    'list': list_filter,
    'tuple': tuple_filter,
    'dict': dict_filter,
    'yaml': yaml_filter,
    'constant': constant_filter,
}