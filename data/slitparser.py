import json

randomColors = {'1': ['#E27D60', '#85DCBA', '#E8A87C', '#C38D9E', '#41B3A3']}

inputfile = 'template.slit'

oObject = {'id': None, 'properties': {}, 'features': [], 'type': 'FeatureCollection'}

feature = None
rColor = 0
with open(inputfile) as inf:
    for line in inf.readlines():
        print(line)

        sline = line.split(':')

        if not feature:
            if sline[0] == 'id':
                oObject['id'] = sline[1].strip()
            elif sline[0] == 'traveltitle':
                oObject['properties']['title'] = sline[1].strip()
            elif sline[0] == 'showTimeline':
                oObject['properties']['showTimeline'] = sline[1].strip()
            elif sline[0] == 'showTrack':
                oObject['properties']['showTrack'] = sline[1].strip()
            elif sline[0] == 'units':
                oObject['properties']['units'] = sline[1].strip()
            elif sline[0] == 'showCalendar':
                oObject['properties']['showCalendar'] = sline[1].strip()
            elif sline[0] == 'baselayer':
                oObject['properties']['baselayer'] = sline[1].strip()
            elif sline[0] == 'travelaverage':
                oObject['properties']['avaerage'] = float(sline[1].strip())

        if sline[0] == 'title':
            if feature:
                oObject['features'].append(feature)
            feature = {"type": "Feature", "properties": {"title": sline[1].strip()}}
        elif sline[0] == 'date' and sline[1].strip():
            feature["properties"]["date"] = sline[1].strip()
        elif sline[0] == 'color' and sline[1].strip():
            if sline[1].strip().startswith('random'):
                feature["properties"]["color"] = randomColors[sline[1].strip()[-1]][rColor]
                rColor += 1
            else:
                feature["properties"]["color"] = sline[1].strip()
        elif sline[0] == 'average' and sline[1].strip():
            feature["properties"]["average"] = float(sline[1].strip())
        elif sline[0] == 'startTime' and sline[1].strip():
            feature["properties"]["startTime"] = sline[1].strip()
        elif sline[0] == 'endTime' and sline[1].strip():
            feature["properties"]["endTime"] = sline[1].strip()
        elif sline[0] == 'text' and sline[1].strip():
            feature["properties"]["text"] = sline[1].strip().replace('\\n', '\n')
        elif sline[0] == 'geometry' and sline[1].strip():
            print(line.split(':', 1)[1].strip())
            feature['geometry'] = json.loads(line.split(':', 1)[1].strip())

    if feature:
        oObject['features'].append(feature)

# print(oObject)

with open(oObject['id']+'.geojson', 'w') as outf:
    outf.write(json.dumps(
        oObject,
        indent=4,
        separators=(',', ': ')
    ))
