import schema

def to_slug(src):
    if ':' in src:
        left, _, right  = src.partition(':')
        return '%s:%s' % (schema.slug(left), schema.slug(right))
    return schema.slug(src)
