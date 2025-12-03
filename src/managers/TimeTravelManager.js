/**
 * Classe TimeTravelManager - Gerencia a mecânica central de viagem no tempo
 * Responsável por: alternar entre passado/futuro, efeitos visuais, visibilidade de layers
 * Esta é a mecânica principal do puzzle do jogo
 */
export class TimeTravelManager {
  constructor(scene) {
    this.scene = scene;
    this.currentTime = "futuro"; // Estado inicial: 'passado' ou 'futuro'
    this.timeTravels = 0; // Contador de viagens realizadas

    // Referências para os layers do tilemap (definidas depois)
    this.passadoBackground = null;
    this.passadoPrincipal = null;
    this.futuroBackground = null;
    this.futuroPrincipal = null;
  }

  /**
   * Configurar referências dos layers do tilemap
   * Deve ser chamado após a criação dos layers
   * @param {Phaser.Tilemaps.TilemapLayer} passadoBg - Layer de fundo do passado
   * @param {Phaser.Tilemaps.TilemapLayer} passadoPrinc - Layer principal do passado
   * @param {Phaser.Tilemaps.TilemapLayer} futuroBg - Layer de fundo do futuro
   * @param {Phaser.Tilemaps.TilemapLayer} futuroPrinc - Layer principal do futuro
   */
  setLayers(passadoBg, passadoPrinc, futuroBg, futuroPrinc) {
    this.passadoBackground = passadoBg;
    this.passadoPrincipal = passadoPrinc;
    this.futuroBackground = futuroBg;
    this.futuroPrincipal = futuroPrinc;

    // Configurar visibilidade inicial (começa no futuro)
    this.updateLayerVisibility();
  }

  /**
   * Alternar entre passado e futuro
   * Cria efeito visual de flash e atualiza layers visíveis
   * @returns {string} Tempo atual após a viagem ('passado' ou 'futuro')
   */
  travel() {
    // Alternar estado temporal
    this.currentTime = this.currentTime === "passado" ? "futuro" : "passado";
    this.timeTravels++;

    // Efeito visual de transição (flash branco)
    this.scene.cameras.main.flash(500, 255, 255, 255);

    // Atualizar quais layers são visíveis
    this.updateLayerVisibility();

    // Log para debug
    console.log(
      `Viajou para o ${this.currentTime} (viagem #${this.timeTravels})`
    );

    return this.currentTime;
  }

  /**
   * Atualizar visibilidade dos layers baseado no tempo atual
   * Mostra layers do passado OU futuro, nunca ambos
   */
  updateLayerVisibility() {
    const isPassado = this.currentTime === "passado";

    // Passado: visível apenas se estivermos no passado
    this.passadoBackground?.setVisible(isPassado);
    this.passadoPrincipal?.setVisible(isPassado);

    // Futuro: visível apenas se estivermos no futuro
    this.futuroBackground?.setVisible(!isPassado);
    this.futuroPrincipal?.setVisible(!isPassado);
  }

  /**
   * Obter o tempo atual
   * @returns {string} 'passado' ou 'futuro'
   */
  getCurrentTime() {
    return this.currentTime;
  }

  /**
   * Obter número de viagens realizadas
   * Útil para estatísticas e rankings
   * @returns {number} Total de viagens no tempo
   */
  getTravelCount() {
    return this.timeTravels;
  }

  /**
   * Resetar para um novo jogo
   * Volta ao estado inicial (futuro, 0 viagens)
   */
  reset() {
    this.currentTime = "futuro";
    this.timeTravels = 0;
    this.updateLayerVisibility();
  }
}
