import clevercss
import sys, os
ROOT = os.path.abspath(os.path.dirname(__file__))

clever_path = os.path.join(ROOT, 'style')
result_path = os.path.join(ROOT, 'static', 'style.css')

def build_css():
    total = []
    for filename in os.listdir(clever_path):
        path = os.path.join(clever_path, filename)
        with open(path) as file:
            if path.endswith('.clever'):
                total.append("\n/* %s */" % filename)
                total.append(clevercss.convert(file.read()))
            elif path.endswith('.css'):
                total.append("\n/* %s */" % filename)
                total.append(file.read())
    
    with open(result_path, 'w') as file:
        file.write("\n".join(total).strip())