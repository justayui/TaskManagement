# Git運用ルール(必須・厳守)

このプロジェクトでは以下のGitHub運用ルールを必ず守ること。ClaudeCodeが作業を行う際も、人間の開発者と同様にこのルールに従う。

## 1. mainブランチへの直接pushは禁止

- `main` ブランチへの直接コミット・pushは禁止。GitHub側のBranch Protection設定でも直接pushをブロックしている。
- すべての変更はfeatureブランチを作成し、Pull Request経由でmainにマージすること。

## 2. 作業前に必ずIssueを作成する

- 新機能追加・バグ修正・調査タスクなど、着手前に必ずGitHub Issueを作成する。
- Issueテンプレート(`.github/ISSUE_TEMPLATE/`)の `bug_report` または `feature_request` を使う。
- Issueには目的・完了条件(Done条件)を簡潔に書く。
- ユーザーから新しいタスクを依頼されたとき、対応するIssueがまだ無ければ、作業前にIssue作成を提案・実施する。

## 3. ブランチ命名規則

Issue作成後、mainから最新の状態でブランチを作成する。

```
<type>/<issue番号>-<概要(英語・ケバブケース)>
```

- `type` は以下のいずれか
  - `feature` : 新機能
  - `fix` : バグ修正
  - `refactor` : リファクタリング
  - `docs` : ドキュメントのみの変更
  - `chore` : ビルド・設定・依存関係などの雑務
  - `hotfix` : 緊急修正
- 例: `feature/12-add-login-api`, `fix/15-null-pointer-on-login`

ブランチ作成コマンド例:

```bash
git fetch origin
git checkout -b feature/12-add-login-api origin/main
```

## 4. Pull Requestルール

- PRテンプレート(`.github/pull_request_template.md`)に従い、変更概要・確認方法を記載する。
- PR本文に対応Issueを `Closes #<Issue番号>` の形式で必ずリンクする。
- マージは必ずPR経由で行う(mainへの直接pushはGitHub側でも禁止設定済み)。
- マージ後、不要になったブランチは削除する。

## 5. GitHub Branch Protection設定(main)

以下の設定を`main`ブランチに適用済み。

- Pull Requestを必須化(必要承認数: 0件。1人開発のため自己マージ可)
- 直接push禁止(管理者にも適用)
- force push禁止
- ブランチ削除禁止
- 会話(レビューコメント)の解決を必須化

# ローカル動作確認ルール(必須・厳守)

ClaudeCodeが実装内容を動作確認するためローカルでサーバーを起動する際は、以下を必ず守ること。具体的なコマンド手順はSkill `.claude/skills/verify-servers/SKILL.md` にも定義しているので、サーバー起動時はそちらを参照・実行する。

## 1. デフォルトポートを厳守する

- バックエンド(Spring Boot): `8080`(`backend/src/main/resources/application.yml`に`server.port`の指定は無く、既定値の8080で起動する)
- フロントエンド(簡易サーバー): `5173`(`frontend/serve.ps1`にハードコードされたポート)
- 「ポートが競合するから」という理由で別のポート番号に変更して回避することは禁止。必ず上記デフォルトポートで起動できる状態にしてから確認を行う。

## 2. ポート競合時の対応手順

起動しようとしたデフォルトポートが既に使用中の場合、以下の手順で対応する。

1. まず何のプロセスがそのポートを使用しているか確認する(例: `netstat -ano | findstr :8080`、PowerShellなら`Get-NetTCPConnection -LocalPort 8080 | Select-Object OwningProcess`など)。
2. 確認したプロセスが、このプロジェクト自身の起動し忘れ・停止し忘れによるもの(前回の`gradlew bootRun`の`java.exe`や、`serve.ps1`の`powershell.exe`など)だと判断できる場合は、そのプロセスを停止してから、デフォルトポートで起動し直す。
3. 確認したプロセスがこのプロジェクトと無関係と判断される場合(ユーザーが別の作業で使用している可能性がある場合)は、勝手に強制終了せず、ユーザーに状況を伝えて指示を仰ぐ。
4. 動作確認が完了したら、ClaudeCodeが起動したサーバープロセスは停止する。
