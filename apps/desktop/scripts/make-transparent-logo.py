from pathlib import Path
from PIL import Image

src = Path(r"f:\docker\Helm\img\helm 500x500.png")
alt = Path(
    r"C:\Users\robso\.cursor\projects\f-docker-Helm\assets\helm_500x500-d533e7d6-3739-4de5-9027-4426c548ada5.png"
)
if alt.exists() and alt.stat().st_size >= src.stat().st_size:
    src = alt

img = Image.open(src).convert("RGBA")
pixels = img.load()
w, h = img.size

for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
        if lum < 18:
            alpha = 0
        elif lum < 48:
            alpha = int(255 * (lum - 18) / 30)
        else:
            alpha = 255
        pixels[x, y] = (r, g, b, min(a, alpha))

outputs = [
    Path(r"f:\docker\Helm\apps\desktop\src\assets\helm-logo.png"),
    Path(r"f:\docker\Helm\apps\desktop\public\helm-logo.png"),
    Path(r"f:\docker\Helm\img\helm-logo-transparent.png"),
]

for out in outputs:
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, "PNG")
    print(f"{out} ({out.stat().st_size} bytes, {img.size[0]}x{img.size[1]})")
