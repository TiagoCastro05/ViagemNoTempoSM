import { Player } from "../entities/Player.js";
import { KeyManager } from "../managers/KeyManager.js";
import { TimeTravelManager } from "../managers/TimeTravelManager.js";

export class Game extends Phaser.Scene {
  constructor() {
    super("Game");

    // Estado do jogo
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

    // Managers (serão inicializados no create)
    this.timeTravelManager = null;
    this.keyManager = null;
    this.player = null;
  }

  preload() {
    this.load.tilemapTiledJSON("map", "assets/mapa/mapas.json");

    this.load.image("passado", "assets/mapa/Passado/tileset.png");
    this.load.image(
      "Futuro_paredes",
      "assets/mapa/Futuro/futuro/SpriteSheet_C_16x16_VerzatileDev.png"
    );
    this.load.image(
      "futuro_portas",
      "assets/mapa/Futuro/futuro/SpriteSheet_B_16x16_VerzatileDev.png"
    );
    this.load.image(
      "futuro_obstaculos",
      "assets/mapa/Futuro/futuro/SpriteSheet_A_16x16_VerzatileDev.png"
    );

    this.load.spritesheet(
      "chave_sheet",
      "assets/mapa/chave/icon_sheet_16x16.png",
      {
        frameWidth: 16,
        frameHeight: 16,
      }
    );

    this.load.spritesheet("player_walk", "assets/personagem/RPG_assets.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  create() {
    this.keysCollected = 0;
    this.isDead = false;
    this.startTime = Date.now();

    try {
      this.map = this.add.tilemap("map");
    } catch (error) {
      console.error("Erro ao carregar o mapa:", error);
      this.createFallbackGame();
      return;
    }

    if (!this.map || !this.map.tilesets || this.map.tilesets.length === 0) {
      console.error("Mapa não tem tilesets definidos corretamente");
      this.createFallbackGame();
      return;
    }

    // Adicionar tilesets
    const tilesets = [];
    try {
      tilesets.push(this.map.addTilesetImage("passado", "passado"));
      console.log("✅ Tileset 'passado' carregado");
    } catch (e) {
      console.error("❌ Erro ao carregar tileset 'passado':", e);
    }

    try {
      tilesets.push(
        this.map.addTilesetImage("Futuro_paredes", "Futuro_paredes")
      );
      console.log("✅ Tileset 'Futuro_paredes' carregado");
    } catch (e) {
      console.error("❌ Erro ao carregar tileset 'Futuro_paredes':", e);
    }

    try {
      tilesets.push(this.map.addTilesetImage("futuro_portas", "futuro_portas"));
      console.log("✅ Tileset 'futuro_portas' carregado");
    } catch (e) {
      console.error("❌ Erro ao carregar tileset 'futuro_portas':", e);
    }

    try {
      tilesets.push(
        this.map.addTilesetImage("futuro_obstaculos", "futuro_obstaculos")
      );
      console.log("✅ Tileset 'futuro_obstaculos' carregado");
    } catch (e) {
      console.error("❌ Erro ao carregar tileset 'futuro_obstaculos':", e);
    }

    try {
      tilesets.push(this.map.addTilesetImage("chave", "chave"));
      console.log("✅ Tileset 'chave' carregado");
    } catch (e) {
      console.error("❌ Erro ao carregar tileset 'chave':", e);
    }

    const tilesetPassado = tilesets[0];
    const tilesetFuturo = tilesets[1];

    if (!tilesetPassado || !tilesetFuturo) {
      console.error("Não foi possível carregar os tilesets principais");
      this.createFallbackGame();
      return;
    }

    // Criar layers - Passado
    this.passadoBackground = this.map.createLayer("Passado BackGround", [
      tilesetPassado,
      ...tilesets,
    ]);
    this.passadoBackground?.setDepth(0);
    this.passadoPrincipal = this.map.createLayer("Passado Principal", [
      tilesetPassado,
      ...tilesets,
    ]);
    this.passadoPrincipal?.setDepth(10);

    // Criar layers - Futuro
    this.futuroBackground = this.map.createLayer("Futuro background", [
      tilesetFuturo,
      ...tilesets,
    ]);
    this.futuroBackground?.setDepth(0);
    this.futuroPrincipal = this.map.createLayer("Futuro principal", [
      tilesetFuturo,
      ...tilesets,
    ]);
    this.futuroPrincipal?.setDepth(10);

    this.setupGame();
  }

  createFallbackGame() {
    // Criar um jogo simples sem mapa como fallback
    console.log("Criando jogo fallback sem mapa...");

    // Fundo simples
    this.add.rectangle(0, 0, 1280, 720, 0x1a1a2e).setOrigin(0);

    // Criar paredes invisíveis para delimitar área
    this.wallsGroup = this.physics.add.staticGroup();

    // Criar algumas "salas" visuais
    const graphics = this.add.graphics();
    graphics.lineStyle(3, 0x00ffff, 0.5);

    // Sala 1 (esquerda)
    graphics.strokeRect(50, 50, 500, 300);
    const wall1 = this.wallsGroup
      .create(50, 200, null)
      .setSize(10, 300)
      .setOrigin(0);
    const wall2 = this.wallsGroup
      .create(550, 200, null)
      .setSize(10, 300)
      .setOrigin(0);
    const wall3 = this.wallsGroup
      .create(300, 50, null)
      .setSize(500, 10)
      .setOrigin(0);
    const wall4 = this.wallsGroup
      .create(300, 350, null)
      .setSize(500, 10)
      .setOrigin(0);

    // Sala 2 (direita)
    graphics.strokeRect(700, 50, 500, 300);
    const wall5 = this.wallsGroup
      .create(700, 200, null)
      .setSize(10, 300)
      .setOrigin(0);
    const wall6 = this.wallsGroup
      .create(1200, 200, null)
      .setSize(10, 300)
      .setOrigin(0);
    const wall7 = this.wallsGroup
      .create(950, 50, null)
      .setSize(500, 10)
      .setOrigin(0);
    const wall8 = this.wallsGroup
      .create(950, 350, null)
      .setSize(500, 10)
      .setOrigin(0);

    // Sala 3 (inferior)
    graphics.strokeRect(350, 400, 600, 250);
    const wall9 = this.wallsGroup
      .create(350, 525, null)
      .setSize(10, 250)
      .setOrigin(0);
    const wall10 = this.wallsGroup
      .create(950, 525, null)
      .setSize(10, 250)
      .setOrigin(0);
    const wall11 = this.wallsGroup
      .create(650, 400, null)
      .setSize(600, 10)
      .setOrigin(0);
    const wall12 = this.wallsGroup
      .create(650, 650, null)
      .setSize(600, 10)
      .setOrigin(0);

    // Criar o jogador
    this.player = this.physics.add.sprite(640, 360, "player_walk");
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(32, 40);
    this.player.body.setOffset(8, 8);
    this.player.setDepth(10);
    this.player.setScale(2);
    console.log("Jogador criado (fallback):", this.player.x, this.player.y);

    // Adicionar colisão com paredes
    this.physics.add.collider(this.player, this.wallsGroup);

    // Configurar câmera
    this.cameras.main.setZoom(3.0);

    // Criar animações do personagem
    this.createAnimations();

    // Criar grupos de chaves (sem spawn points do mapa)
    this.keysGroup = this.physics.add.group();

    // Criar chaves manualmente em posições fixas (uma em cada sala)
    const keyPositions = [
      { x: 150, y: 150 },
      { x: 900, y: 150 },
    ];

    keyPositions.forEach((pos) => {
      const key = this.keysGroup.create(pos.x, pos.y, "chave_sheet", 179);
      key.setScale(2);
      key.body.setAllowGravity(false);

      this.tweens.add({
        targets: key,
        y: key.y - 10,
        duration: 1000,
        ease: "Sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Brilho pulsante
      this.tweens.add({
        targets: key,
        alpha: { from: 0.7, to: 1 },
        duration: 800,
        ease: "Sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    });

    // Configurar coleta de chaves
    this.physics.add.overlap(
      this.player,
      this.keysGroup,
      this.collectKey,
      null,
      this
    );

    // Configurar controles
    this.setupControls();

    // UI
    this.createUI();

    // Adicionar texto de aviso
    this.add
      .text(640, 30, "MODO TESTE - Configure o Tiled para 'Embed Tilesets'", {
        fontSize: "20px",
        color: "#ffff00",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);

    this.add
      .text(
        640,
        60,
        "Instrução: Abra o mapa no Tiled > Export As > Marque 'Embed tilesets'",
        {
          fontSize: "16px",
          color: "#ffffff",
          backgroundColor: "#000000",
          padding: { x: 8, y: 4 },
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);
  }

  setupGame() {
    // Mostrar apenas o futuro inicialmente
    this.passadoBackground?.setVisible(false);
    this.passadoPrincipal?.setVisible(false);

    // Configurar colisões por propriedade
    if (this.passadoPrincipal) {
      this.passadoPrincipal.setCollision([]);
      this.passadoPrincipal.setCollisionByProperty({ collides: true });
      this.passadoPrincipal.setCollisionByProperty({ kills: true });
      console.log("Colisões configuradas para o passado");
    }

    if (this.futuroPrincipal) {
      this.futuroPrincipal.setCollision([]);
      this.futuroPrincipal.setCollisionByProperty({ collides: true });
      this.futuroPrincipal.setCollisionByProperty({ kills: true });
      console.log("Colisões configuradas para o futuro");
    }

    // Criar o jogador
    this.player = this.physics.add.sprite(48, 48, "player_walk", 6);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(14, 14);
    this.player.body.setOffset(1, 1);
    this.player.setDepth(100);
    this.player.setScale(1);

    // Criar animações do player
    this.anims.create({
      key: "esquerdadireita",
      frames: this.anims.generateFrameNumbers("player_walk", {
        frames: [1, 7, 1, 13],
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers("player_walk", {
        frames: [2, 8, 2, 14],
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers("player_walk", {
        frames: [0, 6, 0, 12],
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Configurar câmera
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(4.5);
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    // Configurar colisões - criar colliders separados para cada época
    if (this.passadoPrincipal) {
      this.passadoCollider = this.physics.add.collider(
        this.player,
        this.passadoPrincipal,
        (player, tile) => {
          if (tile.properties.kills) {
            this.playerDeath(this.getDeathMessage(tile.properties.deathType));
          }
        }
      );
      this.passadoCollider.active = false; // Inativo no início
    }
    if (this.futuroPrincipal) {
      this.futuroCollider = this.physics.add.collider(
        this.player,
        this.futuroPrincipal,
        (player, tile) => {
          if (tile.properties.kills) {
            this.playerDeath(this.getDeathMessage(tile.properties.deathType));
          }
        }
      );
      this.futuroCollider.active = true; // Ativo no início (começa no futuro)
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
    /*
    this.debugGraphicsObj = this.add.graphics();
    this.debugGraphicsObj.setDepth(1000);
    if (this.passadoPrincipal) {
      this.passadoPrincipal.renderDebug(this.debugGraphicsObj, {
        tileColor: null,
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200),
        faceColor: new Phaser.Display.Color(40, 39, 37, 255),
      });
    }
    */
  }

  setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keySpace = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    if (this.map) this.keySpace.on("down", () => this.timeTravel());
  }

  createAnimations() {
    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("player_walk", {
        start: 0,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.player.play("walk");
  }

  spawnKeys() {
    this.keysGroup.clear(true, true);
    let keyTimeToUse = this.keyTime;
    let keyPosToUse = this.keyPosition;

    if (!keyTimeToUse || !keyPosToUse) {
      const randomTime = Phaser.Math.Between(0, 1) === 0 ? "passado" : "futuro";
      this.keyTime = randomTime;
      const objectLayerName =
        randomTime === "passado" ? "chaves passado" : "chaves futuro";
      const objectLayer = this.map.getObjectLayer(objectLayerName);

      if (!objectLayer) {
        console.warn(
          `Object layer "${objectLayerName}" não encontrado no mapa`
        );
        return;
      }

      const validSpawnPoints = [];
      objectLayer.objects.forEach((obj) => {
        if (obj.type === "item" || obj.name.includes("spawn_key")) {
          validSpawnPoints.push(obj);
        }
      });

      if (validSpawnPoints.length === 0) {
        console.warn("Nenhum spawn point encontrado");
        return;
      }

      const randomIndex = Phaser.Math.Between(0, validSpawnPoints.length - 1);
      const selectedSpawn = validSpawnPoints[randomIndex];
      this.keyPosition = { x: selectedSpawn.x, y: selectedSpawn.y };

      console.log(
        `Chave aparecerá no ${randomTime} na posição (${this.keyPosition.x}, ${this.keyPosition.y})`
      );

      keyTimeToUse = this.keyTime;
      keyPosToUse = this.keyPosition;
    }

    if (this.currentTime !== keyTimeToUse) {
      console.log(
        `Chave está no ${keyTimeToUse}, mas estamos no ${this.currentTime}`
      );
      return;
    }

    const key = this.keysGroup.create(
      keyPosToUse.x,
      keyPosToUse.y,
      "chave_sheet",
      179
    );
    key.setScale(1);
    key.body.setAllowGravity(false);

    // Seta apontando para a chave
    const keyArrow = this.add
      .text(keyPosToUse.x, keyPosToUse.y - 30, "▼", {
        fontSize: "32px",
        color: "#ffff00",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(100);
    key.arrow = keyArrow;

    this.tweens.add({
      targets: key,
      y: key.y - 5,
      duration: 1000,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    this.tweens.add({
      targets: key,
      alpha: { from: 0.7, to: 1 },
      duration: 800,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    this.tweens.add({
      targets: keyArrow,
      y: keyArrow.y - 8,
      duration: 500,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }

  collectKey(player, key) {
    // Destruir indicadores visuais
    if (key.arrow) key.arrow.destroy();

    key.destroy();
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

    if (this.keysCollected >= this.totalKeys) {
      this.unlockDoor();
    }
  }

  setupDoor() {
    const doorLayer = this.map.getObjectLayer("chaves futuro");
    if (!doorLayer) return;

    const doorObject = doorLayer.objects.find(
      (obj) => obj.type === "door" || obj.name === "door"
    );
    if (doorObject) {
      this.doorPosition = { x: doorObject.x, y: doorObject.y };
      console.log(`Porta encontrada em (${doorObject.x}, ${doorObject.y})`);
    }
  }

  unlockDoor() {
    this.doorUnlocked = true;

    if (this.doorPosition && this.futuroPrincipal) {
      const tileX = this.futuroPrincipal.worldToTileX(this.doorPosition.x);
      const tileY = this.futuroPrincipal.worldToTileY(this.doorPosition.y);

      // Mudar tile da porta fechada (ID 30 + firstgid do tileset) para porta aberta (ID 28 + firstgid)
      // futuro_portas tem firstgid 75, então: porta fechada = 105, porta aberta = 103
      this.futuroPrincipal.putTileAt(103, tileX, tileY);

      console.log("Porta desbloqueada! Vai até à porta para passar de nível.");

      // Seta apontando para a porta
      const doorArrow = this.add
        .text(this.doorPosition.x, this.doorPosition.y - 35, "▼", {
          fontSize: "36px",
          color: "#00ff00",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setDepth(100);
      this.doorArrow = doorArrow;

      this.tweens.add({
        targets: doorArrow,
        y: doorArrow.y - 8,
        duration: 500,
        ease: "Sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Feedback visual
      const doorText = this.add
        .text(this.doorPosition.x, this.doorPosition.y - 60, "Porta Aberta!", {
          fontSize: "18px",
          color: "#00ff00",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(200);

      this.tweens.add({
        targets: doorText,
        y: doorText.y - 20,
        alpha: 0,
        duration: 2000,
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

    // Obter a época atual do TimeTravelManager
    const currentTime = this.timeTravelManager.getCurrentTime();

    // Verificar ambas as camadas da época atual (Background e Principal)
    const layersToCheck =
      currentTime === "passado"
        ? [this.passadoBackground, this.passadoPrincipal]
        : [this.futuroBackground, this.futuroPrincipal];

    for (const layer of layersToCheck) {
      if (!layer || !layer.visible) continue;

      // Verificar o tile exatamente onde o player está
      const tileX = layer.worldToTileX(this.player.x);
      const tileY = layer.worldToTileY(this.player.y);
      const tile = layer.getTileAt(tileX, tileY);

      // Verificar se o tile existe e tem propriedades
      if (tile && tile.properties) {
        // Verificar se tem a propriedade kills (pode ser true ou "true")
        if (
          tile.properties.kills === true ||
          tile.properties.kills === "true"
        ) {
          this.playerDeath(this.getDeathMessage(tile.properties.deathType));
          return;
        }
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
    const newTime = this.timeTravelManager.travel();

    if (newTime === "passado") {
      if (this.passadoCollider) this.passadoCollider.active = true;
      if (this.futuroCollider) this.futuroCollider.active = false;
      console.log("✅ Colisões do PASSADO ativas, Futuro desativadas");

      // Verificar se o player está dentro de uma parede no passado
      this.checkPlayerInWall(this.passadoPrincipal);
    } else {
      if (this.passadoCollider) this.passadoCollider.active = false;
      if (this.futuroCollider) this.futuroCollider.active = true;
      console.log("✅ Colisões do FUTURO ativas, Passado desativadas");

      // Verificar se o player está dentro de uma parede no futuro
      this.checkPlayerInWall(this.futuroPrincipal);
    }

    // Só spawnar chaves se ainda não coletou todas
    if (this.keysCollected < this.totalKeys) {
      this.keyManager.spawnKeys(newTime);
    }
    this.updateDebugGraphics(newTime);
  }

  checkPlayerInWall(layer) {
    if (!layer || !this.player) return;

    // Obter a posição do player em tiles
    const playerTileX = layer.worldToTileX(this.player.x);
    const playerTileY = layer.worldToTileY(this.player.y);

    // Obter o tile na posição do player
    const tile = layer.getTileAt(playerTileX, playerTileY);

    // Se existe um tile com colisão na posição do player, ele morre
    if (tile && tile.properties.collides) {
      this.playerDeath("Ficaste preso numa parede!");
    }
  }

  updateDebugGraphics(currentTime) {
    // Debug desativado - para reativar, descomente o código abaixo
    /*
    if (this.debugGraphicsObj) {
      this.debugGraphicsObj.clear();
    } else {
      this.debugGraphicsObj = this.add.graphics();
      this.debugGraphicsObj.setDepth(1000);
    }

    const currentLayer = currentTime === "passado" ? this.passadoPrincipal : this.futuroPrincipal;
    if (currentLayer) {
      currentLayer.renderDebug(this.debugGraphicsObj, {
        tileColor: null,
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200),
        faceColor: new Phaser.Display.Color(40, 39, 37, 255),
      });
    }
    console.log(`🔍 DEBUG: Mostrando colisões do ${currentTime}`);
    */
  }

  playerDeath(reason = "Morreu!") {
    if (this.isDead) return;
    this.isDead = true;
    this.deathReason = reason;
    console.log("Jogador morreu:", reason);

    this.player.setVelocity(0, 0);
    this.player.body.enable = false;

    this.cameras.main.shake(300, 0.01);
    this.cameras.main.fade(1500, 255, 0, 0);

    this.time.delayedCall(1500, () => this.gameOver());
  }

  createUI() {
    const cam = this.cameras.main;
    const textStyle = {
      fontSize: "16px",
      fontFamily: "Arial",
      backgroundColor: "#000000aa",
      padding: { x: 10, y: 5 },
    };

    this.timeText = this.add
      .text(16, 16, "", { ...textStyle, color: "#ffffff" })
      .setScrollFactor(0)
      .setDepth(100);
    this.keysText = this.add
      .text(16, 50, "", { ...textStyle, color: "#ffff00" })
      .setScrollFactor(0)
      .setDepth(100);
    this.scoreText = this.add
      .text(16, 84, "", { ...textStyle, color: "#00ff00" })
      .setScrollFactor(0)
      .setDepth(100);
    this.instructionsText = this.add
      .text(
        cam.width / 2,
        cam.height - 20,
        "ESPAÇO: Viajar no Tempo | WASD/Setas: Mover",
        {
          fontSize: "14px",
          fontFamily: "Arial",
          color: "#ffffff",
          backgroundColor: "#000000aa",
          padding: { x: 8, y: 4 },
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);

    this.updateUI();
  }

  updateUI() {
    const currentTime = this.timeTravelManager.getCurrentTime();
    const timeLabel = currentTime === "passado" ? "PASSADO" : "FUTURO";
    const timeColor = currentTime === "passado" ? "#00ffff" : "#ff00ff";

    this.timeText.setText(`Época: ${timeLabel}`);
    this.timeText.setColor(timeColor);
    this.keysText.setText(`Chaves: ${this.keysCollected}/${this.totalKeys}`);
    this.scoreText.setText(`Pontos: ${this.score}`);
  }

  levelComplete() {
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
      duration: 1000,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: 2,
      onComplete: () =>
        this.time.delayedCall(1000, () => this.scene.start("MainMenu")),
    });
  }

  update() {
    if (!this.player || !this.player.body || this.isDead) return;

    this.checkDoorEntry();
    this.checkDeathTiles();

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
