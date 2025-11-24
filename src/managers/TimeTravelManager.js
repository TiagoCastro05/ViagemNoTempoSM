/**
 * Classe TimeTravelManager - Gerencia a mecânica de viagem no tempo
 * Responsável por: alternar entre passado/futuro, efeitos visuais, visibilidade de layers
 */
export class TimeTravelManager {
  constructor(scene) {
    this.scene = scene;
    this.currentTime = "futuro"; // 'passado' ou 'futuro'
    this.timeTravels = 0;

    // Referências para os layers (serão definidas depois)
    this.passadoBackground = null;
    this.passadoPrincipal = null;
    this.futuroBackground = null;
    this.futuroPrincipal = null;
  }

  /**
   * Configurar referências dos layers
   */
  setLayers(passadoBg, passadoPrinc, futuroBg, futuroPrinc) {
    this.passadoBackground = passadoBg;
    this.passadoPrincipal = passadoPrinc;
    this.futuroBackground = futuroBg;
    this.futuroPrincipal = futuroPrinc;

    // Configurar visibilidade inicial
    this.updateLayerVisibility();
  }

  /**
   * Alternar entre passado e futuro
   */
  travel() {
    // Alternar tempo
    this.currentTime = this.currentTime === "passado" ? "futuro" : "passado";
    this.timeTravels++;

    // Efeito visual de transição
    this.scene.cameras.main.flash(500, 255, 255, 255);

    // Atualizar visibilidade dos layers
    this.updateLayerVisibility();

    console.log(
      `Viajou para o ${this.currentTime} (viagem #${this.timeTravels})`
    );

    return this.currentTime;
  }

  /**
   * Atualizar visibilidade dos layers baseado no tempo atual
   */
  updateLayerVisibility() {
    if (this.currentTime === "passado") {
      this.passadoBackground?.setVisible(true);
      this.passadoPrincipal?.setVisible(true);
      this.futuroBackground?.setVisible(false);
      this.futuroPrincipal?.setVisible(false);
    } else {
      this.passadoBackground?.setVisible(false);
      this.passadoPrincipal?.setVisible(false);
      this.futuroBackground?.setVisible(true);
      this.futuroPrincipal?.setVisible(true);
    }
  }

  /**
   * Obter o tempo atual
   */
  getCurrentTime() {
    return this.currentTime;
  }

  /**
   * Obter número de viagens realizadas
   */
  getTravelCount() {
    return this.timeTravels;
  }

  /**
   * Resetar para um novo jogo
   */
  reset() {
    this.currentTime = "passado";
    this.timeTravels = 0;
    this.updateLayerVisibility();
  }
}
