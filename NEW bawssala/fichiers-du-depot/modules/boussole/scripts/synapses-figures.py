"""تحضير الرسوم من نسخة الموضوع المبينة في دليل المصدر. تحتاج إلى بايموبدف وبيلّو.
الاستعمال: python3 scripts/figures.py path/to/original.pdf
"""
import sys, hashlib, io
from pathlib import Path
import pymupdf as fitz
from PIL import Image, ImageDraw, ImageFont
source=Path(sys.argv[1]);assert hashlib.sha256(source.read_bytes()).hexdigest()=='6e79980ce0ad2cf1b0fcdec09f02d1a4d2d9132dd5050b483c44bc6ee4b9e2d7'
doc=fitz.open(source);out=Path(__file__).resolve().parents[1]/'assets';out.mkdir(exist_ok=True)
def clip(page,rect):
 pm=doc[page].get_pixmap(matrix=fitz.Matrix(2.1,2.1),clip=fitz.Rect(*rect),colorspace=fitz.csGRAY,alpha=False)
 return Image.frombytes('L',(pm.width,pm.height),pm.samples)
def save(im,n): im.save(out/(n+'.png'),optimize=True)
a=clip(1,(43,300,550,580));save(a.crop((617,8,1058,506)),'bac-2022-reseau')
# التسجيلات الثلاثة في كل سطر، بنفس ترتيب الأجهزة في الامتحان (ج1، ج2، ج3).
for r,(y0,y1) in enumerate([(84,187),(190,293),(296,396),(400,502)],1):
 for c,(x0,x1,axis) in enumerate([(309,453,347),(164,306,199),(17,161,54)],1):
  tile=a.crop((x0,y0,x1,y1));dr=ImageDraw.Draw(tile)
  # اسم وحدة المحور مكتوب بالعربية في عنوان الجدول بدلا من الاختصار اللاتيني في كل تسجيل.
  dr.rectangle((axis-x0+4,4,axis-x0+31,25),fill='white')
  save(tile,f'trace-{r}{c}')
b=clip(2,(48,88,546,410)).convert('RGB');dr=ImageDraw.Draw(b)
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',17)
# مفاتيح تحريرية بدل الرموز الأجنبية فقط. لا تنقل الأسهم أو القنوات أو الحويصلات.
def tag(rect,num):
 x,y,X,Y=rect;dr.rectangle(rect,fill='white');cx=(x+X)//2;cy=(y+Y)//2
 dr.rounded_rectangle((cx-9,cy-10,cx+9,cy+10),radius=3,fill='#245548');dr.text((cx,cy),str(num),font=f,anchor='mm',fill='white',stroke_width=0)
for rect,n in [((924,133,968,157),1),((943,211,1020,244),2),((759,383,795,408),7),((199,36,240,59),1),((615,196,660,222),1),((254,211,331,245),2),((201,290,228,314),3),((595,291,664,314),6),((383,351,418,374),4),((421,416,498,448),5),((594,378,669,410),2),((515,436,541,457),3)]:tag(rect,n)
save(b.crop((708,22,1031,517)),'bac-2022-a');save(b.crop((16,22,691,518)),'bac-2022-b')
