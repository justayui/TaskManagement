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

Node.js(LTS)が必要です。

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173 で起動
```

バックエンドを先に起動しておいてください。
