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
    this.setDepth(50);

    this.createFloatingAnimation(scene);
    this.createGlowAnimation(scene);
  }

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

  collect() {
    this.scene.tweens.add({
      targets: this,
      scale: 2,
      alpha: 0,
      duration: 300,
      ease: "Power2",
      onComplete: () => this.destroy(),
    });
  }
}
