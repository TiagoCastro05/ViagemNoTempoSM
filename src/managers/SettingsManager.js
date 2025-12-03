export class SettingsManager {
  constructor() {
    // Carregar configurações salvas ou usar padrões
    this.settings = this.loadSettings();
  }

  loadSettings() {
    const saved = localStorage.getItem("viagemNoTempoSettings");
    if (saved) {
      return JSON.parse(saved);
    }

    // Configurações padrão
    return {
      musicVolume: 0.3,
      sfxVolume: 0.6,
    };
  }

  saveSettings() {
    localStorage.setItem(
      "viagemNoTempoSettings",
      JSON.stringify(this.settings)
    );
  }

  setMusicVolume(volume) {
    this.settings.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
    this.saveSettings();
  }

  setSfxVolume(volume) {
    this.settings.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
    this.saveSettings();
  }

  getMusicVolume() {
    return this.settings.musicVolume;
  }

  getSfxVolume() {
    return this.settings.sfxVolume;
  }
}

// Instância global
export const settingsManager = new SettingsManager();
