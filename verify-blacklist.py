import urllib.request, urllib.error, json, sys, os
os.environ['http_proxy'] = ''  # 避免 proxy 干擾

secret = 'shrimp-boss-2026-v2'

for endpoint in ['daily-pick', 'after-market']:
    url = f'https://ai-stock-radar-tau.vercel.app/api/cron/{endpoint}'
    req = urllib.request.Request(url, headers={'Authorization': f'Bearer {secret}'})
    print(f'\n===== {endpoint} =====')
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            data = r.read().decode('utf-8', errors='replace')
            j = json.loads(data)
            print('Status:', r.status)
            print('Success:', j.get('success'))
            print('Chat ID:', j.get('chat_id'))
            msg = j.get('message', '') or j.get('error', '')
            if not msg and 'error' in j:
                msg = j['error']
            print('Message length:', len(msg))
            print('Contains 6669:', '6669' in msg)
            print('Contains 2379:', '2379' in msg)
            print('Contains 緯穎:', '緯穎' in msg)
            print('Contains 瑞昱:', '瑞昱' in msg)
            print('Contains 黑名單:', '黑名單' in msg)
            print('---')
            print(msg[:3000])
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        print(f'HTTP {e.code}: {body[:500]}')
    except Exception as e:
        print(f'Error: {e}')