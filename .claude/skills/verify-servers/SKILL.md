---
name: verify-servers
description: Use whenever starting, restarting, or troubleshooting this repo's backend or frontend dev server to manually verify a change (e.g. running ./gradlew bootRun, frontend/serve.ps1, or frontend/serve.bat). Ensures each server runs on its project-default port instead of falling back to a different port when the default is already in use.
---

# ローカルサーバー起動時のポート管理

このプロジェクトで動作確認のためにバックエンド/フロントエンドのローカルサーバーを起動する際は、必ずこの手順に従うこと。方針の背景は `CLAUDE.md` の「ローカル動作確認ルール」を参照。

## デフォルトポート(固定・変更不可)

| サーバー | ポート | 起動コマンド |
|---|---|---|
| バックエンド(Spring Boot, `backend/`) | 8080 | `cd backend && ./gradlew bootRun` |
| フロントエンド(簡易サーバー, `frontend/`) | 5173 | `cd frontend && ./serve.bat`(内部で`serve.ps1`を実行) |

ポートが競合したからといって、別のポート番号に変更して回避してはならない。必ずデフォルトポートで起動できる状態にしてから確認する。

## 起動前にポート使用状況を確認する

Bash(git-bash)の場合:

```bash
netstat -ano | grep ":8080.*LISTENING"
netstat -ano | grep ":5173.*LISTENING"
```

PowerShellの場合:

```powershell
Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
```

## 競合を検知した場合の対応手順

1. 出力された PID からプロセス名を確認する(`tasklist //FI "PID eq <pid>"` または `Get-Process -Id <pid>`)。
2. そのプロセスが本プロジェクト自身の停止し忘れだと判断できる場合(例: `java.exe` = 前回の`gradlew bootRun`、`powershell.exe` = 前回の`serve.ps1`)は、そのPIDを指定して停止してから、同じデフォルトポートで起動し直す。
   - `taskkill //F //PID <pid>`(または `Stop-Process -Id <pid> -Force`)
   - `//IM java.exe`のようなプロセス名一括指定は、ユーザーが別用途で使っている同名プロセスも巻き込む可能性があるため、可能な限りPID指定を優先する。
3. そのプロセスが本プロジェクトと無関係と判断される場合(ユーザーが別の作業で使用している可能性がある)は、勝手に終了させない。ポートが競合している旨と該当プロセスの情報をユーザーに伝え、指示を仰ぐ。

## 動作確認後

- 確認が完了したら、自分が起動したサーバープロセスを停止する。ここでも可能な限りPID指定で停止し、無関係なプロセスを巻き込まないようにする。
- Postgresの`data.sql`は起動のたびに再実行される仕様のため、2回目以降の起動で `duplicate key value violates unique constraint` エラーが出た場合は、コードの不具合ではなく前回投入済みのseedデータが残っていることが原因。`docker-compose down -v && docker-compose up -d` でボリュームをリセットしてから再起動する。
