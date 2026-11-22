import sys,json
sys.path.insert(0,'.next/qa-fonts')
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
f=instantiateVariableFont(TTFont('.next/static/media/4a0b7dd978568ff2-s.p.3fofz6dws3mg0.woff2'),{'wght':900})
glyphs=f.getGlyphSet(); cmap=f.getBestCmap(); out={}
for word in ['INFINITE','UNIVERSE','FRAME','CREATE','VISION','BEYOND']:
 names=[cmap[ord(c)] for c in word]; width=sum(glyphs[n].width-80 for n in names)+80; x=(9500-width)/2; paths=[]
 for n in names:
  pen=SVGPathPen(glyphs); glyphs[n].draw(TransformPen(pen,(1,0,0,-1,x,1550))); paths.append(pen.getCommands()); x+=glyphs[n].width-80
 out[word]=paths
with open('src/content/glyphs.json','w') as file: json.dump(out,file)
