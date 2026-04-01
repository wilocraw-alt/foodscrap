#!/usr/bin/env python3
"""
GitHub Actions용 국회도서관 식단표 수집 스크립트
"""

import requests
import re
import json
import os
import sys
import fitz
from datetime import datetime
from bs4 import BeautifulSoup

BASE_URL = "https://www.nanet.go.kr"
SEARCH_URL = f"{BASE_URL}/usermadang/notice/noticeList.do"
DETAIL_URL = f"{BASE_URL}/usermadang/notice/noticeDetail.do"
FILE_BASE = f"{BASE_URL}/attachfiles/gongji/"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_DIR, "data")
PDF_DIR = os.path.join(PROJECT_DIR, ".tmp")


def get_latest_menu_info():
    params = {"searchKeyCode": "title", "searchKeyWord": "주간식단표"}
    resp = requests.get(SEARCH_URL, params=params, timeout=15)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    for link in soup.select("a.detailLink"):
        title = link.get_text(strip=True)
        if "주간식단표" in title:
            seq = link.get("data-search-no-seq")
            date_match = re.search(
                r'(\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.?\s*[-_]\s*\d{1,2}\.\s*\d{1,2}\.?)', title
            )
            date_range = date_match.group(1) if date_match else ""
            return {"seq": seq, "title": title, "date_range": date_range}
    return None


def get_pdf_file_name(seq):
    resp = requests.post(
        DETAIL_URL,
        data={"searchNoSeq": seq},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=15,
    )
    resp.raise_for_status()
    match = re.search(r"newViewerCall\('([^']+\.pdf)'", resp.text)
    return match.group(1) if match else None


def download_pdf(file_name):
    os.makedirs(PDF_DIR, exist_ok=True)
    pdf_path = os.path.join(PDF_DIR, file_name)
    url = f"{FILE_BASE}{file_name}"
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    with open(pdf_path, "wb") as f:
        f.write(resp.content)
    return pdf_path


def extract_date_labels(page):
    """
    날짜 레이블 추출 → [(label, y_top), ...] 반환
    왼쪽 컬럼(x<100)에서 날짜+요일 블록 찾기
    """
    blocks = page.get_text("dict")["blocks"]
    date_entries = []

    for block in blocks:
        if "lines" not in block:
            continue
        bbox = block["bbox"]
        if bbox[0] > 100:
            continue

        full = ""
        for line in block["lines"]:
            for span in line["spans"]:
                full += span["text"]
        full = full.strip()

        if re.match(r'^\d{1,2}\.\d{1,2}$', full):
            date_entries.append(("date", full, bbox[1]))
        elif re.match(r'^\(?([가-힣])\)?$', full):
            day = full.strip("()")
            date_entries.append(("day", day, bbox[1]))
        elif re.match(r'^(\d{1,2})\s*\(([가-힣])\)', full):
            m = re.match(r'^(\d{1,2})\s*\(([가-힣])\)', full)
            date_entries.append(("combined", f"{m.group(1)}({m.group(2)})", bbox[1]))

    date_entries.sort(key=lambda x: x[2])

    # 날짜+요일 매칭
    labels = []
    i = 0
    while i < len(date_entries):
        kind, text, y = date_entries[i]
        if kind == "combined":
            labels.append((text, y))
            i += 1
        elif kind == "date":
            if i + 1 < len(date_entries) and date_entries[i + 1][0] == "day":
                combined = f"{text}({date_entries[i + 1][1]})"
                labels.append((combined, y))
                i += 2
            else:
                labels.append((text, y))
                i += 1
        elif kind == "day":
            labels.append((text, y))
            i += 1
        else:
            i += 1

    labels.sort(key=lambda x: x[1])
    return labels



def is_noise(text):
    """잡음 데이터 필터링"""
    if len(text) < 2 or len(text) > 60:
        return True
    if re.search(r'☏|₩|원|kcal|Kcal', text):
        return True
    if text in ["도서관식당", "박물관식당", "본관1식당", "본관2식당", "회관1식당", "회관2식당", "회관3식당"]:
        return True
    if "문의" in text or "6788" in text or "후생복지" in text:
        return True
    if any(kw in text for kw in ["알레르기", "식재료", "출입안내", "조기마감", "양해"]):
        return True
    return False

