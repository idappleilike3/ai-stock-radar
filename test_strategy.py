"""跑策略分析 demo (本地)"""
import sys
sys.path.insert(0, '.')

# 直接 import 策略函數
import yahoo_finance2 as yf
from datetime import datetime, timedelta
import numpy as np

def runMA20Breakout(close, volume):
    trades = []
    position = False
    entry = 0
    for i in range(20, len(close)):
        ma20 = sum(close[i-20:i]) / 20
        vol_ma5 = sum(volume[i-5:i]) / 5
        if not position and close[i] > ma20 and volume[i] > vol_ma5 * 1.5:
            position = True; entry = close[i]
        elif position and (close[i] < ma20 * 0.97 or close[i] > close[i-1] * 1.15):
            trades.append((close[i] / entry - 1) * 100); position = False
    return trades

def runVolumeBreakout(close, volume):
    trades = []
    position = False; entry = 0
    for i in range(20, len(close)):
        cur_vol_ma5 = sum(volume[i-5:i]) / 5
        if not position and volume[i] > cur_vol_ma5 * 3 and close[i] > close[i-1] * 1.02:
            position = True; entry = close[i]
        elif position and close[i] < entry * 0.93:
            trades.append((close[i] / entry - 1) * 100); position = False
    return trades

def runMomentum5(close, volume):
    trades = []
    position = False; entry = 0
    for i in range(5, len(close)):
        ret5 = (close[i] / close[i-5] - 1) * 100
        if not position and ret5 > 5:
            position = True; entry = close[i]
        elif position and (close[i] < entry * 0.95 or ret5 < -5):
            trades.append((close[i] / entry - 1) * 100); position = False
    return trades

def runGoldenCross(close, volume):
    trades = []
    position = False; entry = 0
    for i in range(20, len(close)):
        ma5_now = sum(close[i-5:i]) / 5
        ma20_now = sum(close[i-20:i]) / 20
        ma5_prev = sum(close[i-6:i-1]) / 5
        ma20_prev = sum(close[i-21:i-1]) / 20
        cross_up = ma5_prev < ma20_prev and ma5_now > ma20_now
        cross_down = ma5_prev > ma20_prev and ma5_now < ma20_now
        if not position and cross_up:
            position = True; entry = close[i]
        elif position and cross_down:
            trades.append((close[i] / entry - 1) * 100); position = False
    return trades

def runMeanReversion(close, volume):
    trades = []
    position = False; entry = 0
    for i in range(20, len(close)):
        ma20 = sum(close[i-20:i]) / 20
        deviation = (close[i] / ma20 - 1) * 100
        if not position and deviation < -10:
            position = True; entry = close[i]
        elif position and (close[i] > ma20 or close[i] < entry * 0.95):
            trades.append((close[i] / entry - 1) * 100); position = False
    return trades

def calc_stats(name, desc, trades):
    if not trades:
        return {"name": name, "desc": desc, "win": 0, "avg": 0, "max_dd": 0, "trades": 0, "score": 0}
    wins = [t for t in trades if t > 0]
    win_rate = len(wins) / len(trades) * 100
    avg = sum(trades) / len(trades)
    peak = 0; max_dd = 0; cum = 0
    for t in trades:
        cum += t
        if cum > peak: peak = cum
        dd = peak - cum
        if dd > max_dd: max_dd = dd
    std = (sum((t - avg) ** 2 for t in trades) / len(trades)) ** 0.5
    sharpe = std > 0 and (avg / std) or 0
    score = min(100, max(0, win_rate * 0.4 + min(avg * 5, 30) + min(sharpe * 10, 20) + (10 if len(trades) > 5 else 0)))
    return {"name": name, "desc": desc, "win": win_rate, "avg": avg, "max_dd": max_dd, "trades": len(trades), "sharpe": sharpe, "score": round(score)}

# 跑 2330
ticker = '2330.TW'
end = datetime.now()
start = end - timedelta(days=365)
hist = yf.download(ticker, start=start, end=end, progress=False)
if isinstance(hist.columns, pd.MultiIndex):
    hist.columns = hist.columns.get_level_values(0)
close = hist['Close'].values.flatten().tolist()
volume = hist['Volume'].values.flatten().tolist()

print(f'=== {ticker} 策略分析 (近 1 年) ===')
print(f'資料天數: {len(close)}')
print()

strategies = [
    calc_stats('均線 20 突破', '突破 20MA + 量能 1.5x', runMA20Breakout(close, volume)),
    calc_stats('爆量突破', '量能爆 3 倍', runVolumeBreakout(close, volume)),
    calc_stats('5 日動能', '5 日漲 > 5%', runMomentum5(close, volume)),
    calc_stats('均值回歸', '跌破月線 10% 反彈', runMeanReversion(close, volume)),
    calc_stats('黃金交叉', '5MA 穿越 20MA', runGoldenCross(close, volume)),
]

# 排序
strategies.sort(key=lambda x: x['score'], reverse=True)

print(f'{"策略":<14} {"評分":<6} {"勝率":<8} {"均報酬":<10} {"回撤":<8} {"次數":<6} {"夏普":<6}')
print('-' * 80)
for s in strategies:
    if s['trades'] == 0:
        print(f'{s["name"]:<14} {s["score"]:<6} 無交易')
    else:
        print(f'{s["name"]:<14} {s["score"]:<6} {s["win"]:.1f}%   {s["avg"]:+.2f}%   -{s["max_dd"]:.1f}%   {s["trades"]:<6} {s["sharpe"]:.2f}')

print()
best = strategies[0]
print(f'對 {ticker} 最佳策略: {best["name"]} (評分 {best["score"]})')