/**
 * Classe Key - Controla os objetos coletáveis (chaves)
 * Responsável por: animações, efeitos visuais e propriedades das chaves
 */
export class Key extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, frame = 179) {
    super(scene, x, y, "chave_sheet", frame);

    // Adicionar ao scene e ao sistema de física
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configurar propriedades
    this.setScale(1);
    this.body.setAllowGravity(false);
    this.setDepth(50); // Acima das layers mas abaixo do jogador

    // Criar animações visuais
    this.createFloatingAnimation(scene);
    this.createGlowAnimation(scene);

    console.log(
      `Key criada em (${this.x}, ${this.y}), depth: ${this.depth}, visible: ${this.visible}`
    );
  }

  /**
   * Criar animação de flutuação
   */
  createFloatingAnimation(scene) {
    scene.tweens.add({
      targets: this,
      y: this.y - 5,
      duration: 1000,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * Criar efeito de brilho pulsante
   */
  createGlowAnimation(scene) {
    scene.tweens.add({
      targets: this,
      alpha: { from: 0.7, to: 1 },
      duration: 800,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * Método chamado quando a chave é coletada
   */
  collect() {
    // Efeito visual antes de destruir
    this.scene.tweens.add({
      targets: this,
      scale: 2,
      alpha: 0,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        this.destroy();
      },
    });
  }
}
