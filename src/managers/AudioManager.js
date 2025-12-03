/**
 * Classe para gerir recursos de áudio
 */
export class AudioManager {
  constructor(scene) {
    this.scene = scene;
  }

  static preloadSounds(scene) {
    scene.load.audio("menuMusic", "assets/audio/Menu.mp3");
    scene.load.audio("keyCollect", "assets/audio/Key.mp3");
    scene.load.audio("timeTravel", "assets/audio/ViajarTempo.mp3");
    scene.load.audio("damage", "assets/audio/dano.mp3");
    scene.load.audio("levelComplete", "assets/audio/NivelConcluido.mp3");
    scene.load.audio("gameOverMusic", "assets/audio/GameOverMenu.mp3");
  }

  inicializarSons() {}

  iniciarMusicaMenu() {
    const musica = this.scene.sound.add("menuMusic", {
      volume: 0.3,
      loop: true,
    });
    musica.play();
  }

  pararMusicaMenu() {
    this.scene.sound.stopAll();
  }

  iniciarMusicaGameOver() {
    this.scene.sound.stopAll();
    const musica = this.scene.sound.add("gameOverMusic", {
      volume: 0.3,
      loop: true,
    });
    musica.play();
  }

  pararMusicaGameOver() {
    this.scene.sound.stopAll();
  }

  tocarSomChave() {
    this.scene.sound.play("keyCollect", { volume: 0.5 });
  }

  tocarSomViagemTempo() {
    this.scene.sound.play("timeTravel", { volume: 0.4 });
  }

  tocarSomDano() {
    this.scene.sound.play("damage", { volume: 0.6 });
  }

  tocarSomNivelCompleto() {
    this.scene.sound.play("levelComplete", { volume: 0.5 });
  }
}
