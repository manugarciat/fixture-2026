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
    results_path = os.path.join("src", "data", "real_results.json")

    if not os.path.exists(fixtures_path):
        print(f"Fixtures file not found at {fixtures_path}")
        return

    with open(fixtures_path, encoding="utf-8") as f:
        fixtures = json.load(f)

    # Team name normalizer map
    team_map = {
        "Czech Republic": "Czechia",
        "South Korea": "Korea Republic",
        "Ivory Coast": "Cote d'Ivoire",
        "Côte d'Ivoire": "Cote d'Ivoire",
        "DR Congo": "Congo DR",
        "Iran": "IR Iran",
        "Turkey": "Turkiye",
        "Türkiye": "Turkiye",
        "Cape Verde": "Cabo Verde",
        "Curaçao": "Curacao"
    }

    def normalize_team(name):
        name = name.replace("&#160;", " ").replace("&nbsp;", " ")
        name = re.sub(r'\s+', ' ', name).strip()
        return team_map.get(name, name)

    home_pattern = re.compile(r'<th class="fhome"[^>]*>(.*?)</th>', re.S)
    score_pattern = re.compile(r'<th class="fscore"[^>]*>(.*?)</th>', re.S)
    away_pattern = re.compile(r'<th class="faway"[^>]*>(.*?)</th>', re.S)

    parts = html.split('class="footballbox"')
    print(f"Found {len(parts) - 1} match boxes on Wikipedia.")

    played_results = {}

    for p in parts[1:]:
        home_m = home_pattern.search(p)
        score_m = score_pattern.search(p)
        away_m = away_pattern.search(p)
        
        if home_m and score_m and away_m:
            home_name = normalize_team(re.sub(r'<[^>]*>', '', home_m.group(1)))
            away_name = normalize_team(re.sub(r'<[^>]*>', '', away_m.group(1)))
            score_text = re.sub(r'<[^>]*>', '', score_m.group(1)).strip()
            
            # Check if score_text is a valid score (e.g. "2–0" or "2-0")
            score_match = re.match(r'^(\d+)\s*[\u2013-]\s*(\d+)$', score_text)
            if score_match:
                home_score = int(score_match.group(1))
                away_score = int(score_match.group(2))
                
                # Match against fixtures
                for f in fixtures:
                    if f["group"] is not None:
                        f_home = normalize_team(f["home"])
                        f_away = normalize_team(f["away"])
                        
                        if (f_home == home_name and f_away == away_name) or (f_home == away_name and f_away == home_name):
                            match_num = f["num"]
                            if f_home == home_name:
                                played_results[str(match_num)] = [home_score, away_score]
                            else:
                                played_results[str(match_num)] = [away_score, home_score]
                            break

    print(f"Extracted {len(played_results)} played matches with scores.")
    
    # Save the updated results
    with open(results_path, "w", encoding="utf-8") as out_f:
        json.dump(played_results, out_f, indent=2)
    print(f"Successfully updated {results_path}!")

if __name__ == "__main__":
    update_real_results()
