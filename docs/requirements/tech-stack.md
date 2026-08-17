[← 要件定義書トップへ戻る](requirements.md)

# 技術構成書

## 1. 概要

本システムはフロントエンド（React）とバックエンド（Spring Boot）を分離し、REST API（JSON）を介して通信する構成とする。データベースにはPostgreSQLを採用する。[非機能要件書](non-functional.md)の想定（学習・検証用途、個人利用規模、高可用性不要）を踏まえ、実績があり学習コストの低い標準的な構成を選定した。なお、以下では一般に「技術スタック」とも呼ばれる内容を扱う。

## 2. フロントエンド

| 項目 | 選定内容 | 補足・理由 |
|---|---|---|
| 言語 | TypeScript | 型による保守性・拡張性の確保（[非機能要件書](non-functional.md)の保守性・拡張性要件に対応） |
| フレームワーク | React | 指定による |
| ビルドツール | Vite | 高速な開発サーバー・ビルド |
| ルーティング | React Router | 画面遷移（[画面要件書](screens.md)の3画面構成）の管理 |
| サーバー状態管理 | TanStack Query | API経由のデータ取得・キャッシュ・再検証（F-16, F-17） |
| ドラッグ&ドロップ | dnd-kit（@dnd-kit/core） | リスト並び替え・カード移動（F-09, F-14, F-15）。`mockup/`のネイティブHTML5 D&Dを置き換える |
| HTTPクライアント | Axios | バックエンドAPIとの通信 |
| スタイリング | CSS Modules | `mockup/css/style.css`のデザインをベースに整理。追加のUIフレームワークは導入しない |
| テスト | Vitest, React Testing Library | 単体・コンポーネントテスト |

## 3. バックエンド

| 項目 | 選定内容 | 補足・理由 |
|---|---|---|
| 言語 | Java 21（LTS） | 指定による |
| フレームワーク | Spring Boot 3.x系（最新安定版） | 指定による |
| ビルドツール | Gradle | - |
| Web/API | Spring Web（REST API） | フロントエンドとJSON形式でデータ連携（F-16, F-17） |
| データアクセス | Spring Data JPA（Hibernate） | BOARD/LIST/CARDのCRUD（[データ要件書](data.md)） |
| マイグレーション | Flyway | DBスキーマのバージョン管理 |
| バリデーション | Spring Validation（Jakarta Bean Validation） | APIリクエストの入力チェック |
| APIドキュメント | springdoc-openapi（Swagger UI） | フロントエンド・バックエンド間のAPI仕様共有 |
| テスト | JUnit 5, Mockito, Spring Boot Test（MockMvc） | 単体・Controllerテスト |

## 4. データベース

| 項目 | 選定内容 | 補足・理由 |
|---|---|---|
| DBMS | PostgreSQL | 指定による |
| ローカル開発環境 | Docker Composeによるコンテナ起動 | 開発者間で同一のDB環境を再現 |

## 5. 開発・実行環境

| 項目 | 選定内容 | 補足・理由 |
|---|---|---|
| コンテナ | Docker / Docker Compose | ローカル開発でPostgreSQLコンテナを起動。将来的にバックエンド・フロントエンドを含めたコンテナ化も見据えた構成とする |
| API方式 | REST API（JSON） | フロントエンド・バックエンド間の通信方式 |
| CORS | Spring Boot側で開発用オリジンを許可 | フロントエンド開発サーバー（Vite）からのAPIアクセスを可能にする |

## 6. ホスティング

未定。フロントエンド・バックエンドともにコンテナ化を前提とした構成とすることで、ホスティング先の選定（クラウド／オンプレ等）を柔軟に行えるようにする。

---

[← 要件定義書トップへ戻る](requirements.md)
