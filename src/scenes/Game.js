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

    // Managers (serão inicializados no create)
    this.timeTravelManager = null;
    this.keyManager = null;
    this.player = null;
  }

  preload() {
    // Carregar mapa Tiled (formato JSON)
    this.load.tilemapTiledJSON("map", "assets/mapa/mapas.json");

    // Carregar TODOS os tilesets definidos no JSON (os nomes devem corresponder exatamente)
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

    // Carregar spritesheet da chave (16x16, 20 colunas)
    this.load.spritesheet(
      "chave_sheet",
      "assets/mapa/chave/icon_sheet_16x16.png",
      {
        frameWidth: 16,
        frameHeight: 16,
      }
    );

    // Carregar personagem (spritesheet)
    this.load.spritesheet("player_idle", "assets/personagem/Idle.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet("player_walk", "assets/personagem/Walk.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet("player_run", "assets/personagem/Run.png", {
      frameWidth: 48,
      frameHeight: 48,
    });

    // Carregar chave
    this.load.image("key", "assets/mapa/chave/16x16/key_t.png");

    console.log("Preload: Assets do personagem carregados");
  }

  create() {
    this.startTime = Date.now();

    // Criar o mapa
    try {
      this.map = this.add.tilemap("map");
    } catch (error) {
      console.error("Erro ao carregar o mapa:", error);
      this.createFallbackGame();
      return;
    }

    // Verificar se o mapa foi carregado
    if (!this.map || !this.map.tilesets || this.map.tilesets.length === 0) {
      console.error("Mapa não tem tilesets definidos corretamente");
      this.createFallbackGame();
      return;
    }

    // Adicionar tilesets
    // Tentar adicionar usando diferentes nomes possíveis
    let tilesetPassado = null;
    let tilesetFuturo = null;

    // Listar tilesets disponíveis no mapa
    console.log(
      "Tilesets no mapa:",
      this.map.tilesets.map((ts) => ts.name)
    );

    // Adicionar TODOS os tilesets com os nomes exatos do JSON
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

    // Verificar se pelo menos os tilesets principais foram carregados
    tilesetPassado = tilesets[0]; // passado
    tilesetFuturo = tilesets[1]; // Futuro_paredes

    // Se não conseguir carregar tilesets principais, usar fallback
    if (!tilesetPassado || !tilesetFuturo) {
      console.error("Não foi possível carregar os tilesets principais");
      this.createFallbackGame();
      return;
    }

    // Criar layers - PASSADO (pode usar múltiplos tilesets)
    this.passadoBackground = this.map.createLayer("Passado BackGround", [
      tilesetPassado,
      ...tilesets,
    ]);
    this.passadoBackground?.setDepth(0); // Background mais atrás

    this.passadoPrincipal = this.map.createLayer("Passado Principal", [
      tilesetPassado,
      ...tilesets,
    ]);
    this.passadoPrincipal?.setDepth(10); // Camada principal no meio

    // Criar layers - FUTURO (pode usar múltiplos tilesets)
    this.futuroBackground = this.map.createLayer("Futuro background", [
      tilesetFuturo,
      ...tilesets,
    ]);
    this.futuroBackground?.setDepth(0); // Background mais atrás

    this.futuroPrincipal = this.map.createLayer("Futuro principal", [
      tilesetFuturo,
      ...tilesets,
    ]);
    this.futuroPrincipal?.setDepth(10); // Camada principal no meio

    // Continuar com o resto da criação
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
    this.player = this.physics.add.sprite(640, 360, "player_idle");
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(32, 40);
    this.player.body.setOffset(8, 8);
    this.player.setDepth(10);
    this.player.setScale(2);
    console.log("Jogador criado (fallback):", this.player.x, this.player.y);

    // Adicionar colisão com paredes
    this.physics.add.collider(this.player, this.wallsGroup);

    // Configurar câmera
    this.cameras.main.setZoom(1);

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
    // Inicialmente, mostrar apenas o passado
    if (this.futuroBackground) this.futuroBackground.setVisible(false);
    if (this.futuroPrincipal) this.futuroPrincipal.setVisible(false);

    // Configurar colisões nas layers principais
    if (this.passadoPrincipal) {
      // Configurar colisão em TODOS os tiles que não sejam vazios
      this.passadoPrincipal.setCollisionByExclusion([-1]);
    }

    if (this.futuroPrincipal) {
      // Configurar colisão em TODOS os tiles que não sejam vazios
      this.futuroPrincipal.setCollisionByExclusion([-1]);
    }

    // TESTE: Criar o jogador diretamente (sem classe) para debug
    this.player = this.physics.add.sprite(240, 180, "player_idle", 0);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(32, 40);
    this.player.body.setOffset(8, 8);
    this.player.setDepth(100);
    this.player.setScale(2);

    // Criar animações manualmente
    if (!this.anims.exists("idle")) {
      this.anims.create({
        key: "idle",
        frames: this.anims.generateFrameNumbers("player_idle", {
          start: 0,
          end: 3,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }
    if (!this.anims.exists("walk")) {
      this.anims.create({
        key: "walk",
        frames: this.anims.generateFrameNumbers("player_walk", {
          start: 0,
          end: 7,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }
    if (!this.anims.exists("run")) {
      this.anims.create({
        key: "run",
        frames: this.anims.generateFrameNumbers("player_run", {
          start: 0,
          end: 7,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    this.player.play("idle");

    console.log(
      "TESTE: Jogador criado diretamente:",
      this.player.x,
      this.player.y
    );
    console.log("Texture key:", this.player.texture.key);
    console.log("Frame:", this.player.frame.name);
    console.log("Visible:", this.player.visible, "Alpha:", this.player.alpha);

    // DEBUG: Adicionar um círculo vermelho na posição do jogador para debug visual
    this.debugCircle = this.add.circle(
      this.player.x,
      this.player.y,
      20,
      0xff0000,
      0.5
    );
    this.debugCircle.setDepth(150);
    console.log(
      "DEBUG: Círculo vermelho criado em:",
      this.player.x,
      this.player.y
    );

    // Configurar câmera
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(2);
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    // Configurar colisões
    if (this.passadoPrincipal) {
      this.physics.add.collider(this.player, this.passadoPrincipal);
    }
    if (this.futuroPrincipal) {
      this.physics.add.collider(this.player, this.futuroPrincipal);
    }

    // Inicializar TimeTravelManager
    this.timeTravelManager = new TimeTravelManager(this);
    this.timeTravelManager.setLayers(
      this.passadoBackground,
      this.passadoPrincipal,
      this.futuroBackground,
      this.futuroPrincipal
    );

    // Inicializar KeyManager
    this.keyManager = new KeyManager(this, this.map);
    this.keyManager.spawnKeys(this.timeTravelManager.getCurrentTime());

    // Configurar coleta de chaves
    this.physics.add.overlap(
      this.player,
      this.keyManager.getGroup(),
      this.collectKey,
      null,
      this
    );

    // Configurar controles
    this.setupControls();

    // UI
    this.createUI();

    // Debug (opcional - comentar em produção)
    // this.physics.world.createDebugGraphic();
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

    // Evento de viagem no tempo (só se tiver mapa)
    if (this.map) {
      this.keySpace.on("down", () => this.timeTravel());
    }
  }

  createAnimations() {
    // Idle
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("player_idle", {
        start: 0,
        end: 3,
      }),
      frameRate: 8,
      repeat: -1,
    });

    // Walk
    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("player_walk", {
        start: 0,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Run
    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("player_run", {
        start: 0,
        end: 7,
      }),
      frameRate: 12,
      repeat: -1,
    });

    this.player.play("idle");
  }

  spawnKeys() {
    // Limpar chaves existentes
    this.keysGroup.clear(true, true);

    // Se a chave já foi definida (não é o primeiro spawn), usar os valores salvos
    let keyTimeToUse = this.keyTime;
    let keyPosToUse = this.keyPosition;

    // Se é a primeira vez (início do jogo), escolher aleatoriamente
    if (!keyTimeToUse || !keyPosToUse) {
      // Escolher aleatoriamente entre passado e futuro
      const randomTime = Phaser.Math.Between(0, 1) === 0 ? "passado" : "futuro";
      this.keyTime = randomTime;

      // Obter spawn points do tempo escolhido
      const objectLayerName =
        randomTime === "passado" ? "chaves passado" : "chaves futuro";
      const objectLayer = this.map.getObjectLayer(objectLayerName);

      if (!objectLayer) {
        console.warn(
          `Object layer "${objectLayerName}" não encontrado no mapa`
        );
        return;
      }

      // Coletar todos os spawn points válidos
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

      // Selecionar aleatoriamente 1 spawn point
      const randomIndex = Phaser.Math.Between(0, validSpawnPoints.length - 1);
      const selectedSpawn = validSpawnPoints[randomIndex];
      this.keyPosition = { x: selectedSpawn.x, y: selectedSpawn.y };

      console.log(
        `Chave aparecerá no ${randomTime} na posição (${this.keyPosition.x}, ${this.keyPosition.y})`
      );

      keyTimeToUse = this.keyTime;
      keyPosToUse = this.keyPosition;
    }

    // Só criar a chave se estivermos no tempo correto
    if (this.currentTime !== keyTimeToUse) {
      console.log(
        `Chave está no ${keyTimeToUse}, mas estamos no ${this.currentTime}`
      );
      return;
    }

    // Criar a chave na posição definida
    const key = this.keysGroup.create(
      keyPosToUse.x,
      keyPosToUse.y,
      "chave_sheet",
      179
    );
    key.setScale(1);
    key.body.setAllowGravity(false);

    // Animação de flutuação
    this.tweens.add({
      targets: key,
      y: key.y - 5,
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
  }

  collectKey(player, key) {
    key.destroy();
    this.keysCollected++;
    this.score += 100;

    // Som de coleta (adicionar quando tiver audio)
    // this.sound.play('collect');

    // Feedback visual
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

    // Atualizar UI
    this.updateUI();

    // Verificar se coletou todas as chaves
    if (this.keysCollected >= this.totalKeys) {
      this.levelComplete();
    }
  }

  timeTravel() {
    // Usar o TimeTravelManager para realizar a viagem
    const newTime = this.timeTravelManager.travel();

    // Mostrar/esconder chave baseado no tempo
    this.keyManager.spawnKeys(newTime);

    // Som de viagem no tempo (adicionar quando tiver audio)
    // this.sound.play('timeTravel');
  }

  createUI() {
    // Configurar UI para seguir a câmera
    const cam = this.cameras.main;

    // Painel de informações (fixo na tela)
    this.timeText = this.add
      .text(16, 16, "", {
        fontSize: "16px",
        fontFamily: "Arial",
        color: "#ffffff",
        backgroundColor: "#000000aa",
        padding: { x: 10, y: 5 },
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.keysText = this.add
      .text(16, 50, "", {
        fontSize: "16px",
        fontFamily: "Arial",
        color: "#ffff00",
        backgroundColor: "#000000aa",
        padding: { x: 10, y: 5 },
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.scoreText = this.add
      .text(16, 84, "", {
        fontSize: "16px",
        fontFamily: "Arial",
        color: "#00ff00",
        backgroundColor: "#000000aa",
        padding: { x: 10, y: 5 },
      })
      .setScrollFactor(0)
      .setDepth(100);

    // Instruções
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
    // Pausar o jogo
    this.physics.pause();

    // Mensagem de nível completo
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

    // Efeito de pulsação
    this.tweens.add({
      targets: completeText,
      scale: { from: 0.8, to: 1.2 },
      duration: 1000,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        // Próximo nível ou tela de vitória
        this.time.delayedCall(1000, () => {
          // Por agora, voltar ao menu
          this.scene.start("MainMenu");
        });
      },
    });
  }

  update() {
    if (!this.player || !this.player.body) return;

    const speed = 100;
    const runSpeed = 160;

    // Verificar se está correndo (Shift)
    const isRunning = this.input.keyboard.checkDown(
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
    );
    const currentSpeed = isRunning ? runSpeed : speed;

    // Movimento horizontal
    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.player.setVelocityX(-currentSpeed);
      this.player.setFlipX(true);

      if (isRunning) {
        this.player.play("run", true);
      } else {
        this.player.play("walk", true);
      }
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.player.setVelocityX(currentSpeed);
      this.player.setFlipX(false);

      if (isRunning) {
        this.player.play("run", true);
      } else {
        this.player.play("walk", true);
      }
    } else {
      this.player.setVelocityX(0);
    }

    // Movimento vertical
    if (this.cursors.up.isDown || this.keyW.isDown) {
      this.player.setVelocityY(-currentSpeed);

      if (this.player.body.velocity.x === 0) {
        if (isRunning) {
          this.player.play("run", true);
        } else {
          this.player.play("walk", true);
        }
      }
    } else if (this.cursors.down.isDown || this.keyS.isDown) {
      this.player.setVelocityY(currentSpeed);

      if (this.player.body.velocity.x === 0) {
        if (isRunning) {
          this.player.play("run", true);
        } else {
          this.player.play("walk", true);
        }
      }
    } else {
      this.player.setVelocityY(0);
    }

    // Idle quando parado
    if (
      this.player.body.velocity.x === 0 &&
      this.player.body.velocity.y === 0
    ) {
      this.player.play("idle", true);
    }

    // DEBUG: Atualizar posição do círculo debug
    if (this.debugCircle) {
      this.debugCircle.setPosition(this.player.x, this.player.y);
    }
  }

  // Método para quando o jogador morrer ou perder
  gameOver() {
    const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);

    this.scene.start("GameOver", {
      level: this.level,
      score: this.score,
      timeElapsed: timeElapsed,
      timeTravels: this.timeTravelManager.getTravelCount(),
    });
  }
}
