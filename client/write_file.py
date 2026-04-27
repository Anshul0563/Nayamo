import sys

content = sys.stdin.read()
filepath = sys.argv[1]
with open(filepath, 'w') as f:
    f.write(content)
print(f"Written {len(content)} chars to {filepath}")

