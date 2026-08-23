# TaskManagement

タスク管理プロジェクト

## 起動方法

### バックエンド(API)

```bash
docker-compose up -d          # PostgreSQL起動
cd backend
./gradlew bootRun             # http://localhost:8080 で起動
```

### フロントエンド(ボード画面)

Node.js等のインストールは不要です。Windows標準のPowerShellのみで動作する簡易サーバーで配信します。

```bash
cd frontend
./serve.bat                   # http://localhost:5173 をブラウザで自動的に開きます
```

`serve.bat`をダブルクリックしても起動できます。バックエンドを先に起動しておいてください。
