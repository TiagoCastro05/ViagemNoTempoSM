/**
 * Classe Player - Controla o personagem jogável
 * Responsável por: movimento, animações, e propriedades físicas do jogador
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "player_idle");

    // Adicionar ao scene e ao sistema de física
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configurar propriedades físicas
    this.setCollideWorldBounds(true);
    this.body.setSize(24, 28);
    this.body.setOffset(12, 10);
    this.setDepth(100);
    this.setScale(0.67); // 48px * 0.67 ≈ 32px (2 tiles de 16x16)

    // Velocidades
    this.walkSpeed = 120;

    // Criar animações
    this.createAnimations();

    // Iniciar com animação idle
    this.play("idle");

    console.log("Jogador criado:", this.x, this.y, "depth:", this.depth);
    console.log("Sprite visível:", this.visible, "alpha:", this.alpha);
    console.log("Texture:", this.texture.key, "frame:", this.frame.name);
    console.log("Scale:", this.scaleX, this.scaleY);
    console.log("Tint:", this.tint);
  }

  /**
   * Criar todas as animações do personagem
   */
  createAnimations() {
    const scene = this.scene;

    // Verificar se as animações já existem para não duplicar
    if (!scene.anims.exists("idle")) {
      scene.anims.create({
        key: "idle",
        frames: scene.anims.generateFrameNumbers("player_idle", {
          start: 0,
          end: 3,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!scene.anims.exists("walk")) {
      scene.anims.create({
        key: "walk",
        frames: scene.anims.generateFrameNumbers("player_walk", {
          start: 0,
          end: 7,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }
  }

  /**
   * Atualizar movimento do jogador baseado no input
   * @param {Object} cursors - Teclas direcionais
   * @param {Object} wasd - Teclas WASD
   * @param {Boolean} isRunning - Se está pressionando Shift
   */
  updateMovement(cursors, wasd, isRunning) {
    const currentSpeed = isRunning ? this.runSpeed : this.walkSpeed;

    // Resetar velocidade
    this.setVelocity(0, 0);

    let isMoving = false;

    // Movimento horizontal
    if (cursors.left.isDown || wasd.left.isDown) {
      this.setVelocityX(-currentSpeed);
      this.setFlipX(true);
      isMoving = true;
    } else if (cursors.right.isDown || wasd.right.isDown) {
      this.setVelocityX(currentSpeed);
      this.setFlipX(false);
      isMoving = true;
    }

    // Movimento vertical
    if (cursors.up.isDown || wasd.up.isDown) {
      this.setVelocityY(-currentSpeed);
      isMoving = true;
    } else if (cursors.down.isDown || wasd.down.isDown) {
      this.setVelocityY(currentSpeed);
      isMoving = true;
    }

    // Atualizar animação baseado no movimento
    if (isMoving) {
      if (isRunning) {
        this.play("run", true);
      } else {
        this.play("walk", true);
      }
    } else {
      this.play("idle", true);
    }
  }
}
