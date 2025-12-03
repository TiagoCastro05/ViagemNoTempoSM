import { KeyManager } from "../managers/KeyManager.js";
import { TimeTravelManager } from "../managers/TimeTravelManager.js";
import { settingsManager } from "../managers/SettingsManager.js";

export class Game extends Phaser.Scene {
  constructor() {
    super("Game");

    this.keysCollected = 0;
    this.totalKeys = 1;
    this.level = 1;
    this.score = 0;
    this.startTime = 0;
    this.isDead = false;
    this.deathReason = "";
    this.doorUnlocked = false;
    this.doorPosition = null;
    this.levelCompleting = false;
    this.timeTravelManager = null;
    this.keyManager = null;
    this.player = null;
  }

  preload() {
    this.load.tilemapTiledJSON("map", "assets/mapa/mapas.json");
    this.load.image("passado", "assets/mapa/Passado/tileset.png");

    const futuroPath = "assets/mapa/Futuro/futuro/";
    ["C", "B", "A"].forEach((letter, i) => {
      const keys = ["Futuro_paredes", "futuro_portas", "futuro_obstaculos"];
      this.load.image(
        keys[i],
        `${futuroPath}SpriteSheet_${letter}_16x16_VerzatileDev.png`
      );
    });

    const spriteConfig = { frameWidth: 16, frameHeight: 16 };
    this.load.spritesheet(
      "chave_sheet",
      "assets/mapa/chave/icon_sheet_16x16.png",
      spriteConfig
    );
    this.load.spritesheet(
      "player_walk",
      "assets/personagem/RPG_assets.png",
      spriteConfig
    );

    // Carregar sons
    this.load.audio("keyCollect", "assets/audio/Key.mp3");
    this.load.audio("timeTravel", "assets/audio/ViajarTempo.mp3");
    this.load.audio("damage", "assets/audio/dano.mp3");
    this.load.audio("levelComplete", "assets/audio/NivelConcluido.mp3");
  }
  create() {
    Object.assign(this, {
      keysCollected: 0,
      isDead: false,
      startTime: Date.now(),
    });

    this.map = this.add.tilemap("map");

    const tilesets = [
      ["passado", "passado"],
      ["Futuro_paredes", "Futuro_paredes"],
      ["futuro_portas", "futuro_portas"],
      ["futuro_obstaculos", "futuro_obstaculos"],
    ].map(([name, key]) => this.map.addTilesetImage(name, key));

    const createLayer = (name, depth) => {
      const layer = this.map.createLayer(name, tilesets);
      layer?.setDepth(depth);
      return layer;
    };

    this.passadoBackground = createLayer("Passado BackGround", 0);
    this.passadoPrincipal = createLayer("Passado Principal", 10);
    this.futuroBackground = createLayer("Futuro background", 0);
    this.futuroPrincipal = createLayer("Futuro principal", 10);

    this.setupGame();
  }

