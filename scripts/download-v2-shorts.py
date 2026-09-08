#!/usr/bin/env python3
"""Fetch the three public Eastern Health Cluster transformation videos and store mobile MP4 copies.

This runs only on the V2 preview branch. It prefers Telegram public mirrors for the two
long explainers and the public 24vids/X trail for the short employee clip. No runtime
request to LinkedIn is needed by the employee-facing site after this script succeeds.
"""

from __future__ import annotations

import html as html_lib
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path
from urllib.parse import quote, urljoin

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
MEDIA_DIR = ROOT / "public" / "media"
OFFICIAL_FILE = ROOT / "src" / "content" / "official.ts"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140 Safari/537.36"
SESSION = requests.Session()
SESSION.headers.update({"User-Agent": UA, "Accept-Language": "ar,en;q=0.8"})

TARGETS = [
    {
        "id": "employee-journey",
        "filename": "short-employee-journey.mp4",
        "telegram": [("NoufMashhour", "إعرف أكثر"), ("noufmashhour", "إجراءات الإنتقال")],
        "phrase": "إعرف أكثر",
        "linkedin": "https://ae.linkedin.com/posts/e1-cluster_%D9%81%D9%8A%D8%AF%D9%8A%D9%88-%D8%A7%D9%84%D8%AA%D8%AD%D9%88%D9%84%D8%A7%D9%84%D8%B5%D8%AD%D9%8A-%D8%AA%D8%AC%D9%85%D8%B9%D8%A7%D9%84%D8%B4%D8%B1%D9%82%D9%8A%D8%A9%D8%A7%D9%84%D8%B5%D8%AD%D9%8A-activity-7217597938082979841-ARjw",
    },
    {
        "id": "joining-benefits",
        "filename": "short-joining-benefits.mp4",
        "telegram": [("MOH_HR", "أهم مزايا الانضمام"), ("MOH_HR", "مزايا الانضمام")],
        "phrase": "أهم مزايا الانضمام",
        "linkedin": "https://ae.linkedin.com/posts/e1-cluster_%D9%81%D9%8A%D8%AF%D9%8A%D9%88-%D8%AA%D8%AC%D9%85%D8%B9%D8%A7%D9%84%D8%B4%D8%B1%D9%82%D9%8A%D8%A9%D8%A7%D9%84%D8%B5%D8%AD%D9%8A-activity-7219694525399674881-Va0B",
    },
    {
        "id": "we-transform",
        "filename": "short-we-transform.mp4",
        "telegram": [],
        "phrase": "بكم نتميز",
        "linkedin": "https://ae.linkedin.com/posts/e1-cluster_%D9%81%D9%8A%D8%AF%D9%8A%D9%88-%D8%AA%D8%AC%D9%85%D8%B9%D8%A7%D9%84%D8%B4%D8%B1%D9%82%D9%8A%D8%A9%D8%A7%D9%84%D8%B5%D8%AD%D9%8A-%D8%A7%D9%84%D8%AA%D8%AD%D9%88%D9%84%D8%A7%D9%84%D8%B5%D8%AD%D9%8A-activity-7218345360140734464-gg8C",
    },
]

MEDIA_RE = re.compile(r"https?://[^\s\"'<>\\]+?(?:\.mp4|\.m3u8)(?:\?[^\s\"'<>\\]*)?", re.I)
URL_RE = re.compile(r"https?://[^\s\"'<>]+", re.I)


def get(url: str) -> str:
    response = SESSION.get(url, timeout=30)
    print(f"GET {response.status_code} {url}")
    response.raise_for_status()
    return response.text


def clean_markup(raw: str) -> str:
    raw = html_lib.unescape(raw)
    raw = raw.replace("\\/", "/")
    raw = raw.replace("\\u0026", "&")
    return raw


def media_urls(raw: str) -> list[str]:
    return list(dict.fromkeys(MEDIA_RE.findall(clean_markup(raw))))


def telegram_media(channel: str, query: str) -> str | None:
    url = f"https://t.me/s/{channel}?q={quote(query)}"
    raw = get(url)
    soup = BeautifulSoup(raw, "html.parser")
    wraps = soup.select(".tgme_widget_message_wrap")
    query_head = query.split()[0]
    ordered = sorted(wraps, key=lambda node: query_head not in node.get_text(" ", strip=True))

    for wrap in ordered:
        block = str(wrap)
        urls = media_urls(block)
        if urls:
            print(f"Telegram match {channel}: {query} -> {urls[0][:120]}")
            return urls[0]
        for node in wrap.find_all(True):
            for value in node.attrs.values():
                values = value if isinstance(value, list) else [value]
                for candidate in values:
                    if not isinstance(candidate, str):
                        continue
                    found = media_urls(candidate)
                    if found:
                        return found[0]

    # Search pages usually contain only matching posts, so a page-level video URL is a safe fallback.
    urls = media_urls(raw)
    if urls:
        print(f"Telegram page fallback {channel}: {query} -> {urls[0][:120]}")
        return urls[0]
    return None


