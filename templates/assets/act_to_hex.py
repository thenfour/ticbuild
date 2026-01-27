# Usage: python act_to_hex.py palette.act 16
import sys

path = sys.argv[1]
limit = int(sys.argv[2]) if len(sys.argv) > 2 else None

data = open(path, "rb").read()

# ACT is commonly 768 bytes = 256 * RGB.
# Some versions have 4 extra bytes at end (772) storing count/transparency.
if len(data) < 768:
    raise SystemExit(f"File too small ({len(data)} bytes). Not a standard ACT?")

rgb = data[:768]
cols = [(rgb[i], rgb[i+1], rgb[i+2]) for i in range(0, 768, 3)]

if limit is not None:
    cols = cols[:limit]

for r,g,b in cols:
    print(f"#{r:02X}{g:02X}{b:02X}")
