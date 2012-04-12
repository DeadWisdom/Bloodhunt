import schema

def max_length(length=255):
    def conversion(string):
        if len(string) > length:
            raise TypeError("String may not be more than %s characters." % length)

filters = {
    'slug': schema.slug,
    'string': schema.And(schema.unicode, max_length()),
    'page': unicode,
    'integer': int,
    'select': 
}