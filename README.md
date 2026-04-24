# ピタッとタワー (pita-tto-tower)

揺れるクレーンからブロックを落として高く積み上げるワンタップ・ミニマルゲーム。

## 遊び方
1. 画面をタップするとクレーンからブロックが落下
2. 前のブロックにちょうど重なるよう狙う
3. ずれるとブロック幅が縮小、ゼロになるとゲームオーバー
4. 連続パーフェクトでコンボ倍率アップ

## 実装
- Phaser 3.70 (CDN)
- Vanilla JavaScript
- HTML5 Canvas + localStorage

## ローカル起動
```bash
python3 -m http.server 8099
# http://localhost:8099 を開く
```

## ディレクトリ
- `index.html`: エントリーポイント
- `js/`: ゲームロジック (Scene群)
- `assets/images/`: Nano Banana 2 で生成した画像
- `tools/`: アセット後処理スクリプト
