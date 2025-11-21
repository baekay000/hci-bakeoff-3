import os

# Figure out what prototype number we're on
IGNORED = ['favicon.ico', 'globals.css', 'layout.tsx', 'original', 'page.tsx']
routes = []
for name in os.listdir("./app"):
    if name not in IGNORED:
        routes.append(name)

lower_proto_name = f"proto{len(routes) + 1}"
upper_proto_name = f"Proto{len(routes) + 1}"

# Generate file data
pageStr = open("./tools/formatStrs/page.txt").read(-1)
pageStr = pageStr \
    .replace("LOWER_PROTO_NAME", lower_proto_name) \
    .replace("UPPER_PROTO_NAME", upper_proto_name) \
    
protoStr = open("./tools/formatStrs/prototype.txt").read(-1)
protoStr = protoStr \
    .replace("UPPER_PROTO_NAME", upper_proto_name) \

# Create directories and files
os.mkdir(f"./app/{lower_proto_name}")

pageFile = open(f"./app/{lower_proto_name}/page.tsx", "w")
pageFile.write(pageStr)
pageFile.close()

protoFile = open(f"./components/prototypes/{lower_proto_name}.tsx", "w")
protoFile.write(protoStr)
protoFile.close()
