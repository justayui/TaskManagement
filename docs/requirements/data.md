[← 要件定義書トップへ戻る](requirements.md)

# データ要件書

## 1. ER図

本版のスコープにおけるデータモデルは以下の通り。ボード・リスト・カードは1対多の関係を持つ。ユーザー（User）は本版のスコープ外だが、将来の拡張（[今後の拡張候補](requirements.md#17-今後の拡張候補)）に備え、想定エンティティとして点線で示す。

```mermaid
erDiagram
    BOARD ||--o{ LIST : "含む"
    LIST ||--o{ CARD : "含む"
    USER ||..o{ BOARD : "（将来拡張）所有する"

    BOARD {
        string id PK
        string name
        datetime created_at
        datetime updated_at
    }
    LIST {
        string id PK
        string board_id FK
        string name
        int order
        datetime created_at
        datetime updated_at
    }
    CARD {
        string id PK
        string list_id FK
        string title
        string description
        int order
        datetime created_at
        datetime updated_at
    }
    USER {
        string id PK
        string name
    }
```

## 2. 主要テーブル概要

| テーブル | 主なカラム | 備考 |
|---|---|---|
| BOARD | id, name, created_at, updated_at | ボード情報 |
| LIST | id, board_id(FK), name, order, created_at, updated_at | order でリスト内表示順を管理 |
| CARD | id, list_id(FK), title, description, order, created_at, updated_at | order でカード内表示順を管理 |
| USER | id, name | 本版では未使用（将来の認証機能追加時に導入） |

---

[← 要件定義書トップへ戻る](requirements.md)
