/**
 * Classe SettingsManager - Gerencia configurações do jogo
 * Responsável por: salvar/carregar preferências, volume de música e efeitos
 * Usa localStorage para persistência entre sessões
 */
export class SettingsManager {
  constructor() {
    // Carregar configurações salvas ou usar padrões
    this.settings = this.loadSettings();
  }

  /**
   * Carregar configurações do localStorage
   * @returns {Object} Configurações salvas ou padrões
   */
  loadSettings() {
    const saved = localStorage.getItem("viagemNoTempoSettings");
    if (saved) {
      return JSON.parse(saved);
    }

    // Configurações padrão
    return {
      musicVolume: 0.3, // Volume da música (0.0 - 1.0)
      sfxVolume: 0.6, // Volume dos efeitos sonoros (0.0 - 1.0)
    };
  }

  /**
   * Salvar configurações no localStorage
   */
  saveSettings() {
    localStorage.setItem(
      "viagemNoTempoSettings",
      JSON.stringify(this.settings)
    );
  }

  /**
   * Definir volume da música
   * @param {number} volume - Valor entre 0.0 e 1.0
   */
  setMusicVolume(volume) {
    this.settings.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
    this.saveSettings();
  }

  /**
   * Definir volume dos efeitos sonoros
   * @param {number} volume - Valor entre 0.0 e 1.0
   */
  setSfxVolume(volume) {
    this.settings.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
    this.saveSettings();
  }

  /**
   * Obter volume da música
   * @returns {number} Volume entre 0.0 e 1.0
   */
  getMusicVolume() {
    return this.settings.musicVolume;
  }

  /**
   * Obter volume dos efeitos sonoros
   * @returns {number} Volume entre 0.0 e 1.0
   */
  getSfxVolume() {
    return this.settings.sfxVolume;
  }
}

// Instância global - singleton para acesso em todo o jogo
export const settingsManager = new SettingsManager();
