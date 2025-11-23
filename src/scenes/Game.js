export class Game extends Phaser.Scene {
  constructor() {
    super("Game");

    // Estado do jogo
    this.currentTime = "passado"; // 'passado' ou 'futuro'
    this.keysCollected = 0;
    this.totalKeys = 2;
    this.level = 1;
    this.score = 0;
    this.timeTravels = 0;
    this.startTime = 0;
  }

  preload() {
    // Carregar mapa Tiled (formato XML)
    this.load.tilemapTiledXML("map", "assets/mapa/mapas.tmx");

    // Carregar tilesets - ajustar conforme os arquivos disponíveis
    this.load.image("tiles_passado", "assets/mapa/Passado/Dungeon_Tileset.png");

    // Para o futuro, vamos tentar encontrar um tileset apropriado
    // Por enquanto, vou usar o mesmo do passado como placeholder
    this.load.image("tiles_futuro", "assets/mapa/Passado/Dungeon_Tileset.png");

    // Carregar personagem (spritesheet)
    this.load.spritesheet(
      "player_idle",
      "assets/personagem/personagem/Idle.png",
      {
        frameWidth: 48,
        frameHeight: 48,
      }
    );
    this.load.spritesheet(
      "player_walk",
      "assets/personagem/personagem/Walk.png",
      {
        frameWidth: 48,
        frameHeight: 48,
      }
    );
    this.load.spritesheet(
      "player_run",
      "assets/personagem/personagem/Run.png",
      {
        frameWidth: 48,
        frameHeight: 48,
      }
    );

    // Carregar chave
    this.load.image("key", "assets/mapa/chave/16x16/key_t.png");
  }

  create() {
    this.startTime = Date.now();

    // Criar o mapa
    this.map = this.add.tilemap("map");

    // Adicionar tilesets - o nome deve corresponder ao definido no TMX
    // NOTA: Os nomes dos tilesets no TMX devem corresponder aos nomes aqui
    const tilesetPassado = this.map.addTilesetImage("passado", "tiles_passado");
    const tilesetFuturo = this.map.addTilesetImage("futuro", "tiles_futuro");

    // Verificar se os tilesets foram carregados
    if (!tilesetPassado || !tilesetFuturo) {
      console.error(
        "Erro ao carregar tilesets. Verifique os nomes no arquivo TMX."
      );
      // Criar um fundo simples como fallback
      this.add
        .rectangle(
          0,
          0,
          this.map.widthInPixels,
          this.map.heightInPixels,
          0x1a1a1a
        )
        .setOrigin(0);
    }

    // Criar layers - PASSADO
    this.passadoBackground = this.map.createLayer(
      "Passado BackGround",
      tilesetPassado
    );
    this.passadoPrincipal = this.map.createLayer(
      "Passado Principal",
      tilesetPassado
    );

    // Criar layers - FUTURO
    this.futuroBackground = this.map.createLayer(
      "Futuro background",
      tilesetFuturo
    );
    this.futuroPrincipal = this.map.createLayer(
      "Futuro principal",
      tilesetFuturo
    );

    // Inicialmente, mostrar apenas o passado
    if (this.futuroBackground) this.futuroBackground.setVisible(false);
    if (this.futuroPrincipal) this.futuroPrincipal.setVisible(false);

    // Configurar colisões nas layers principais
    if (this.passadoPrincipal) {
      this.passadoPrincipal.setCollisionByProperty({ collides: true });
      // Se não tiver property 'collides', usar exclusão de tiles vazios
      this.passadoPrincipal.setCollisionByExclusion([-1, 6, 68]); // -1 = vazio, 6 = chão passado, 68 = chão futuro
    }

    if (this.futuroPrincipal) {
      this.futuroPrincipal.setCollisionByProperty({ collides: true });
      this.futuroPrincipal.setCollisionByExclusion([-1, 6, 68]);
    }

    // Criar o jogador
    this.player = this.physics.add.sprite(50, 100, "player_idle");
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(32, 40);
    this.player.body.setOffset(8, 8);

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

    // Criar animações do personagem
    this.createAnimations();

    // Criar grupos de chaves
    this.keysGroup = this.physics.add.group();
    this.spawnKeys();

    // Configurar coleta de chaves
    this.physics.add.overlap(
      this.player,
      this.keysGroup,
      this.collectKey,
      null,
      this
    );

    // Configurar controles
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keySpace = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // Evento de viagem no tempo
    this.keySpace.on("down", () => this.timeTravel());

    // UI
    this.createUI();

    // Debug (opcional - comentar em produção)
    // this.physics.world.createDebugGraphic();
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

    // Obter layer de objetos baseado no tempo atual
    const objectLayerName =
      this.currentTime === "passado" ? "chaves passado" : "chaves futuro";
    const objectLayer = this.map.getObjectLayer(objectLayerName);

    if (!objectLayer) {
      console.warn(`Object layer "${objectLayerName}" não encontrado no mapa`);
      return;
    }

    // Criar chaves nos spawn points
    objectLayer.objects.forEach((obj) => {
      if (obj.type === "item" || obj.name.includes("spawn_key")) {
        const key = this.keysGroup.create(obj.x, obj.y, "key");
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

        // Animação de rotação
        this.tweens.add({
          targets: key,
          angle: 360,
          duration: 2000,
          repeat: -1,
        });
      }
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
    // Alternar entre passado e futuro
    this.currentTime = this.currentTime === "passado" ? "futuro" : "passado";
    this.timeTravels++;

    // Efeito visual de transição
    this.cameras.main.flash(500, 255, 255, 255);

    // Trocar visibilidade dos layers
    if (this.currentTime === "passado") {
      this.passadoBackground.setVisible(true);
      this.passadoPrincipal.setVisible(true);
      this.futuroBackground.setVisible(false);
      this.futuroPrincipal.setVisible(false);
    } else {
      this.passadoBackground.setVisible(false);
      this.passadoPrincipal.setVisible(false);
      this.futuroBackground.setVisible(true);
      this.futuroPrincipal.setVisible(true);
    }

    // Spawn novas chaves para o tempo atual
    this.spawnKeys();

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
    const timeLabel = this.currentTime === "passado" ? "PASSADO" : "FUTURO";
    const timeColor = this.currentTime === "passado" ? "#00ffff" : "#ff00ff";

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
  }

  // Método para quando o jogador morrer ou perder
  gameOver() {
    const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);

    this.scene.start("GameOver", {
      level: this.level,
      score: this.score,
      timeElapsed: timeElapsed,
      timeTravels: this.timeTravels,
    });
  }
}
