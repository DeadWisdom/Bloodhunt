from config import redis

class Type(object):
    def __init__(self, key):
        self.key = "type:" + key