#!/usr/bin/env python
# coding: utf-8

from urllib import request
import urllib
import os
import re
import json
import time
import datetime
#pip3 install python-dateutil
import dateutil.parser
import sys

if len(sys.argv) > 1:
    pdf = str(sys.argv[1])
else:
    pdf = ""

DateTimeRegex = {
                'weekday month yearOrday yearORday hours:mins AMorPM':'\\b[A-Za-z]+\s+[A-Za-z]+\s+\d+\s+\d+\s+\d+\:\d+\s+[A-Z]+\\b',
                'weekday month yearORday yearORday hours:mins:secs AMorPM':'\\b[A-Za-z]+\s+[A-Za-z]+\s+\d+\s+\d+\s+\d+\:\d+\:\d+\s+[A-Z]+\\b',
                'yearORmonthORday-yearORmonthORday-yearORmonthORday:hours:mins:secs':'\\b\d+\-\d+\-\d+\:\d+\:\d+\:\d+\\b',
                'yearORmonthORday/yearORmonthORday/yearORmonthORday:hours:mins:secs':'\\b\d+\/\d+\/\d+\:\d+\:\d+\:\d+\\b',
                'yearORmonthORday-yearORmonthORday-yearORmonthORday-hours.mins.secs.millisecs':'\\b\d+\-\d+\-\d+\-\d+\.\d+\.\d+\.\d+\-\d+\\b',
                'yearORmonthORday/yearORmonthORday/yearORmonthORday-hours.mins.secs.millisecs':'\\b\d+\/\d+\/\d+\-\d+\.\d+\.\d+\.\d+\-\d+\\b',
                'yearORmonthORday-yearORmonthORday-yearORmonthORday-hours.mins.secs':'\\b\d+\-\d+\-\d+\-\d+\.\d+\.\d+\\b',
                'yearORmonthORday/yearORmonthORday/yearORmonthORday-hours.mins.secs':'\\b\d+\/\d+\/\d+\-\d+\.\d+\.\d+\\b',
                'yearORmonthORday-yearORmonthORday-yearORmonthORdayThours:mins:secs.millisecs':'\\b\d+\-\d+\-\d+[A-Za-z]+\d+\:\d+\:\d+\.\w+\\b',
                'yearORmonthORday-yearORmonthORday-yearORmonthORdayThours:mins:secs+millisecs':'\\b\d+\-\d+\-\d+[A-Za-z]+\d+\:\d+\:\d+\+\d+\\b',
                'yearORmonthORday-yearORmonthORday-yearORmonthORdayThours:mins:secs*millisecs':'\\b\d+\-\d+\-\d+[A-Za-z]+\d+\:\d+\:\d+\*\d+\+\d+\\b',
                'yearORmonthORday-yearORmonthORday-yearORmonthORday*hours:mins:secs:millisecs':'\\b\d+\-\d+\-\d+\*\d+\:\d+\:\d+\:\d+\\b',
                'yearORmonthORday-yearORmonthORday-yearORmonthORday*hours:mins:secs':'\\b\d+\-\d+\-\d+\*\d+\:\d+\:\d+\\b',
                'yearORmonthORday-yearORmonthORday-yearORmonthORdayThours:mins:secs':'\\b\d+\-\d+\-\d+[A-Za-z]+\d+\:\d+\:\d+\\b',
                'yearORmonthORday-yearORmonthORday-yearORmonthORday hours:mins:secs.millisecs':'\\b\d+\-\d+\-\d+\s+\d+\:\d+\:\d+\.\w+\\b',
                'yearORmonthORday/yearORmonthORday/yearORmonthORday hours:mins:secs:millisecs':'\\b\d+\/\d+\/\d+\s+\d+\:\d+\:\d+\:\w+\\b',
                'yearORmonthORday-yearORmonthORday-yearORmonthORday hours:mins:secs AMorPM':'\\b\d+\-\d+\-\d+\s+\d+\:\d+\:\d+\s+[A-Z]+\\b',
                'yearORmonthORday-yearORmonthORday-yearORmonthORday hours:mins:secs':'\\b\d+\-\d+\-\d+\s+\d+\:\d+\:\d+\\b',
                'yearORmonthORday/yearORmonthORday/yearORmonthORday hours:mins:secs AMorPM':'\\b\d+\/\d+\/\d+\s+\d+\:\d+\:\d+\s+[A-Z]+\\b',
                'yearORmonthORday/yearORmonthORday/yearORmonthORday hours:mins:secs':'\\b\d+\/\d+\/\d+\s+\d+\:\d+\:\d+\\b',
                'yearORmonthORday/yearORmonthORday/yearORmonthORday-hours:mins':'\\b\d+\/\d+\/\d+\-\d+\.\d+\\b',
                'yearORmonthORday-yearORmonthORday-yearORmonthORday-hours:mins':'\\b\d+\-\d+\-\d+\-\d+\.\d+\\b',
                'yearORmonthORday/yearORmonthORday/yearORmonthORday:hours:mins':'\\b\d+\/\d+\/\d+\:\d+\:\d+\\b',
                'yearORmonthORday-yearORmonthORday-yearORmonthORdayThours:mins':'\\b\d+\-\d+\-\d+[A-Za-z]+\d+\:\d+\\b',
                'yearORmonthORday-yearORmonthORday-yearORmonthORday*hours:mins':'\\b\d+\-\d+\-\d+\*\d+\:\d+\\b',
                'yearORmonthORday/yearORmonthORday/yearORmonthORday hours:mins':'\\b\d+\/\d+\/\d+\s+\d+\:\d+\\b',
                'yearORmonthORday/yearORmonthORday/yearORmonthORday hours:mins AMorPM':'\\b\d+\/\d+\/\d+\s+\d+\:\d+\s+[A-Za-z]+\\b',
                'yearORmonthORday-yearORmonthORday-yearORmonthORday hours:mins':'\\b\d+\-\d+\-\d+\s+\d+\:\d+\\b',
                'yearORmonthORday-yearORmonthORday-yearORmonthORday hours:mins AMorPM':'\\b\d+\-\d+\-\d+\s+\d+\:\d+\s+[A-Za-z]\\b',
                'yearORday/month/yearORday:hours:mins:secs AMorPM':'\\b\d+\/[A-Za-z]+\/\d+\:\d+\:\d+\:\d+\s+[A-Z]+\\b',
                'yearORday/month/yearORday:hours:mins:secs':'\\b\d+\/[A-Za-z]+\/\d+\:\d+\:\d+\:\d+\\b',
                'yearORday-month-yearORday:hours:mins:secs AMorPM':'\\b\d+\-[A-Za-z]+\-\d+\:\d+\:\d+\:\d+\s+[A-Z]+\\b',
                'yearORday-month-yearORday:hours:mins:secs':'\\b\d+\-[A-Za-z]+\-\d+\:\d+\:\d+\:\d+\\b',
                'month/yearORday/yearORday:hours:mins:secs AMorPM':'\\b[A-Za-z]+\/\d+\/\d+\:\d+\:\d+\:\d+\s+[A-Z]+\\b',
                'month/yearORday/yearORday:hours:mins:secs':'\\b[A-Za-z]+\/\d+\/\d+\:\d+\:\d+\:\d+\\b',
                'month-yearORday-yearORday:hours:mins:secs AMorPM':'\\b[A-Za-z]+\-\d+\-\d+\:\d+\:\d+\:\d+\s+[A-Z]+\\b',
                'month-yearORday-yearORday:hours:mins:secs':'\\b[A-Za-z]+\-\d+\-\d+\:\d+\:\d+\:\d+\\b',
                'yearORday/month/yearORday hours:mins:secs AMorPM':'\\b\d+\/[A-Za-z]+\/\d+\s+\d+\:\d+\:\d+\s+[A-Z]+\\b',
                'yearORday/month/yearORday hours:mins:secs':'\\b\d+\/[A-Za-z]+\/\d+\s+\d+\:\d+\:\d+\\b',
                'yearORday-month-yearORday hours:mins:secs AMorPM':'\\b\d+\-[A-Za-z]+\-\d+\s+\d+\:\d+\:\d+\s+[A-Z]+\\b',
                'yearORday-month-yearORday hours:mins:secs':'\\b\d+\-[A-Za-z]+\-\d+\s+\d+\:\d+\:\d+\\b',
                'month/yearORday/yearORday hours:mins:secs AMorPM':'\\b[A-Za-z]+\/\d+\/\d+\s+\d+\:\d+\:\d+\s+[A-Z]+\\b',
                'month/yearORday/yearORday hours:mins:secs':'\\b[A-Za-z]+\/\d+\/\d+\s+\d+\:\d+\:\d+\\b',
                'month-yearORday-yearORday hours:mins:secs AMorPM':'\\b[A-Za-z]+\-\d+\-\d+\s+\d+\:\d+\:\d+\s+[A-Z]+\\b',
                'month-yearORday-yearORday hours:mins:secs':'\\b[A-Za-z]+\-\d+\-\d+\s+\d+\:\d+\:\d+\\b',
                'yearORday month yearORday hours:mins:secs.millisecs':'\\b\d+\s+[A-Za-z]+\s+\d+\s+\d+\:\d+\:\d+\.\d+\\b',
                'month dayORyear hours:mins:secs +millisecs dayORyear':'\\b[A-Za-z]+\s+\d+\s+\d+\:\d+\:\d+\s+\+\d+\s+\d+\\b',
                'month dayORyear hours:mins:secs dayORyear':'\\b[A-Za-z]+\s+\d+\s+\d+\:\d+\:\d+\s+\d+\\b',
                'month dayORyear dayORyear hours:mins:secs AMorPM':'\\b[A-Za-z]+\s+\d+\s+\d+\s+\d+\:\d+\:\d+\s+[A-Z]+\\b',
                'month dayORyear dayORyear hours:mins:secs':'\\b[A-Za-z]+\s+\d+\s+\d+\s+\d+\:\d+\:\d+\\b',
                'month dayORyear hours:mins:secs +millisecs':'\\b[A-Za-z]+\s+\d+\s+\d+\:\d+\:\d+\s+\+\d+\\b',
                'dayORyear month dayORyear hours:mins:secs':'\\b\d+\s+[A-Za-z]+\s+\d+\s+\d+\:\d+\:\d+\\b',
                'month dayORyear hours:mins:secs':'\\b[A-Za-z]+\s+\d+\s+\d+\:\d+\:\d+\\b',
                'yearORmonthORday/yearORmonthORday/yearORmonthORday':'\\b\d+\/\d+\/\d+\*\d+\:\d+\:\d+\\b',
                'yearORday/month/yearORday:hours:mins AMorPM':'\\b\d+\/[A-Za-z]+\d+\:\d+\:\d+\s+[A-Za-z]+\\b',
                'yearORday/month/yearORday:hours:mins':'\\b\d+\/[A-Za-z]+\/\d+\:\d+\:\d+\\b',
                'yearORday-month-yearORday:hours:mins AMorPM':'\\b\d+\-[A-Za-z]+\-\d+\:\d+\:\d+\s+[A-Za-z]+\\b',
                'yearORday-month-yearORday:hours:mins':'\\b\d+\-[A-Za-z]+\-\d+\:\d+\:\d+\\b',
                'month-yearORday-yearORday:hours:mins AMorPM':'\\b[A-Za-z]+\-\d+\-\d+\:\d+\:\d+\s+[A-Za-z]+\\b',
                'month-yearORday-yearORday:hours:mins':'\\b[A-Za-z]+\-\d+\-\d+\:\d+\:\d+\\b',
                'month/yearORday/yearORday:hours:mins AMorPM':'\\b[A-Za-z]+\/\d+\/\d+\:\d+\:\d+\s+[A-Za-z]+\\b',
                'month/yearORday/yearORday:hours:mins':'\\b[A-Za-z]+\/\d+\/\d+\:\d+\:\d+\\b',
                'yearORday/month/yearORday hours:mins AMorPM':'\\b\d+\/[A-Za-z]+\/\d+\s+\d+\:\d+\s+[A-Za-z]+\\b',
                'yearORday/month/yearORday hours:mins':'\\b\d+\/[A-Za-z]+\/\d+\s+\d+\:\d+\\b',
                'yearORday-month-yearORday hours:mins AMorPM':'\\b\d+\-[A-Za-z]+\-\d+\s+\d+\:\d+\s+[A-Za-z]+\\b',
                'yearORday-month-yearORday hours:mins':'\\b\d+\-[A-Za-z]+\-\d+\s+\d+\:\d+\\b',
                'month/yearORday/yearORday hours:mins AMorPM':'\\b[A-Za-z]\/\d+\/\d+\s+\d+\:\d+\s+[A-Za-z]+\\b',
                'month/yearORday/yearORday hours:mins':'\\b[A-Za-z]\/\d+\/\d+\s+\d+\:\d+\\b',
                'month-yearORday-yearORday hours:mins AMorPM':'\\b[A-Za-z]+\-\d+\-\d+\s+\d+\:\d+\s+[A-Za-z]+\\b',
                'month-yearORday-yearORday hours:mins':'\\b[A-Za-z]+\-\d+\-\d+\s+\d+\:\d+\\b',
                'year month day hours:mins':'\\b\d+\s+[A-Za-z]+\s+\d+\s+\d+\:\d+\\b',
                'month day hours:mins year':'\\b[A-Za-z]+\s+\d+\s+\d+\:\d+\s+\d+\\b',
                'month day hours:mins':'\\b[A-Za-z]+\s+\d+\s+\d+\:\d+\\b',
                'month day year hours:mins AMorPM':'\\b[A-Za-z]+\s+\d+\s+\d+\s+\d+\:\d+\s+[A-Za-z]+\\b',
                'month day year hours:mins':'\\b[A-Za-z]+\s+\d+\s+\d+\s+\d+\:\d+\\b',
                'on weekday, month day, year at hours:mins AMorPM':'\\b[a-z]+\s+[A-Za-z]+\s+[A-Za-z]+\s+\d+\s+\d+\s+[a-z]+\s+\d+\:\d+\s+[A-Za-z]+\\b',
                'on month day, year, at hours:mins AMorPM':'\\b[a-z]+\s+[A-Za-z]+\s+\d+\s+\d+\s+[a-z]+\s+\d+\:\d+\s+[A-Za-z]+\\b'
                }

