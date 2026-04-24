class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  init() {
    this.gameState = 'idle';
    this.score = 0;
    this.floor = 0;
    this.combo = 0;
    this.placedBlocks = [];
    this.currentBlock = null;
    this.craneSprite = null;
    this.craneTween = null;
    this.lastInputAt = Date.now();
  }

  create() {
    try {
      const W = GAME_CONFIG.WIDTH, H = GAME_CONFIG.HEIGHT;
      this.worldHeight = H;

      if (this.textures.exists('background')) {
        this.bg = this.add.image(W / 2, H / 2, 'background').setDisplaySize(W, H).setScrollFactor(0);
      } else {
        this.cameras.main.setBackgroundColor('#1a1a2e');
      }

      this.scoreText = this.add.text(20, 20, 'スコア: 0', {
        fontSize: '24px', color: '#ffffff', fontStyle: 'bold',
        fontFamily: 'Hiragino Sans, sans-serif',
        stroke: '#000000', strokeThickness: 3,
      }).setScrollFactor(0).setDepth(100);

      this.heightText = this.add.text(W - 20, 20, '0 階', {
        fontSize: '24px', color: '#f1c40f', fontStyle: 'bold',
        fontFamily: 'Hiragino Sans, sans-serif',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

      this.comboText = this.add.text(W / 2, 20, '', {
        fontSize: '28px', color: '#f39c12', fontStyle: 'bold',
        fontFamily: 'Hiragino Sans, sans-serif',
        stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

      const baseY = H - 60;
      const baseWidth = 280;
      const baseBlock = this.add.rectangle(W / 2, baseY, baseWidth, GAME_CONFIG.BLOCK_HEIGHT, 0x555577)
        .setStrokeStyle(2, 0xffffff);
      this.placedBlocks.push({
        x: W / 2, y: baseY,
        left: W / 2 - baseWidth / 2,
        right: W / 2 + baseWidth / 2,
        width: baseWidth,
        sprite: baseBlock,
      });

      this._spawnCrane();
      this._spawnCurrentBlock();

      this.input.on('pointerdown', () => this._onTap());

      this.time.delayedCall(GAME_CONFIG.MAX_PLAY_DURATION, () => {
        if (this.gameState === 'playing' || this.gameState === 'idle') {
          this._gameOver('timeout');
        }
      });

      this.idleCheckEvent = this.time.addEvent({
        delay: 5000, loop: true,
        callback: () => {
          if (Date.now() - this.lastInputAt > GAME_CONFIG.IDLE_THRESHOLD) {
            this.lastInputAt = Date.now();
            this._showIdleWarning();
          }
        },
      });

      this.gameState = 'playing';
      this.events.on('shutdown', () => this._cleanup());
    } catch (e) {
      console.error('create error', e);
      this._gameOver('error');
    }
  }

  _spawnCrane() {
    const W = GAME_CONFIG.WIDTH;
    if (this.textures.exists('crane')) {
      this.craneSprite = this.add.image(W / 2, GAME_CONFIG.CRANE_Y, 'crane').setScale(0.12).setAlpha(0.9);
    } else {
      this.craneSprite = this.add.rectangle(W / 2, GAME_CONFIG.CRANE_Y, 80, 20, 0x888888);
    }
    this.craneSprite.setScrollFactor(0);
    this._setCraneTween();
  }

  _setCraneTween() {
    if (this.craneTween) this.craneTween.stop();
    const W = GAME_CONFIG.WIDTH;
    const speed = Math.max(
      GAME_CONFIG.CRANE_SWING_SPEED_MIN,
      GAME_CONFIG.CRANE_SWING_SPEED_BASE - this.floor * 60
    );
    this.craneTween = this.tweens.add({
      targets: this.craneSprite,
      x: { from: 80, to: W - 80 },
      duration: speed,
      yoyo: true, repeat: -1, ease: 'Sine.InOut',
    });
  }

  _spawnCurrentBlock() {
    if (this.gameState === 'gameover') return;
    const last = this.placedBlocks[this.placedBlocks.length - 1];
    const targetWidth = last ? last.width : GAME_CONFIG.INITIAL_BLOCK_WIDTH;
    const color = ColorUtil.blockColor(this.floor + 1);
    const y = GAME_CONFIG.CRANE_Y + 40;
    const block = this.add.rectangle(this.craneSprite.x, y, targetWidth, GAME_CONFIG.BLOCK_HEIGHT, color)
      .setStrokeStyle(2, 0xffffff).setScrollFactor(0);
    this.currentBlock = { sprite: block, width: targetWidth };
  }

  update(time, delta) {
    try {
      if (!this.currentBlock) return;
      if (this.gameState !== 'playing') return;
      this.currentBlock.sprite.x = this.craneSprite.x;
    } catch (e) { /* ignore */ }
  }

  _onTap() {
    try {
      this.lastInputAt = Date.now();
      if (this.gameState !== 'playing') return;
      if (!this.currentBlock) return;
      AudioGen.tap();
      this.gameState = 'falling';
      this._dropBlock();
    } catch (e) { console.error('onTap', e); this._gameOver('error'); }
  }

  _dropBlock() {
    const W = GAME_CONFIG.WIDTH;
    const last = this.placedBlocks[this.placedBlocks.length - 1];
    const targetY = last.y - GAME_CONFIG.BLOCK_HEIGHT;
    const block = this.currentBlock;
    const worldX = block.sprite.x;

    block.sprite.setScrollFactor(1);

    this.tweens.add({
      targets: block.sprite,
      y: targetY,
      duration: 380, ease: 'Cubic.In',
      onComplete: () => this._onLand(block, worldX, last, targetY),
    });
  }

  _onLand(block, worldX, last, landedY) {
    try {
      AudioGen.land();
      const half = block.width / 2;
      const currLeft = worldX - half;
      const currRight = worldX + half;
      const overlapLeft = Math.max(currLeft, last.left);
      const overlapRight = Math.min(currRight, last.right);
      const overlap = overlapRight - overlapLeft;

      if (overlap <= 0) {
        block.sprite.destroy();
        this._gameOver('missed');
        return;
      }

      const perfect = Math.abs(worldX - last.x) <= GAME_CONFIG.PERFECT_TOLERANCE;
      let newWidth, newX;
      if (perfect) {
        newWidth = last.width;
        newX = last.x;
        this.combo++;
      } else {
        newWidth = overlap;
        newX = (overlapLeft + overlapRight) / 2;
        this.combo = 0;
      }

      block.sprite.x = newX;
      block.sprite.width = newWidth;

      this.placedBlocks.push({
        x: newX, y: landedY,
        left: newX - newWidth / 2,
        right: newX + newWidth / 2,
        width: newWidth,
        sprite: block.sprite,
      });

      this.floor++;
      const bonus = Math.round((overlap / block.width) * 50);
      let gain = 100 + bonus;
      if (perfect) {
        const mult = Math.min(8, Math.pow(2, Math.min(3, this.combo)));
        gain += 500 * mult;
        this._perfectFx(newX, landedY);
        AudioGen.perfect();
      }
      this.score += gain;

      this.scoreText.setText(`スコア: ${this.score}`);
      this.heightText.setText(`${this.floor} 階`);

      if (this.combo >= 2) {
        this.comboText.setText(`COMBO ×${Math.min(8, Math.pow(2, Math.min(3, this.combo)))}`);
        this.tweens.add({
          targets: this.comboText, scale: { from: 1.5, to: 1 }, duration: 300,
        });
      } else {
        this.comboText.setText('');
      }

      this.cameras.main.shake(90, perfect ? 0.002 : 0.004);

      // カメラを少し上にスクロール（タワーが高くなっても見える）
      const targetScrollY = Math.min(0, landedY - (GAME_CONFIG.HEIGHT - 150));
      this.tweens.add({
        targets: this.cameras.main,
        scrollY: targetScrollY,
        duration: 350,
      });

      this._checkMilestone(this.floor);

      if (newWidth < 20) {
        this._gameOver('too_narrow');
        return;
      }

      this._setCraneTween();
      this.currentBlock = null;
      this.gameState = 'playing';
      this._spawnCurrentBlock();
    } catch (e) {
      console.error('onLand', e);
      this._gameOver('error');
    }
  }

  _perfectFx(x, y) {
    try {
      const particles = this.add.particles(x, y, 'block', {
        lifespan: 500, speed: { min: 120, max: 260 },
        scale: { start: 0.06, end: 0 }, quantity: 10,
        blendMode: 'ADD', tint: 0xf1c40f,
      });
      this.time.delayedCall(500, () => particles.destroy());
    } catch (e) { /* ignore */ }
  }

  _checkMilestone(floor) {
    const m = GAME_CONFIG.MILESTONES[floor];
    if (!m) return;
    AudioGen.milestone();
    const W = GAME_CONFIG.WIDTH;
    const bgFlash = this.add.rectangle(W / 2, GAME_CONFIG.HEIGHT / 2, W, GAME_CONFIG.HEIGHT, 0xf1c40f, 0.3)
      .setScrollFactor(0).setDepth(200);
    const t = this.add.text(W / 2, GAME_CONFIG.HEIGHT / 2, `${m.title} 称号獲得！\n${floor}階達成！`, {
      fontSize: '48px', color: m.color, fontStyle: 'bold', align: 'center',
      fontFamily: 'Hiragino Sans, sans-serif',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
    this.tweens.add({
      targets: [bgFlash, t], alpha: 0, duration: 1800,
      onComplete: () => { bgFlash.destroy(); t.destroy(); },
    });
  }

  _showIdleWarning() {
    try {
      const W = GAME_CONFIG.WIDTH;
      const txt = this.add.text(W / 2, 120, 'プレイしてますか？', {
        fontSize: '28px', color: '#f39c12',
        fontFamily: 'Hiragino Sans, sans-serif',
        backgroundColor: '#1a1a2e', padding: { x: 18, y: 10 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
      this.time.delayedCall(3000, () => txt.destroy());
    } catch (e) { /* ignore */ }
  }

  _gameOver(reason) {
    if (this.gameState === 'gameover') return;
    this.gameState = 'gameover';
    try {
      AudioGen.fail();
      this.cameras.main.shake(400, 0.02);
      this.cameras.main.flash(150, 255, 100, 100);
      this._cleanup();
      const best = parseInt(localStorage.getItem('best_height') || '0', 10);
      const bestScore = parseInt(localStorage.getItem('best_score') || '0', 10);
      if (this.floor > best) localStorage.setItem('best_height', String(this.floor));
      if (this.score > bestScore) localStorage.setItem('best_score', String(this.score));
      this.time.delayedCall(500, () => {
        this.scene.start('GameOverScene', {
          score: this.score, height: this.floor, reason,
        });
      });
    } catch (e) {
      console.error(e);
      this.scene.start('GameOverScene', { score: this.score || 0, height: this.floor || 0, reason: 'error' });
    }
  }

  _cleanup() {
    try {
      if (this.craneTween) { this.craneTween.stop(); this.craneTween = null; }
      if (this.idleCheckEvent) { this.idleCheckEvent.remove(false); this.idleCheckEvent = null; }
      this.input.removeAllListeners();
    } catch (e) { /* ignore */ }
  }
}