  setupGame() {
    this.passadoBackground?.setVisible(false);
    this.passadoPrincipal?.setVisible(false);

    [this.passadoPrincipal, this.futuroPrincipal].forEach((layer) => {
      if (!layer) return;
      layer.setCollision([]);
      layer.setCollisionByProperty({ collides: true });
      layer.setCollisionByProperty({ kills: true });
    });

    this.player = this.physics.add.sprite(48, 48, "player_walk", 6);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(12, 12).setOffset(0, 0);
    this.player.setDepth(100).setScale(1);

    const animations = [
      { key: "esquerdadireita", frames: [1, 7, 1, 13] },
      { key: "up", frames: [2, 8, 2, 14] },
      { key: "down", frames: [0, 6, 0, 12] },
    ];

    animations.forEach(({ key, frames }) => {
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers("player_walk", { frames }),
        frameRate: 10,
        repeat: -1,
      });
    });

    this.cameras.main
      .startFollow(this.player)
      .setZoom(4.5)
      .setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    const killCallback = (player, tile) => {
      if (tile.properties.kills) {
        this.playerDeath(this.getDeathMessage(tile.properties.deathType));
      }
    };

    if (this.passadoPrincipal) {
      this.passadoCollider = this.physics.add.collider(
        this.player,
        this.passadoPrincipal,
        killCallback
      );
      this.passadoCollider.active = false;
    }
    if (this.futuroPrincipal) {
      this.futuroCollider = this.physics.add.collider(
        this.player,
        this.futuroPrincipal,
        killCallback
      );
      this.futuroCollider.active = true;
    }

    this.timeTravelManager = new TimeTravelManager(this);
    this.timeTravelManager.setLayers(
      this.passadoBackground,
      this.passadoPrincipal,
      this.futuroBackground,
      this.futuroPrincipal
    );

    this.keyManager = new KeyManager(this, this.map);
    this.keyManager.spawnKeys(this.timeTravelManager.getCurrentTime());

    this.physics.add.overlap(
      this.player,
      this.keyManager.getGroup(),
      this.collectKey,
      null,
      this
    );

    this.setupDoor();
    this.setupControls();
    this.createUI();
  }

  setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    ["W", "A", "S", "D"].forEach((key) => {
      this[`key${key}`] = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes[key]
      );
    });
    this.keySpace = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.keySpace.on("down", () => this.timeTravel());
  }
  collectKey(player, key) {
    key.destroy();
    this.sound.play("keyCollect", { volume: settingsManager.getSfxVolume() });
    this.keysCollected++;
    this.score += 100;

    const text = this.add
      .text(key.x, key.y - 20, "+100", {
        fontSize: "16px",
        color: "#ffff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy(),
    });

    this.updateUI();
    if (this.keysCollected >= this.totalKeys) this.unlockDoor();
  }

  setupDoor() {
    const doorLayer = this.map.getObjectLayer("chaves futuro");
    const doorObject = doorLayer?.objects.find(
      (obj) => obj.type === "door" || obj.name === "door"
    );
    if (doorObject) this.doorPosition = { x: doorObject.x, y: doorObject.y };
  }

  unlockDoor() {
    this.doorUnlocked = true;

    if (this.doorPosition && this.futuroPrincipal) {
      const tileX = this.futuroPrincipal.worldToTileX(this.doorPosition.x);
      const tileY = this.futuroPrincipal.worldToTileY(this.doorPosition.y);

      this.futuroPrincipal.putTileAt(103, tileX, tileY);

      const doorGlow = this.add.circle(
        this.doorPosition.x,
        this.doorPosition.y,
        12,
        0x00ff00,
        0.5
      );
      doorGlow.setDepth(50);
      this.doorGlow = doorGlow;

      this.tweens.add({
        targets: doorGlow,
        scale: { from: 1, to: 1.8 },
        alpha: { from: 0.5, to: 0.8 },
        duration: 1000,
        ease: "Sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      if (this.objectiveText) {
        this.objectiveText.setText("Objetivo: Sai pela porta");
      }

      const doorText = this.add
        .text(this.doorPosition.x, this.doorPosition.y - 30, "Porta Aberta!", {
          fontSize: "20px",
          color: "#00ff00",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setDepth(200);

      this.tweens.add({
        targets: doorText,
        y: doorText.y - 20,
        alpha: 0,
        duration: 2500,
        onComplete: () => doorText.destroy(),
      });
    }
  }

  checkDoorEntry() {
    if (
      !this.doorUnlocked ||
      !this.doorPosition ||
      !this.player ||
      this.levelCompleting
    )
      return;

    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.doorPosition.x,
      this.doorPosition.y
    );
    if (distance < 20) {
      this.levelCompleting = true;
      this.levelComplete();
    }
  }

  checkDeathTiles() {
    if (this.isDead) return;

    const currentTime = this.timeTravelManager.getCurrentTime();
    const layersToCheck =
      currentTime === "passado"
        ? [this.passadoBackground, this.passadoPrincipal]
        : [this.futuroBackground, this.futuroPrincipal];

    for (const layer of layersToCheck) {
      if (!layer?.visible) continue;

      const tile = layer.getTileAt(
        layer.worldToTileX(this.player.x),
        layer.worldToTileY(this.player.y)
      );
      if (tile?.properties?.kills) {
        this.playerDeath(this.getDeathMessage(tile.properties.deathType));
        return;
      }
    }
  }

  getDeathMessage(deathType) {
    const messages = {
      agua: "Caiste na água e afogaste!",
      lava: "Caiste em lava e morreste queimado!",
      picos: "Caiste em cima de espinhos e viraste uma espetada!",
    };
    return messages[deathType] || "Morreste!";
  }
  timeTravel() {
    this.sound.play("timeTravel", { volume: settingsManager.getSfxVolume() });
    const newTime = this.timeTravelManager.travel();
    const isPassado = newTime === "passado";

    if (this.passadoCollider) this.passadoCollider.active = isPassado;
    if (this.futuroCollider) this.futuroCollider.active = !isPassado;

    this.checkPlayerInWall(
      isPassado ? this.passadoPrincipal : this.futuroPrincipal
    );
    if (this.keysCollected < this.totalKeys) this.keyManager.spawnKeys(newTime);
  }

  checkPlayerInWall(layer) {
    if (!layer?.visible || !this.player) return;
    const tile = layer.getTileAt(
      layer.worldToTileX(this.player.x),
      layer.worldToTileY(this.player.y)
    );
    if (tile?.properties.collides)
      this.playerDeath("Ficaste preso numa parede!");
  }
  playerDeath(reason = "Morreu!") {
    if (this.isDead) return;
    this.isDead = true;

    // Parar música do menu
    const menuMusic = this.sound.get("menuMusic");
    if (menuMusic) {
      menuMusic.stop();
    }

    // Tocar som de dano
    const somDano = this.sound.add("damage", {
      volume: settingsManager.getSfxVolume(),
    });
    somDano.play();

    this.deathReason = reason;

    this.player.setVelocity(0, 0);
    this.player.body.enable = false;

    this.cameras.main.shake(300, 0.01);
    this.cameras.main.fade(1500, 255, 0, 0);

    // Aguardar som de dano terminar + animação antes de ir para Game Over
    const delayTotal = Math.max(1500, somDano.duration * 1000);
    this.time.delayedCall(delayTotal, () => this.gameOver());
  }

  createUI() {
    this.objectiveText = this.add
      .text(0, 0, "Objetivo: Encontra a chave", {
        fontSize: "11px",
        fontFamily: "Arial",
        color: "#ffaa00",
        backgroundColor: "#000000dd",
        padding: { x: 6, y: 3 },
      })
      .setOrigin(1, 0)
      .setDepth(1000)
      .setScrollFactor(1);
  }

  updateUI() {
    if (!this.objectiveText || !this.cameras.main) return;
    const cam = this.cameras.main;
    this.objectiveText.setPosition(
      cam.scrollX + cam.width / cam.zoom - 5,
      cam.scrollY + 5
    );
  }

  levelComplete() {
    this.sound.play("levelComplete", {
      volume: settingsManager.getSfxVolume(),
    });
    this.physics.pause();

    const cam = this.cameras.main;
    const completeText = this.add
      .text(cam.width / 2, cam.height / 2, "NÍVEL COMPLETO!", {
        fontSize: "32px",
        fontFamily: "Arial",
        color: "#00ff00",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);

    this.tweens.add({
      targets: completeText,
      scale: { from: 0.8, to: 1.2 },
      duration: 500,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: 2,
      onComplete: () =>
        this.time.delayedCall(300, () => this.scene.start("MainMenu")),
    });
  }

  update() {
    if (!this.player || !this.player.body || this.isDead) return;

    this.checkDoorEntry();
    this.checkDeathTiles();
    this.updateUI();

    const speed = 100;
    this.player.body.setVelocity(0);

    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.player.body.setVelocityX(-speed);
      this.player.anims.play("esquerdadireita", true);
      this.player.flipX = true;
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.player.body.setVelocityX(speed);
      this.player.anims.play("esquerdadireita", true);
      this.player.flipX = false;
    } else if (this.cursors.up.isDown || this.keyW.isDown) {
      this.player.body.setVelocityY(-speed);
      this.player.anims.play("up", true);
    } else if (this.cursors.down.isDown || this.keyS.isDown) {
      this.player.body.setVelocityY(speed);
      this.player.anims.play("down", true);
    } else {
      this.player.anims.stop();
    }

    this.cameras.main.roundPixels = true;
  }

  gameOver() {
    const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
    this.scene.start("GameOver", {
      level: this.level,
      score: this.score,
      timeElapsed: timeElapsed,
      timeTravels: this.timeTravelManager.getTravelCount(),
      deathReason: this.deathReason,
    });
  }
}
