import json
from pathlib import Path

path = Path('games.json')
data = json.loads(path.read_text(encoding='utf-8'))
updated = 0
for category in data.get('categories', []):
    for game in category.get('games', []):
        key = str(game.get('Link', '')).strip('/').split('/')[0]
        game['Orientation'] = 'portrait' if key == '2048' else 'landscape'
        updated += 1
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Updated {updated} games.')
