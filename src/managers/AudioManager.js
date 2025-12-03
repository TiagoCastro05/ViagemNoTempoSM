/**
 * Classe AudioManager - Gerencia recursos de áudio do jogo
 * Responsável por: pré-carregar sons, controlar músicas e efeitos sonoros
 * Centraliza toda a lógica de áudio para facilitar manutenção
 */
export class AudioManager {
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Pré-carregar todos os sons do jogo (método estático)
   * Chamado no preload() das cenas
   * @param {Phaser.Scene} scene - Cena onde carregar os sons
   */
  static preloadSounds(scene) {
    scene.load.audio("menuMusic", "assets/audio/Menu.mp3");
    scene.load.audio("keyCollect", "assets/audio/Key.mp3");
    scene.load.audio("timeTravel", "assets/audio/ViajarTempo.mp3");
    scene.load.audio("damage", "assets/audio/dano.mp3");
    scene.load.audio("levelComplete", "assets/audio/NivelConcluido.mp3");
    scene.load.audio("gameOverMusic", "assets/audio/GameOverMenu.mp3");
  }

  /**
   * Inicializar sistema de sons (placeholder para futuras configurações)
   */
  inicializarSons() {
    // Reservado para configurações futuras de áudio
  }

  /**
   * Iniciar música do menu principal
   * Volume e loop configurados para experiência contínua
   */
  iniciarMusicaMenu() {
    const musica = this.scene.sound.add("menuMusic", {
      volume: 0.3,
      loop: true,
    });
    musica.play();
  }

  /**
   * Parar música do menu
   * Para todos os sons ativos na cena
   */
  pararMusicaMenu() {
    this.scene.sound.stopAll();
  }

  /**
   * Iniciar música do Game Over
   * Para sons anteriores e inicia nova música
   */
  iniciarMusicaGameOver() {
    this.scene.sound.stopAll();
    const musica = this.scene.sound.add("gameOverMusic", {
      volume: 0.3,
      loop: true,
    });
    musica.play();
  }

  /**
   * Parar música do Game Over
   */
  pararMusicaGameOver() {
    this.scene.sound.stopAll();
  }

  /**
   * Tocar som de coletar chave
   * Efeito sonoro curto e satisfatório
   */
  tocarSomChave() {
    this.scene.sound.play("keyCollect", { volume: 0.5 });
  }

  /**
   * Tocar som de viagem no tempo
   * Efeito sonoro mágico/sci-fi
   */
  tocarSomViagemTempo() {
    this.scene.sound.play("timeTravel", { volume: 0.4 });
  }

  /**
   * Tocar som de dano/morte
   * Volume mais alto para impacto
   */
  tocarSomDano() {
    this.scene.sound.play("damage", { volume: 0.6 });
  }

  /**
   * Tocar som de nível completo
   * Celebração de vitória
   */
  tocarSomNivelCompleto() {
    this.scene.sound.play("levelComplete", { volume: 0.5 });
  }
}
