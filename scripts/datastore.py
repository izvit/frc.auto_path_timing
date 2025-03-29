# app.py
from flask import Flask, request, jsonify
from flask_cors import cross_origin
import  logging
import argparse
import random
import sys
import json
from pathlib import Path


def genRandHash():
    return f'{random.getrandbits(64):016x}'

logging.basicConfig(level=logging.INFO)

output_dir = Path("./")

app = Flask(__name__)


@app.post("/autopaths")
@cross_origin()
def add_auto():
    if request.is_json:
        result = request.get_json()

        fields = result.keys()
        keys = ["event", "team", "match"]
        for k in keys:
            if k not in fields or result[k] is None:
                 return {f"error": "Invalid/Missing field {k}"}, 415
        
        file = output_dir / f"{result["event"]}_{result["team"]}_{result["match"]}_{genRandHash()}.json"
        with open(file, "w") as f:
            f.write(json.dumps(result))

        return {'success' : 200}
    return {"error": "Request must be JSON"}, 415


if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument("-o", "--outdir", type=str, required=True)
    args = parser.parse_args(sys.argv[1:])
    output_dir = Path(args.outdir)

    app.run()
