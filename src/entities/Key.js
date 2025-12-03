/**
 * Classe Key - Entidade coletável (chave)
 * Responsável por: animações visuais, efeitos de flutuaciacao e brilho, efeito de coleta
 * Herda de Phaser.Physics.Arcade.Sprite para ter física automática
 */
export class Key extends Phaser.Physics.Arcade.Sprite {
  /**
   * Construtor da chave
   * @param {Phaser.Scene} scene - Cena onde a chave será criada
   * @param {number} x - Posição X no mundo
   * @param {number} y - Posição Y no mundo
   * @param {number} frame - Frame do spritesheet a usar (padrão: 179)
   */
  constructor(scene, x, y, frame = 179) {
    super(scene, x, y, "chave_sheet", frame);

    // Adicionar ao scene e ao sistema de física
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configurar propriedades físicas e visuais
    this.setScale(1);
    this.body.setAllowGravity(false); // Chave flutua, não cai
    this.setDepth(50); // Aparecer acima do chão mas abaixo do jogador

    // Criar animações visuais
    this.createFloatingAnimation(scene);
    this.createGlowAnimation(scene);
  }

  /**
   * Criar animação de flutuacao (movimento vertical suave)
   * Tween que move a chave para cima e para baixo continuamente
   * @param {Phaser.Scene} scene - Cena para criar o tween
   */
  createFloatingAnimation(scene) {
    scene.tweens.add({
      targets: this,
      y: this.y - 5, // Sobe 5 pixels
      duration: 1000, // 1 segundo
      ease: "Sine.inOut", // Movimento suave
      yoyo: true, // Volta ao original
      repeat: -1, // Repete infinitamente
    });
  }

  /**
   * Criar animação de brilho (pulsacao de alpha)
   * Tween que faz a chave "brilhar" continuamente
   * @param {Phaser.Scene} scene - Cena para criar o tween
   */
  createGlowAnimation(scene) {
    scene.tweens.add({
      targets: this,
      alpha: { from: 0.7, to: 1 }, // Varia transparência
      duration: 800, // 0.8 segundos
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * Efeito de coleta da chave
   * Aumenta escala e desaparece antes de destruir
   * Chamado quando o jogador coleta a chave
   */
  collect() {
    this.scene.tweens.add({
      targets: this,
      scale: 2, // Aumenta tamanho
      alpha: 0, // Desaparece
      duration: 300, // Rápido (0.3s)
      ease: "Power2",
      onComplete: () => this.destroy(), // Remove do jogo após animação
    });
  }
}
