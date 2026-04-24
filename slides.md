# ピタッとタワー

## Game Daily 2026-04-24
## 揺れるクレーンからブロックを積み上げるワンタップ物理ゲーム

---

# コンセプト

- **ジャンル**: action / stack / minimal
- **コアループ**: 揺れるクレーン → タップでブロック落下 → 重ねて積む
- **プレイ時間**: 30秒 〜 3分
- **操作**: 画面タップ（ワンタップで完結）

---

# 3者コンペの結果

- **Gemini案**: ピタッとタワー (action/stack/minimal)
- **Codex案**: ひっくり返れ横断歩道 (traffic-management)
- **Claude案**: 記憶連鎖バースト (puzzle/memory/neon)

投票は3者1票ずつで引き分け
→ 実装性・SNS映え・独自性でピタッとタワーを採用

---

# Grill Council TOP3 バイラル戦略

1. **リザルト画面でワンタップTwitter共有**
   #ピタッとタワー ハッシュタグ付き定型文

2. **階数別称号のアンロック演出**
   10階ルーキー / 30階名匠 / 50階神

3. **毎回異なる色グラデーションタワー**
   HSV回転で階ごとに色変化、絵画のように美しい

---

# ゲーム要素

- 揺れるクレーン（階数で速度上昇）
- 重なり判定 + パーフェクト検出
- はみ出しペナルティで幅縮小
- コンボ倍率 x2/x4/x8
- カメラスクロール
- 階数別称号演出
- localStorage ハイスコア
- Twitter Web Intent 共有

---

# 技術スタック

- **Phaser 3.70** (CDN)
- **Vanilla JavaScript** (ES6+)
- **HTML5 Canvas**
- **localStorage** (best_height, best_score, tutorial_done)
- **Web Audio API** (SE プログラム生成)
- **Gemini gemini-3.1-flash-image-preview** (Nano Banana 2) でアセット生成

---

# 品質保証

- **Playwright 実プレイテスト**: 8/8 PASS
  - 60秒連続プレイOK
  - フリーズなし
  - コンソールエラー0件
  - リロード後も動作

- **E2E テスト**: 9/9 PASS
  - チュートリアル分岐
  - ゲームオーバー遷移
  - リトライ・localStorage永続化

---

# アセット (Nano Banana 2 生成)

- block.png (813x825) - 落下ブロック
- crane.png (1024x824) - 上部クレーン
- logo.png (902x202) - タイトルロゴ
- background.png (1200x896) - 夜空背景
- icon.png (1024x1024) - アプリアイコン

全アセットはPythonPILで背景除去+自動クロップ

---

# ありがとうございました

Play URL: (スプレッドシート参照)
GitHub: (スプレッドシート参照)
