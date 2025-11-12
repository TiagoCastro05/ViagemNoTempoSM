// NOTA: Esta scene não está mais em uso.
// O menu principal foi movido para MainMenu.js
// Você pode deletar este arquivo se quiser.

export class Start extends Phaser.Scene {
  constructor() {
    super("Start");
  }

  preload() {}

  create() {
    // Redireciona para o MainMenu
    this.scene.start("MainMenu");
  }

  update() {}
}
