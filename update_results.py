import json
import re
import urllib.request
import os
import datetime

def update_real_results():
    # El mundial de 2026 termina el 19 de Julio.
    # Evitamos que el script corra después del 20 de Julio de 2026.
    limit_date = datetime.date(2026, 7, 20)
    if datetime.date.today() > limit_date:
        print("La Copa Mundial 2026 ha finalizado. El script de actualización automática está desactivado.")
        return

    url = "https://en.wikipedia.org/wiki/2026_FIFA_World_Cup"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    req = urllib.request.Request(url, headers=headers)

    print("Downloading latest Wikipedia match data...")
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
    except Exception as e:
        print(f"Error downloading page: {e}")
        return

    # Paths relative to the project root
    fixtures_path = os.path.join("src", "data", "fixtures.json")
    results_src_path = os.path.join("src", "data", "real_results.json")
    results_pub_path = os.path.join("public", "real_results.json")

    if not os.path.exists(fixtures_path):
        print(f"Fixtures file not found at {fixtures_path}")
        return

    with open(fixtures_path, encoding="utf-8") as f:
        fixtures = json.load(f)

    def normalize_date_text(text):
        text = text.replace("&#160;", " ").replace("&nbsp;", " ").strip()
        text = re.sub(r'<[^>]*>', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        
        months = {
            "january": 1, "jan": 1, "february": 2, "feb": 2, "march": 3, "mar": 3,
            "april": 4, "apr": 4, "may": 5, "june": 6, "jun": 6, "july": 7, "jul": 7,
            "august": 8, "aug": 8, "september": 9, "sep": 9, "october": 10, "oct": 10,
            "november": 11, "nov": 11, "december": 12, "dec": 12
        }
        
        m1 = re.search(r'([A-Za-z]+)\s+(\d+),?\s*(\d{4})', text)
        if m1:
            m_name = m1.group(1).lower()
            day = int(m1.group(2))
            year = int(m1.group(3))
            month = months.get(m_name)
            if month:
                return f"{year:04d}-{month:02d}-{day:02d}"
                
        m2 = re.search(r'(\d+)\s+([A-Za-z]+)\s*(\d{4})', text)
        if m2:
            day = int(m2.group(1))
            m_name = m2.group(2).lower()
            year = int(m2.group(3))
            month = months.get(m_name)
            if month:
                return f"{year:04d}-{month:02d}-{day:02d}"
                
        return None

    def normalize_stadium_name(name):
        name = re.sub(r'<[^>]*>', ' ', name)
        name = name.replace("&#160;", " ").replace("&nbsp;", " ")
        name = name.replace("&amp;", "&")
        name = re.sub(r'\s+', ' ', name).strip().lower()
        name = name.replace("toronto stadium", "bmo field")
        return name

    score_pattern = re.compile(r'<th class="fscore"[^>]*>(.*?)</th>', re.S)

    parts = html.split('class="footballbox"')
    print(f"Found {len(parts) - 1} match boxes on Wikipedia.")

    played_results = {}

    for p in parts[1:]:
        score_m = score_pattern.search(p)
        if score_m:
            score_text_raw = score_m.group(1)
            score_text = re.sub(r'<[^>]*>', '', score_text_raw).strip()
            score_text_clean = re.sub(r'\(.*?\)', '', score_text).strip()
            score_text_clean = score_text_clean.replace("&#160;", " ").replace("&nbsp;", " ")
            score_text_clean = re.sub(r'\s+', ' ', score_text_clean).strip()
            
            # Check if score_text is a valid score (e.g. "2–0" or "2-0")
            score_match = re.match(r'^(\d+)\s*[\u2013-]\s*(\d+)$', score_text_clean)
            if score_match:
                home_score = int(score_match.group(1))
                away_score = int(score_match.group(2))
                
                # Extract date
                fdate_m = re.search(r'<div class="fdate">([^<]+)', p, re.S)
                date_str = None
                if fdate_m:
                    date_str = normalize_date_text(fdate_m.group(1))
                
                # Extract stadium
                fright_m = re.search(r'<div class="fright">(.*?)</div>', p, re.S)
                stadium_str = None
                if fright_m:
                    fright_text = re.sub(r'<[^>]*>', '', fright_m.group(1)).strip()
                    parts_fright = fright_text.split(',')
                    stadium_str = normalize_stadium_name(parts_fright[0])
                
                # Find matching fixture by date and stadium
                if date_str and stadium_str:
                    for f in fixtures:
                        f_date = f["date"]
                        f_stadium = normalize_stadium_name(f["stadium"])
                        if f_date == date_str and f_stadium == stadium_str:
                            match_num = f["num"]
                            
                            # Check if there is a penalty shootout score in the box
                            pen_m = re.search(r'<tr class="fgoals">.*?<th>(\d+)\s*[\u2013-]\s*(\d+)</th>', p, re.S)
                            if pen_m:
                                pen_home = int(pen_m.group(1))
                                pen_away = int(pen_m.group(2))
                                played_results[str(match_num)] = [home_score, away_score, pen_home, pen_away]
                            else:
                                played_results[str(match_num)] = [home_score, away_score]
                            break

    print(f"Extracted {len(played_results)} played matches with scores.")
    
    # Save the updated results to both source and public directories
    for path in [results_src_path, results_pub_path]:
        with open(path, "w", encoding="utf-8") as out_f:
            json.dump(played_results, out_f, indent=2)
        print(f"Successfully updated {path}!")

if __name__ == "__main__":
    update_real_results()
