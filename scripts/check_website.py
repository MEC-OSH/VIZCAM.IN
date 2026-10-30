#!/usr/bin/env python3
"""VIZCAM launch checks. Standard library only; checks committed files, not Google indexing."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse
import json
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
CANONICAL = "https://www.vizcam.in/"
WHATSAPP = "918943854151"
errors = []

def check(condition, message):
    if not condition:
        errors.append(message)
        print("FAIL:", message)
    else:
        print("PASS:", message)

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.images = []
        self.links = []
        self.meta = []
        self.forms = []
        self.title_count = 0
        self.h1_count = 0
        self.viewport = False
        self.local_refs = []
    def handle_starttag(self, tag, items):
        a = dict(items)
        if a.get("id"):
            self.ids.append(a["id"])
        if tag == "meta":
            self.meta.append(a)
        if tag == "h1":
            self.h1_count += 1
        if tag == "title":
            self.title_count += 1
        if tag == "form":
            self.forms.append(a)
        if tag == "img":
            self.images.append(a)
        if tag == "a":
            self.links.append(a)
        if tag == "meta" and a.get("name") == "viewport":
            self.viewport = True
        for key in ("href", "src"):
            value = a.get(key)
            if value and value[0] != "#" and not re.match(r"^(?:https?:|mailto:|tel:|data:|javascript:|//)", value, re.I):
                self.local_refs.append(value)
    handle_startendtag = handle_starttag

def parse(filename):
    p = PageParser()
    p.feed((ROOT / filename).read_text(encoding="utf-8"))
    return p

home = parse("index.html")
admin = parse("admin.html")
html = (ROOT / "index.html").read_text(encoding="utf-8")
script = (ROOT / "js/script.js").read_text(encoding="utf-8")
css = (ROOT / "css/styles.css").read_text(encoding="utf-8")

for name, page in (("homepage", home), ("admin", admin)):
    check(len(page.ids) == len(set(page.ids)), f"{name}: all element IDs are unique")
    for image in page.images:
        check("alt" in image, f"{name}: alt text exists for {image.get('src','unknown')}")
    for item in page.local_refs:
        path = urlparse(item).path.lstrip("/")
        check((path == "" and item == "/" and (ROOT/"index.html").is_file()) or (bool(path) and (ROOT / unquote(path)).is_file()), f"{name}: {item} exists")

check(home.viewport, "homepage has a responsive viewport")
check(home.h1_count == 1, "homepage has exactly one H1")
check(home.title_count == 1, "homepage has exactly one title")
check(all("width" in x and "height" in x for x in home.images),
      "homepage images have explicit intrinsic dimensions")
check(not any(m.get("name") == "robots" and "noindex" in m.get("content","") for m in home.meta),
      "homepage does not forbid indexing")
check(any(m.get("name") == "robots" and "noindex" in m.get("content","") for m in admin.meta),
      "quotation administration is marked noindex")
check(any(a.get("rel") == "canonical" and a.get("href") == CANONICAL for a in home.links) or
      bool(re.search(r'<link[^>]+rel="canonical"[^>]+href="'+re.escape(CANONICAL)+'"', html)),
      "homepage canonical is www.vizcam.in")

def meta_value(attr, val):
    return next((m.get("content") for m in home.meta if m.get(attr) == val), None)

check(bool(meta_value("name","description")), "homepage has a meta description")
for prop in ("og:title","og:description","og:url","og:image","og:image:width","og:image:height"):
    check(bool(meta_value("property", prop)), f"Open Graph {prop} exists")
ogimage = meta_value("property","og:image") or ""
check(ogimage.startswith(CANONICAL) and (ROOT / ogimage[len(CANONICAL):]).is_file(),
      "Open Graph image is published in repository")

for anchor in home.links:
    href = anchor.get("href", "")
    if href.startswith("#"):
        check(href[1:] in home.ids, f"anchor {href} points to an existing section")

check(bool(home.forms), "visitor enquiry form exists")
check('cdn-cookieyes.com/client_data/014019ae73df6d6fc66768e0/script.js' in html, "CookieYes tag exists")
check('G-72FYFHPDTC' in html, "GA4 measurement ID exists")
check(html.find('js/ga4-init.js') < html.find('id="cookieyes"') < html.find('googletagmanager.com/gtag/js?id='), "Consent scripts load in the expected order")
check(all('src="'+asset+'"' in html for asset in (
  'assets/vizcam-cctv-camera-types-720.webp',
  'assets/vizcam-poster-cctv-repair-900.webp',
  'assets/vizcam-poster-cctv-installation-900.webp',
  'assets/vizcam-poster-home-security-900.webp',
  'assets/vizcam-poster-family-security-900.webp'
)), "Optimized display images are used")
check(WHATSAPP in html and WHATSAPP in script, "WhatsApp number is consistent")
check("showModal()" in script and "data-product-details" in html,
      "product details dialog is wired up")
check("data-poster-carousel" in html and "data-product-slider" in html,
      "poster and product galleries are present")
check("grid-template-columns:repeat(2,minmax(0,1fr))" in css,
      "two-column product layout exists")

robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
check("Sitemap: "+CANONICAL+"sitemap.xml" in robots, "robots.txt advertises the sitemap")
check("Disallow: /" not in robots, "robots.txt does not block homepage")
xml = ET.parse(ROOT/"sitemap.xml")
ns = {"s":"http://www.sitemaps.org/schemas/sitemap/0.9"}
locs = [n.text for n in xml.findall(".//s:loc",ns)]
check(CANONICAL in locs, "sitemap contains canonical homepage")
check(not any("admin.html" in (u or "") for u in locs), "sitemap excludes admin")

scripts = re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>([\s\S]*?)</script>',html)
check(bool(scripts), "homepage includes schema.org JSON-LD")
for raw in scripts:
    data = json.loads(raw)
    check(data.get("@type") in ("LocalBusiness","Organization"), "JSON-LD identifies VIZCAM")

if errors:
    print(f"\n{len(errors)} issue(s) detected.")
    sys.exit(1)
print("\nVIZCAM repository launch checks passed.")
print("Note: this is not a live Google/Bing indexing or PageSpeed Insights verification.")
