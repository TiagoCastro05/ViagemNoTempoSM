/**
 * Classe Player - Entidade do personagem jogável
 * Responsável por: movimento, animações, propriedades físicas
 * Herda de Phaser.Physics.Arcade.Sprite para física automática
 *
 * NOTA: Esta classe foi criada mas o jogo atualmente usa sprite direto no Game.js
 * Mantida para possível uso futuro e organização do código
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  /**
   * Construtor do jogador
   * @param {Phaser.Scene} scene - Cena onde o jogador será criado
   * @param {number} x - Posição X inicial
   * @param {number} y - Posição Y inicial
   */
  constructor(scene, x, y) {
    super(scene, x, y, "player_walk");

    // Adicionar ao scene e ao sistema de física
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configurar propriedades físicas
    this.setCollideWorldBounds(true); // Não sai dos limites do mundo
    this.body.setSize(20, 24); // Hitbox do corpo
    this.body.setOffset(10, 12); // Offset da hitbox
    this.setDepth(100); // Aparecer acima de tudo
    this.setScale(0.5); // 48px * 0.5 = 24px (tamanho visual)

    // Configurações de velocidade
    this.walkSpeed = 120; // Pixels por segundo

    // Criar animações
    this.createAnimations();

    // Iniciar com animação padrão
    this.play("walk");
  }

  /**
   * Criar todas as animações do personagem
   * Verifica se já existe para evitar duplicação
   */
  createAnimations() {
    const scene = this.scene;

    // Criar animação de caminhada (se não existir)
    if (!scene.anims.exists("walk")) {
      scene.anims.create({
        key: "walk",
        frames: scene.anims.generateFrameNumbers("player_walk", {
          start: 0,
          end: 7,
        }),
        frameRate: 10, // 10 frames por segundo
        repeat: -1, // Loop infinito
      });
    }
  }

  /**
   * Atualizar movimento do jogador baseado no input
   * @param {Object} cursors - Teclas direcionais (cursor keys)
   * @param {Object} wasd - Teclas WASD
   */
  updateMovement(cursors, wasd) {
    // Resetar velocidade (para de mover se não pressionar nada)
    this.setVelocity(0, 0);

    let isMoving = false;

    // Movimento horizontal
    if (cursors.left.isDown || wasd.left.isDown) {
      this.setVelocityX(-this.walkSpeed);
      this.setFlipX(true); // Virar sprite para esquerda
      isMoving = true;
    } else if (cursors.right.isDown || wasd.right.isDown) {
      this.setVelocityX(this.walkSpeed);
      this.setFlipX(false); // Virar sprite para direita
      isMoving = true;
    }

    // Movimento vertical
    if (cursors.up.isDown || wasd.up.isDown) {
      this.setVelocityY(-this.walkSpeed);
      isMoving = true;
    } else if (cursors.down.isDown || wasd.down.isDown) {
      this.setVelocityY(this.walkSpeed);
      isMoving = true;
    }

    // Tocar animação de caminhada (sempre ativa)
    this.play("walk", true);
  }
}