def preprocess(x):
    x = x.replace('\t',' ')
    x = x.replace('\n',' ')
    x = x.replace('(',' ')
    x = x.replace(')',' ')
    x = x.replace('[',' ')
    x = x.replace(']',' ')
    x = x.replace('{',' ')
    x = x.replace('}',' ')
    x = x.replace(',',' ')
    x = x.replace('"','')
    x = x.replace("'",'')
    return(x)

reg = '|'.join(DateTimeRegex.values())

def DateTimeExtractor(x):
    x = preprocess(x)
    DT = re.findall(reg,x)
    return(DT)

filenames_path = "filenames.txt"
#filenames_path = "filenames.txt"
s3_root = "https://flint-text.s3.amazonaws.com/"

def toUnixTime(time_list):
    new_list = []
    for t in time_list:
        try:
            unixtime = dateutil.parser.parse(t).timestamp()
            new_list.append(unixtime)
        except Exception:
            pass  
    return new_list

lines = []

with open(filenames_path) as fp:
    all_lines = [line.rstrip('\n') for line in fp]

for l in all_lines:
    if re.match(pdf, l):
        lines.append(l)

start_time = int(time.time())

for line in lines:       
    url = s3_root + line
    response = request.urlopen(url)
    raw_text = response.read().decode('utf8')
    stamps = DateTimeExtractor(raw_text)
    print(line)
    unix_stamps = toUnixTime(stamps)
    data = {
        "filename": line,
        "original_timestamps": stamps,
        "unix_timestamps": unix_stamps
    }
    obj = json.dumps(data)
    f = open(pdf + '-timestamps.json','a+')
    f.write(obj + ',') #delete the final comma from final text file
    f.close()

stop_time = int(time.time())
duration = str(stop_time - start_time)

print("finished in " + duration + " seconds")




