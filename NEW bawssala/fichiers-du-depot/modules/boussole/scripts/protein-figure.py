"""Crop figure 1c, *human laminin only*, from the actual 2022 SE paper, printed p. 4."""
from pathlib import Path
import hashlib, sys
import pymupdf as f
from PIL import Image
src=Path(sys.argv[1]); assert hashlib.sha256(src.read_bytes()).hexdigest()=='6e79980ce0ad2cf1b0fcdec09f02d1a4d2d9132dd5050b483c44bc6ee4b9e2d7'
d=f.open(src); im=d[3].get_pixmap(matrix=f.Matrix(2.8,2.8),clip=f.Rect(297,395,543,557),colorspace=f.csGRAY,alpha=False)
img=Image.frombytes('L',(im.width,im.height),im.samples);img.save(Path(__file__).resolve().parents[1]/'assets/bac-2022-laminine.png',optimize=True); print(img.size)
