import json

inputfile = 'oostende_dover.route'


def printj(data):
    print(json.dumps(
        data,
        indent=4,
        separators=(',', ': ')
    ))


with open(inputfile) as inf:
    data = json.loads(inf.read())

printj(data['route']['content'])
