import { settingsManager } from "../managers/SettingsManager.js";

export class MainMenu extends Phaser.Scene {
  constructor() {
    super("MainMenu");
    this.currentView = "menu";
    this.background = null;
    this.musicaMenu = null;
  }

  create() {
    // Fundo com imagem
    this.background = this.add.image(960, 540, "menuBackground");
    this.background.setDisplaySize(1920, 1080);
    this.background.setDepth(-1);

    // Verificar se precisa reiniciar a música
    if (this.sound.context && this.sound.context.state !== "suspended") {
      // Se a música ainda não existe, criar
      if (!this.musicaMenu) {
        this.musicaMenu = this.sound.add("menuMusic", {
          volume: settingsManager.getMusicVolume(),
          loop: true,
        });
      } else {
        // Atualizar volume se as configurações mudaram
        this.musicaMenu.setVolume(settingsManager.getMusicVolume());
      }

      // Se a música existe mas não está a tocar, tocar
      if (this.musicaMenu && !this.musicaMenu.isPlaying) {
        this.musicaMenu.play();
      }
    }

    this.showMainMenu();
  }

  showMainMenu() {
    this.clearScreen();
    this.currentView = "menu";

    // Título do jogo
    const title = this.add
      .text(960, 150, "VIAGEM NO TEMPO", {
        fontSize: "72px",
        fontFamily: "Arial",
        color: "#00ffff",
        stroke: "#000000",
        strokeThickness: 6,
        shadow: {
          offsetX: 3,
          offsetY: 3,
          color: "#000",
          blur: 5,
          fill: true,
        },
      })
      .setOrigin(0.5);

    // Efeito de pulsação no título
    this.tweens.add({
      targets: title,
      scale: { from: 1, to: 1.05 },
      duration: 2000,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    // Subtítulo
    this.add
      .text(960, 230, "Escape do Edifício Temporal", {
        fontSize: "24px",
        fontFamily: "Arial",
        color: "#ffffff",
        alpha: 0.8,
      })
      .setOrigin(0.5);

    // Botões do menu
    const buttonY = 350;
    const buttonSpacing = 100;

    // Botão Jogar
    this.createMenuButton(960, buttonY, "JOGAR", () => this.startGame());

    // Botão Inicial
    this.createMenuButton(960, buttonY + buttonSpacing, "SOBRE O JOGO", () =>
      this.showInicial()
    );

    // Botão Instruções
    this.createMenuButton(960, buttonY + buttonSpacing * 2, "INSTRUÇÕES", () =>
      this.showInstrucoes()
    );

    // Botão Configurações
    this.createMenuButton(
      960,
      buttonY + buttonSpacing * 3,
      "CONFIGURAÇÕES",
      () => this.scene.start("Settings")
    );
  }

  createMenuButton(x, y, text, callback) {
    // Fundo do botão
    const button = this.add.rectangle(x, y, 400, 80, 0x2a1f4a);
    button.setStrokeStyle(3, 0x00ffff);
    button.setInteractive({ useHandCursor: true });

    // Texto do botão
    const buttonText = this.add
      .text(x, y, text, {
        fontSize: "36px",
        fontFamily: "Arial",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

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

      // Iniciar música no primeiro clique (após unlock)
      if (!this.musicaMenu) {
        // Garantir que o contexto está ativo
        const startMusic = () => {
          this.musicaMenu = this.sound.add("menuMusic", {
            volume: 0.3,
            loop: true,
          });
          this.musicaMenu.play();
        };

        if (this.sound.context && this.sound.context.state === "suspended") {
          this.sound.context.resume().then(startMusic);
        } else {
          startMusic();
        }
      }
    });

    button.on("pointerup", () => {
      button.setFillStyle(0x3d2f5f);
      callback();
    });

    return { button, buttonText };
  }

  showInicial() {
    this.clearScreen();
    this.currentView = "inicial";

    // Fundo escuro semi-transparente para melhorar legibilidade
    const overlay = this.add.rectangle(960, 400, 1400, 700, 0x000000, 0.75);
    overlay.setDepth(0);

    // Título
    this.add
      .text(960, 80, "SOBRE O JOGO", {
        fontSize: "48px",
        fontFamily: "Arial",
        color: "#00ffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(1);

    // Conteúdo informativo
    const infoText = [
      "Estás preso em um edifício misterioso.",
      "",
      "Para escapar, tens de resolver puzzles",
      "viajando entre o passado e presente.",
      "",
      "No passado, paredes ainda não foram construídas.",
      "",
      "Use essas diferenças temporais para encontrares",
      "o caminho e completar cada nível!",
      "",
      "Boa sorte, viajante do tempo...",
    ];

    let yPos = 180;
    infoText.forEach((line) => {
      this.add
        .text(960, yPos, line, {
          fontSize: "24px",
          fontFamily: "Arial",
          color: "#ffffff",
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(1);
      yPos += 35;
    });

    // Botão voltar
    this.createMenuButton(960, 620, "VOLTAR", () => this.showMainMenu());
  }

  showInstrucoes() {
    this.clearScreen();
    this.currentView = "instrucoes";

    // Fundo escuro semi-transparente para melhorar legibilidade
    const overlay = this.add.rectangle(960, 500, 1500, 900, 0x000000, 0.75);
    overlay.setDepth(0);

    // Título
    this.add
      .text(960, 80, "INSTRUÇÕES", {
        fontSize: "48px",
        fontFamily: "Arial",
        color: "#00ffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(1);

    // Instruções
    const instructions = [
      "COMO JOGAR:",
      "",
      "• Use as SETAS ou WASD para mover o personagem",
      "",
      "• Pressione ESPAÇO para viajar no tempo",
      "",
      "• Encontre caminhos alternativos em diferentes épocas",
      "",
      "• Apanha a CHAVE para poder abrir a PORTA de saída",
      "",
      "• Chegue à saída para completar cada nível",
      "",
      "• A Água, Lava e Picos MATAM-TE instantaneamente!",
      "",
      "• MORRES se ficares preso dentro de paredes ou objetos ao viajar no tempo!",
      "",
      "DICA: Observe bem o ambiente em cada época!",
    ];

    let yPos = 180;
    instructions.forEach((line) => {
      const fontSize = line.startsWith("•")
        ? "22px"
        : line.endsWith(":")
        ? "28px"
        : "22px";
      const color = line.startsWith("DICA:") ? "#ffff00" : "#ffffff";

      this.add
        .text(960, yPos, line, {
          fontSize: fontSize,
          fontFamily: "Arial",
          color: color,
          align: "center",
          fontStyle: line.endsWith(":") ? "bold" : "normal",
        })
        .setOrigin(0.5)
        .setDepth(1);
      yPos += line === "" ? 20 : 35;
    });

    // Botão voltar
    this.createMenuButton(960, 820, "VOLTAR", () => this.showMainMenu());
  }

  startGame() {
    // Música do menu continua a tocar durante o jogo
    // Efeito de transição
    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.time.delayedCall(500, () => {
      // Iniciar a cena do jogo
      this.scene.start("Game");
    });
  }

  clearScreen() {
    // Remove todos os objetos da cena exceto o fundo (background)
    const children = [...this.children.list];
    children.forEach((child) => {
      // Não destruir o fundo
      if (child !== this.background && child.type !== "Graphics") {
        child.destroy();
      }
    });
  }

  update() {
    // Aqui você pode adicionar animações de fundo se desejar
  }
}
