from typing import Dict, List
from urllib.request import Request, urlopen
from urllib.error import URLError
from bs4 import SoupStrainer, BeautifulSoup
import logging
import re
import pathlib
import time
import argparse
import sys
import json

logging.getLogger().setLevel(logging.INFO)

event_uri_prefix = "https://www.thebluealliance.com/event" 
match_uri_prefix = "https://www.thebluealliance.com/match" 
hdr = { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'}

top_dir = pathlib.Path(__file__).parent.parent.resolve()
event_info_path = top_dir / "static" / "data" / "events"

def request(url):
    response = ""
    try:
        req = Request(url, headers=hdr)
        logging.info(f"Attempting to download: {url}")
        response = urlopen(req)
    except URLError as e:
        if hasattr(e, 'reason'):
            print('We failed to reach a server.')
            print('Reason: ', e.reason)
        elif hasattr(e, 'code'):
            print('The server couldn\'t fulfill the request.')
            print('Error code: ', e.code)

        sys.exit(-1)
    return response

def requestMatchInfo(event, id):
    match_id=f"{event}_qm{id}"
    response = request(f"{match_uri_prefix}/{match_id}")
    
    #-----------------------
    #---- Parse match summary
    #-----------------------
    dom = BeautifulSoup(response, "html.parser")
    summary_table = dom.find_all(id=f"match-table-{match_id}")
    
    links = summary_table[0].find_all("a")  
    teams = []
    for l in links:
        m = re.match(r'^/team/(\d+)/(\d+)', l["href"])
        if m:
            teams.append(int(m.group(1)))

    if(len(teams)!=6):
        raise RuntimeError("Unexpected number of teams in the match data")

    red = teams[0:3]
    blue = teams[3:]
    
    #-----------------------
    #---- Parse youtube videos
    #-----------------------
    videos = []
    iframes = dom.find_all("iframe")
    for f in iframes:
        m = re.match(r'.*?youtube.com/embed/(.*)$', f["src"])
        if m:
            videos.append(f"https://www.youtube.com/v/{m.group(1)}")


    return {"red":red, "blue":blue, "videos":videos}

def getEventInfo(event):
    #-----------------------
    #---- Gen event information
    #-----------------------
    response = request(f"{event_uri_prefix}/{event}")
    
    #-----------------------
    #---- Parse data
    #-----------------------
    qual_table_only = SoupStrainer(id="qual-match-table")
    qual_table = BeautifulSoup(response, "html.parser", parse_only=qual_table_only)
    
    links = qual_table.find_all("a")  
    ids = []
    for l in links:
        if l.string is None:
            continue
        m = re.match(r'^\s*Quals\s*(\d+)\s*$', l.string)
        if m:
            ids.append(int(m.group(1)))

    nmatches=max(ids)
    return nmatches

def generateEventFile(event_id : str, match_info : Dict) -> None:
    data = {
        "quals" : match_info,
        "elims" : {}
    }
    with open(event_info_path / f"event_{event_id}.json", "w") as f:
        f.write(json.dumps(data, indent=3))

def main(cmd_args : List):

    #-----------------------
    #---- Parse arguments
    #-----------------------
    parser = argparse.ArgumentParser()
    parser.add_argument("--event", type=str, required=True)
    parser.add_argument("--delay", type=float, default="1.5")
    args = parser.parse_args(cmd_args)

    #-----------------------
    #---- Gen event information
    #-----------------------
    num_qual_matches = getEventInfo(args.event)

    qmatch_info = {}
    for i in range(1, num_qual_matches+1):
        m = requestMatchInfo(args.event, i)
        qmatch_info[i] = m
        time.sleep(args.delay)

    generateEventFile(args.event, qmatch_info)

if __name__=="__main__":
    args = ["--event", "2023hop"]
    main(args)
 