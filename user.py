import hashlib, os
from config import redis
from schema import slug
from werkzeug.security import generate_password_hash, check_password_hash


def set_password(username, password):
    redis.hset('user:passwords', slug(username), generate_password_hash(password))

def check_password(username, password):
    pw_hash = redis.hget('user:passwords', slug(username))
    if pw_hash is None:
        return None
    if check_password_hash(pw_hash, password):
        return True
    return False

def user_exists(username):
    return redis.hexists('user:passwords', slug(username))

def set_email(username, email):
    redis.hset('user:emails', slug(username), email)

def get_email(username, email):
    redis.hset('user:emails', slug(username))

def create_invite(email):
    h = hashlib.new('md5')
    h.update(os.urandom(128))
    key = h.hexdigest()
    redis.hset('user:keys', key, email)
    return key

def check_invite(key):
    return hexists('user:keys', key)

def register_user(key, username, password):
    if not password:
        return False
    if not check_invite(key):
        return False
    email = redis.hget('user:keys', key)
    username = slug(username)
    if redis.hexists('user:passwords', username):
        return False
    set_email(username, email)
    set_password(username, password)
    redis.hdel('user:keys', key)
    return {
        'username': username,
        'email': email
    }
