@echo off
set TOKEN=***
set REMOTE=https://%TOKEN%@github.com/idappleilike3/ai-stock-radar.git
cd /d C:\Users\WIN11\.openclaw\workspace\ai-stock-radar
git remote set-url origin %REMOTE%
git push origin main