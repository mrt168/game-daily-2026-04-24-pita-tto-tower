# 技術設計書: ピタッとタワー

## 技術スタック
- Phaser 3.x（CDN読み込み）
- Vanilla JavaScript（ES6+）
- HTML5 Canvas
- localStorage（ハイスコア・チュートリアル完了保存）

## ファイル構成
```
pita-tto-tower/
  index.html              # エントリーポイント（Phaser CDN）
  js/
    config.js             # Phaser設定、定数、カラー
    main.js               # Phaser.Game 起動
    scenes/
      BootScene.js        # アセット読み込み
      MenuScene.js        # タイトル画面
      TutorialScene.js    # チュートリアル（4ステップ）
      GameScene.js        # メインゲーム
      GameOverScene.js    # リザルト・シェア
    objects/
      Block.js            # ブロック本体（動的 + 静的）
      Crane.js            # 上部クレーン揺れ
    utils/
      AudioGen.js         # Web Audio API SE生成
      ColorUtil.js        # HSV→RGB変換
  assets/
    images/               # player.png, crane.png, background.png, logo.png, icon.png
  tools/
    process-asset.py      # Nano Banana 2 出力の背景除去
  style.css
```

## Scene設計

### BootScene
- 責務: 画像ロード（player/crane/background/logo/icon）
- 遷移条件: 全画像ロード完了 → MenuScene

### MenuScene
- 責務: タイトル画面。ロゴ表示、タップでスタート
- 初回は自動で TutorialScene へ、2回目以降は直接 GameScene へ
- タイトル右上に「?」ボタン（いつでもチュートリアルへ）

### TutorialScene
- 責務: 4ステップのインタラクティブ説明
- 1: タップで落下 / 2: 重ねる / 3: はみ出しで縮小 / 4: パーフェクトでコンボ
- 各ステップ完了で localStorage.setItem('tutorial_done','true') にフラグ
- 最終ステップで「タップでゲーム開始」 → GameScene

### GameScene
- 責務: メインゲームループ
- 状態: `this.gameState = 'playing'|'falling'|'landing'|'gameover'`
- Crane: 上部を左右に揺動（Tween.yoyo）
- Block: タップで現在ブロックを落下（Physics なし、Tween.to で y 増加）
- 判定: ブロック着地時に前ブロックとの重なり率を計算
- カメラ: タワーが高くなったら `cameras.main.scrollY` をスムーススクロール
- ゲームオーバー条件: ブロック幅 <= 0、または30秒間入力なし、または180秒経過

### GameOverScene
- 責務: スコア表示、シェアボタン、リトライボタン
- シェア: Twitter Web Intent で「{height}階達成！ スコア{score} #ピタッとタワー」
- リトライ: `this.scene.start('GameScene')`

## ゲームオブジェクト設計

### Block クラス
```javascript
class Block {
  constructor(scene, x, y, width, height, color) { ... }
  land(prevBlock) { 
    // 重なり率計算、はみ出し部分カット、コンボ判定
    return { overlap, width, perfect }
  }
  destroy()
}
```

### Crane クラス
```javascript
class Crane {
  constructor(scene, y) { ... }
  update(time, delta) { /* x を sin で揺動 */ }
  getCurrentX() { return this.sprite.x; }
  setSpeed(multiplier) { ... }  // 階数で速度増加
}
```

## フリーズ防止設計
- 全入力ハンドラを try/catch で包む
- update() 内で重い計算はしない
- 30秒無操作で「プレイしてますか？」ダイアログ
- 180秒で強制 GameOver
- window.onerror で GameOverScene に強制遷移

## カラー定義
- 背景: linear-gradient(#1a1a2e → #0f3460)
- ブロック: `Phaser.Display.Color.HSVToRGB((i * 30 % 360) / 360, 0.7, 0.9)` (i = 階数)
- パーフェクト: #f1c40f
- UIテキスト: #ffffff
