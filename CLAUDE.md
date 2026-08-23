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