def nearby_links(raw: str, phrase: str, base: str) -> list[str]:
    normalized = clean_markup(raw)
    positions = [m.start() for m in re.finditer(re.escape(phrase), normalized, flags=re.I)]
    chunks = []
    for pos in positions[:5]:
        chunks.append(normalized[max(0, pos - 12000): pos + 12000])
    if not chunks:
        chunks = [normalized]

    links: list[str] = []
    for chunk in chunks:
        soup = BeautifulSoup(chunk, "html.parser")
        for tag in soup.find_all(href=True):
            href = urljoin(base, tag.get("href"))
            if href.startswith("http"):
                links.append(href)
        links.extend(URL_RE.findall(chunk))

    def score(url: str) -> tuple[int, int]:
        lowered = url.lower()
        priority = 0
        if "video.twimg.com" in lowered or ".mp4" in lowered: priority += 100
        if "x.com/" in lowered or "twitter.com/" in lowered: priority += 60
        if "/status/" in lowered: priority += 40
        if "24vids.com" in lowered and ("video" in lowered or "watch" in lowered): priority += 30
        if "linkedin.com" in lowered: priority += 10
        return (-priority, len(url))

    return list(dict.fromkeys(sorted(links, key=score)))


def discover_24vids(phrase: str) -> list[str]:
    base = "https://www.24vids.com/channel/e1_cluster"
    try:
        raw = get(base)
    except Exception as exc:
        print(f"24vids channel unavailable: {exc}")
        return []

    direct = media_urls(raw)
    if direct and phrase in clean_markup(raw):
        # Keep direct media first; page links below are tried if the first direct asset is not our target.
        candidates = direct.copy()
    else:
        candidates = []
    candidates.extend(nearby_links(raw, phrase, base))
    return list(dict.fromkeys(candidates))[:20]


def ytdlp_download(url: str, output: Path) -> bool:
    command = [
        "yt-dlp",
        "--no-playlist",
        "--merge-output-format", "mp4",
        "-f", "bv*[height<=1080]+ba/b[height<=1080]/b",
        "-o", str(output),
        url,
    ]
    print("yt-dlp:", url)
    result = subprocess.run(command, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    print(result.stdout[-3500:])
    return result.returncode == 0 and output.exists() and output.stat().st_size > 100_000


def direct_download(url: str, output: Path) -> bool:
    try:
        if ".m3u8" in url.lower():
            result = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", url, "-c", "copy", str(output)])
            return result.returncode == 0 and output.exists() and output.stat().st_size > 100_000
        with SESSION.get(url, stream=True, timeout=60) as response:
            print(f"MEDIA {response.status_code} {response.headers.get('content-type')} {url[:140]}")
            response.raise_for_status()
            with output.open("wb") as handle:
                for chunk in response.iter_content(1024 * 1024):
                    if chunk:
                        handle.write(chunk)
        return output.stat().st_size > 100_000
    except Exception as exc:
        print(f"Direct download failed: {exc}")
        return False


def transcode(source: Path, final: Path) -> None:
    final.parent.mkdir(parents=True, exist_ok=True)
    command = [
        "ffmpeg", "-y", "-loglevel", "error", "-i", str(source),
        "-vf", "scale='min(720,iw)':-2",
        "-c:v", "libx264", "-preset", "medium", "-crf", "25",
        "-c:a", "aac", "-b:a", "96k",
        "-movflags", "+faststart",
        str(final),
    ]
    subprocess.run(command, check=True)
    if final.stat().st_size < 100_000:
        raise RuntimeError(f"Encoded file is unexpectedly small: {final}")
    print(f"Saved {final.relative_to(ROOT)} ({final.stat().st_size / 1024 / 1024:.1f} MB)")


def fetch_target(target: dict[str, object]) -> Path:
    final = MEDIA_DIR / str(target["filename"])
    if final.exists() and final.stat().st_size > 100_000:
        print(f"Already present: {final}")
        return final

    with tempfile.TemporaryDirectory() as tmpdir:
        raw_file = Path(tmpdir) / "source.mp4"

        for channel, query in target["telegram"]:  # type: ignore[index]
            try:
                url = telegram_media(str(channel), str(query))
                if url and direct_download(url, raw_file):
                    transcode(raw_file, final)
                    return final
            except Exception as exc:
                print(f"Telegram strategy failed for {channel}/{query}: {exc}")

        for candidate in discover_24vids(str(target["phrase"])):
            raw_file.unlink(missing_ok=True)
            if media_urls(candidate):
                ok = direct_download(media_urls(candidate)[0], raw_file)
            else:
                ok = ytdlp_download(candidate, raw_file)
            if ok:
                transcode(raw_file, final)
                return final

        # Last resort: try the official LinkedIn page through yt-dlp. This may fail if LinkedIn changes markup.
        raw_file.unlink(missing_ok=True)
        if ytdlp_download(str(target["linkedin"]), raw_file):
            transcode(raw_file, final)
            return final

    raise RuntimeError(f"Could not retrieve {target['id']}")


def update_local_paths() -> None:
    text = OFFICIAL_FILE.read_text(encoding="utf-8")
    for target in TARGETS:
        target_id = re.escape(str(target["id"]))
        local_path = f"/media/{target['filename']}"
        pattern = re.compile(rf'(id:\s*"{target_id}"[\s\S]*?localSrc:\s*)null')
        text, count = pattern.subn(rf'\1"{local_path}"', text, count=1)
        if count != 1:
            # Already wired is also valid.
            if local_path not in text:
                raise RuntimeError(f"Could not wire localSrc for {target['id']}")
    OFFICIAL_FILE.write_text(text, encoding="utf-8")


def main() -> int:
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    failures = []
    for target in TARGETS:
        try:
            fetch_target(target)
        except Exception as exc:
            failures.append(f"{target['id']}: {exc}")
            print(f"FAILED {target['id']}: {exc}")

    if failures:
        print("\nDownload failures:")
        print("\n".join(failures))
        return 1

    update_local_paths()
    return 0


if __name__ == "__main__":
    sys.exit(main())
