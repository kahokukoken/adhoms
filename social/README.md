# X 投稿承認キュー（手動公開）

このディレクトリは `kahokuadhoms` 向けの承認済み投稿と、手動投稿の記録、GitHub の読了位置を保存します。初期版は「X投稿案を作って」という依頼でだけ開始し、定期監視も自動投稿も行いません。X の API や認証情報は使わず、認証情報をチャットで要求してはいけません。

## 再開と案の作成

1. この README、`state.json`、`history/` を読む。
2. 現在の GitHub head を取得し、`github_checked_commit` からの compare ページと関連する公開ファイルを最後まで読む。コミット題名だけで判断しない。social/plan だけの変更は除き、履歴との完全一致も確認する。
3. 初回は `state.json` の基準点から開始し、過去分を一括告知しない。比較が分岐・切り詰めになった場合や、権限不足・部分読取がある場合は停止し、checkpoint を進めない。
4. ChatGPT の会話内で 0〜3 案を提示する。未承認案は会話の外へ保存しない。失われた案は再提示し、承認を捏造しない。
5. 読取が完了し、案の提示にも成功した後だけ compare-and-swap で checkpoint を保存する。

Notion の内容は個別に公開許可を確認します。Notion は公開 GitHub cursor の対象外です。

```sh
printf '%s' '{"expected_commit":"d1aebb2a4f18295c8560278da911d4d4df40f8e2","next_commit":"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb","complete":true}' | node scripts/social-queue.mjs checkpoint --root social
```

## 承認の保存

実際の会話で、利用者が本文を明示承認し、公開リポジトリへの本文保存にも同意したことをオペレーターが確認してから実行します。ハッシュは署名ではなく、CLI は発言者を認証しません。以下は無害な形式例であり、実際の承認ではありません。

```json
{
  "candidate": {"id":"example-1","revision":1,"account":"kahokuadhoms","text":"abc"},
  "receipt": {"id":"example-1","revision":1,"account":"kahokuadhoms","text_sha256":"ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad","approved_at":"2026-09-18T12:34:56.000Z","public_storage_approved":true}
}
```

```sh
cat approval.json | node scripts/social-queue.mjs approve --root social
```

スキーマ外のキー、紐付け不一致、重複 ID・本文は拒否されます。ただし本文に秘密情報が紛れたかは厳格なフィールド検証だけでは判定できません。保存前に人が内容とプライバシーを確認してください。

## 手動投稿の記録

X の投稿画面で最終的な文字数と表示を確認し、人が投稿します。その後、次の形式で記録します。`user_reported_unverified` では `observed_text` は `null`、実際の表示本文と完全比較した `text_compared` では承認済み本文そのものを指定します。`observed_text` 自体は保存されません。

```json
{
  "id":"example-1",
  "report":{"url":"https://x.com/kahokuadhoms/status/1234567890","recorded_at":"2026-09-18T13:00:00.000Z","verification":"user_reported_unverified","observed_text":null}
}
```

```sh
cat publication.json | node scripts/social-queue.mjs record --root social
node scripts/social-queue.mjs validate --root social
```

`approved/` にあり対応する `history/` がなければ手動投稿待ち、正しく対応する履歴があれば投稿済みです。履歴の `verification` が確認レベルを示し、自動検証済みとは扱いません。承認と履歴は上書きしません。

## 実行環境と限界

この検証はローカルツールの検証で、リポジトリの branch protection ではありません。ブランチを利用できる checkout で validator を実行してください。connector しか使えない環境では、checkout で検証した正確な出力だけを connector で保存します。connector による直接の生 JSON 書込みはローカル検証を迂回します。
