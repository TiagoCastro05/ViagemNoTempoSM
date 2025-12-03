import { settingsManager } from "../managers/SettingsManager.js";

export class Settings extends Phaser.Scene {
  constructor() {
    super("Settings");
  }

  create() {
    // Fundo com imagem
    this.background = this.add.image(960, 540, "menuBackground");
    this.background.setDisplaySize(1920, 1080);
    this.background.setDepth(-1);

    // Overlay escuro para legibilidade
    const overlay = this.add.rectangle(960, 540, 1600, 900, 0x000000, 0.8);
    overlay.setDepth(0);

    // Título
    this.add
      .text(960, 80, "CONFIGURAÇÕES", {
        fontSize: "48px",
        fontFamily: "Arial",
        color: "#00ffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(1);

    // Volume da Música
    this.createVolumeControl(
      "VOLUME DA MÚSICA",
      250,
      settingsManager.getMusicVolume(),
      (value) => {
        settingsManager.setMusicVolume(value);
        // Atualizar volume da música atual
        const menuMusic = this.sound.get("menuMusic");
        if (menuMusic) {
          menuMusic.setVolume(value);
        }
      }
    );

    // Volume dos Efeitos Sonoros
    this.createVolumeControl(
      "VOLUME DOS EFEITOS",
      400,
      settingsManager.getSfxVolume(),
      (value) => {
        settingsManager.setSfxVolume(value);
      }
    );

    // Botão Voltar
    this.createMenuButton(960, 550, "VOLTAR", () => {
      this.scene.start("MainMenu");
    });
  }

  createVolumeControl(label, y, initialValue, onChange) {
    // Label
    this.add
      .text(400, y, label, {
        fontSize: "28px",
        fontFamily: "Arial",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5)
      .setDepth(1);

    // Barra de fundo
    const barBg = this.add.rectangle(1100, y, 400, 20, 0x2a1f4a);
    barBg.setStrokeStyle(2, 0x00ffff);
    barBg.setDepth(1);
    barBg.setInteractive({ useHandCursor: true });

    // Barra de preenchimento
    const barFill = this.add.rectangle(
      900,
      y,
      400 * initialValue,
      20,
      0x00ffff
    );
    barFill.setOrigin(0, 0.5);
    barFill.setDepth(2);

    // Texto de porcentagem
    const percentText = this.add
      .text(1320, y, Math.round(initialValue * 100) + "%", {
        fontSize: "24px",
        fontFamily: "Arial",
        color: "#00ffff",
      })
      .setOrigin(0, 0.5)
      .setDepth(1);

    // Interação com a barra
    barBg.on("pointerdown", (pointer) => {
      this.updateVolumeBar(pointer, barBg, barFill, percentText, onChange);
    });

    barBg.on("pointermove", (pointer) => {
      if (pointer.isDown) {
        this.updateVolumeBar(pointer, barBg, barFill, percentText, onChange);
      }
    });
  }

  updateVolumeBar(pointer, barBg, barFill, percentText, onChange) {
    const x = pointer.x;
    const barLeft = barBg.x - 200;
    const barRight = barBg.x + 200;

    if (x >= barLeft && x <= barRight) {
      const value = (x - barLeft) / 400;
      barFill.width = 400 * value;
      percentText.setText(Math.round(value * 100) + "%");
      onChange(value);
    }
  }

  createMenuButton(x, y, text, callback) {
    // Fundo do botão
    const button = this.add.rectangle(x, y, 400, 80, 0x2a1f4a);
    button.setStrokeStyle(3, 0x00ffff);
    button.setInteractive({ useHandCursor: true });
    button.setDepth(1);

    // Texto do botão
    const buttonText = this.add
      .text(x, y, text, {
        fontSize: "36px",
        fontFamily: "Arial",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(1);

    // Efeitos hover
    button.on("pointerover", () => {
      button.setFillStyle(0x3d2f5f);
      buttonText.setScale(1.1);
    });

    button.on("pointerout", () => {
      button.setFillStyle(0x2a1f4a);
      buttonText.setScale(1);
    });

    button.on("pointerdown", () => {
      button.setFillStyle(0x1a0f2e);
    });

    button.on("pointerup", () => {
      button.setFillStyle(0x3d2f5f);
      callback();
    });

    return { button, buttonText };
  }
}