def parse_food_pdf(pdf_path):
    """PDF에서 도서관식당, 박물관식당 메뉴 추출"""
    doc = fitz.open(pdf_path)
    page = doc[0]
    blocks = page.get_text("dict")["blocks"]

    RESTAURANT_RANGES = {
        "도서관식당": (650, 732),
        "박물관식당": (732, 810),
    }

    date_labels = extract_date_labels(page)

    # 월 표시 보정: "31(화)" → "3.31(화)", "02(목)" → "4.02(목)" 등
    # 제목에서 월 정보 추출
    month_info = {}
    for label, _ in date_labels:
        m = re.match(r'(\d{1,2})\.(\d{1,2})\((.)\)', label)
        if m:
            month_info[m.group(3)] = m.group(1)  # 요일 → 월

    # 월이 빠진 날짜 보정
    corrected_labels = []
    for label, y in date_labels:
        m = re.match(r'^(\d{1,2})\((.)\)$', label)
        if m:
            day_num = m.group(1)
            day_char = m.group(2)
            # 이전 날짜에서 월 추정
            if corrected_labels:
                prev = corrected_labels[-1][0]
                pm = re.match(r'(\d{1,2})\.(\d{1,2})', prev)
                if pm:
                    month = pm.group(1)
                    label = f"{month}.{day_num}({day_char})"
        corrected_labels.append((label, y))

    date_labels = corrected_labels

    print(f"  감지된 날짜: {[d[0] for d in date_labels]}")

    if not date_labels:
        date_labels = [("날짜없음", 0)]

    # 날짜 구간 계산: 레이블 간 중간점을 경계로
    date_ranges = []
    boundaries = [0]
    for i in range(len(date_labels)):
        if i + 1 < len(date_labels):
            mid = (date_labels[i][1] + date_labels[i + 1][1]) / 2
        else:
            mid = 999
        boundaries.append(mid)

    for i, (label, _) in enumerate(date_labels):
        date_ranges.append((label, boundaries[i], boundaries[i + 1]))

    print(f"  구간:")
    for label, r1, r2 in date_ranges:
        print(f"    {label}: y={r1:.0f}-{r2:.0f}")

    # 결과 초기화
    result = {}
    for label, _, _ in date_ranges:
        result[label] = {"도서관식당": [], "박물관식당": []}

    # 도서관/박물관 메뉴 블록 수집 및 매칭
    for block in blocks:
        if "lines" not in block:
            continue
        bbox = block["bbox"]
        bx1, by1, bx2, by2 = bbox

        restaurant = None
        for name, (rx1, rx2) in RESTAURANT_RANGES.items():
            if rx1 <= bx1 <= rx2:
                restaurant = name
                break
        if not restaurant:
            continue

        texts = []
        for line in block["lines"]:
            for span in line["spans"]:
                t = span["text"].strip()
                if re.match(r'^\d[\d,\s]*[kK][cC][aA][lL]$', t.replace(" ", "")):
                    continue
                if "₩" in t or "원" in t:
                    continue
                if "☏" in t:
                    continue
                if not t:
                    continue
                texts.append(t)

        if not texts:
            continue

        combined = "".join(texts)
        # 잡음 필터링
        if is_noise(combined):
            continue
        block_center = (by1 + by2) / 2

        # 어떤 날짜 구간에 속하는지
        best_label = None
        for label, r_top, r_bottom in date_ranges:
            if r_top <= block_center <= r_bottom:
                best_label = label
                break

        if best_label and combined not in result[best_label][restaurant]:
            result[best_label][restaurant].append(combined)

    doc.close()

    for date_label in result:
        for restaurant in result[date_label]:
            result[date_label][restaurant] = merge_vertical_texts(
                result[date_label][restaurant]
            )

    return result


def merge_vertical_texts(texts):
    if not texts:
        return []
    result = []
    buffer = ""
    for text in texts:
        if len(text) == 1:
            buffer += text
        else:
            if buffer:
                result.append(buffer)
                buffer = ""
            result.append(text)
    if buffer:
        result.append(buffer)
    return result


def format_menu(data, target_restaurants=None):
    if target_restaurants is None:
        target_restaurants = ["도서관식당", "박물관식당"]
    lines = ["🍽️ 국회도서관 주간식단표", "=" * 40]
    for date_label, restaurants in data.items():
        has_menu = any(restaurants.get(r) for r in target_restaurants)
        if not has_menu:
            continue
        lines.append(f"\n📅 {date_label}")
        lines.append("-" * 30)
        for rest_name in target_restaurants:
            menus = restaurants.get(rest_name, [])
            if menus:
                lines.append(f"\n🏪 {rest_name}")
                for menu in menus:
                    lines.append(f"  • {menu}")
    return "\n".join(lines)


def main():
    print("🔍 국회도서관 최신 주간식단표 조회 중...")
    menu_info = get_latest_menu_info()
    if not menu_info:
        print("❌ 주간식단표를 찾을 수 없습니다.")
        sys.exit(1)

    seq = menu_info["seq"]
    title = menu_info["title"]
    date_range = menu_info["date_range"]
    print(f"📋 {title}")
    print(f"📅 {date_range}")

    file_name = get_pdf_file_name(seq)
    if not file_name:
        print("❌ PDF 파일을 찾을 수 없습니다.")
        sys.exit(1)

    print(f"📥 PDF 다운로드: {file_name}")
    pdf_path = download_pdf(file_name)

    print("🔄 PDF 파싱 중...")
    parsed_data = parse_food_pdf(pdf_path)

    days = []
    for day_label, restaurants in parsed_data.items():
        days.append({
            "day": day_label,
            "도서관식당": restaurants.get("도서관식당", []),
            "박물관식당": restaurants.get("박물관식당", []),
        })

    output = {
        "title": title,
        "date_range": date_range,
        "fetched_at": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "seq": seq,
        "file_name": file_name,
        "days": days,
    }

    os.makedirs(DATA_DIR, exist_ok=True)
    json_path = os.path.join(DATA_DIR, "menu.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n✅ menu.json 저장 완료: {json_path}")
    print("\n" + format_menu(parsed_data))

    try:
        os.remove(pdf_path)
        os.rmdir(PDF_DIR)
    except:
        pass


if __name__ == "__main__":
    main()
