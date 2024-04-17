import json
from pathlib import Path
import argparse
from typing import Dict, List
import re
import logging
import sys

logging.basicConfig(level=logging.INFO)

def filterEvents(events : List, event_type:str) -> List:
    ret = []
    for e in events:
        if e["name"]==event_type:
            ret.append(e)

    return ret

def outputCsv(filename: str, results : Dict):
    with open(filename, "w") as f:
        header = '"team", "init_x", "init_y", "0", "1", "2", "3", "4", "5", "6", "7"\n'
        f.write(header)
        for r in results:
            f.write(f"{r["team"]}, {r["pos"]["x"]}, {r["pos"]["y"]}")
            for i in range(0,8):
                if r["notes"].get(i):
                    f.write(f", {r["notes"].get(i)}")
            f.write("\n")

def main(cmd_args : List):
    #-----------------------
    #---- Parse arguments
    #-----------------------
    parser = argparse.ArgumentParser()
    parser.add_argument("--path", type=str, required=True)
    parser.add_argument("--file", type=str, required=True)
    parser.add_argument("--team", type=int)
    args = parser.parse_args(cmd_args)

    agg_results = []
    p = Path(args.path)
    jfiles = [x for x in p.iterdir() if x.suffix==".json"]
    for f in jfiles:
        m = re.match(r'^\w+_\d+_\w+_\w+$', f.stem)
        if(m):
            with open(str(f), 'r') as file:
                json_results=json.load(file)
                if len(json_results["autopaths"])==0:
                    continue

                init = filterEvents(json_results["autopaths"], 'init')[0]
                pickups = filterEvents(json_results["autopaths"], 'pickup')
                center = {n["noteId"]:n["time"] for n in pickups if n["noteId"] in range(3,8)}
                
                agg_results.append({"team": json_results["team"], 
                                    "pos":init["npos"], 
                                    "notes": center})
                print(agg_results)
                outputCsv(args.file, agg_results)
        else:
            logging.warning(f"Unrecognized naming convention. Ignoring file [{f}]")
            
if __name__=="__main__":
    main(sys.argv[1:])