export class MainMenu extends Phaser.Scene {
  constructor() {
    super("MainMenu");
    this.currentView = "menu"; // 'menu', 'inicial', 'instrucoes'
    this.background = null; // Referência ao fundo
  }

  preload() {
    // Aqui você pode carregar imagens de fundo ou assets específicos do menu
  }

  create() {
    // Fundo com gradiente escuro para dar atmosfera de mistério (criado apenas uma vez)
    if (!this.background) {
      this.background = this.add.graphics();
      this.background.fillGradientStyle(
        0x1a0f2e,
        0x1a0f2e,
        0x0d0617,
        0x0d0617,
        1
      );
      this.background.fillRect(0, 0, 1280, 720);
      this.background.setDepth(-1); // Garantir que fica sempre atrás
    }

    this.showMainMenu();
  }

  showMainMenu() {
    this.clearScreen();
    this.currentView = "menu";

    // Título do jogo
    const title = this.add
      .text(640, 150, "VIAGEM NO TEMPO", {
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
      .text(640, 230, "Escape do Edifício Temporal", {
        fontSize: "24px",
        fontFamily: "Arial",
        color: "#ffffff",
        alpha: 0.8,
      })
      .setOrigin(0.5);

    // Botões do menu
    const buttonY = 350;
    const buttonSpacing = 100;

    // Botão Inicial
    this.createMenuButton(640, buttonY, "INICIAL", () => this.showInicial());

    // Botão Instruções
    this.createMenuButton(640, buttonY + buttonSpacing, "INSTRUÇÕES", () =>
      this.showInstrucoes()
    );

    // Botão Jogar
    this.createMenuButton(640, buttonY + buttonSpacing * 2, "JOGAR", () =>
      this.startGame()
    );

    // Botão TESTE GAME OVER (Temporário - remover depois)
    const testButton = this.createMenuButton(
      640,
      buttonY + buttonSpacing * 3,
      "🧪 TESTAR GAME OVER",
      () => this.testGameOver()
    );
    testButton.button.setFillStyle(0x4a1f2a); // Cor diferente para indicar que é teste
    testButton.buttonText.setFontSize("22px");

    // Rodapé com informação adicional
    this.add
      .text(640, 680, "Use o mouse para navegar", {
        fontSize: "18px",
        fontFamily: "Arial",
        color: "#888888",
      })
      .setOrigin(0.5);
  }

  createMenuButton(x, y, text, callback) {
    // Fundo do botão
    const button = this.add.rectangle(x, y, 300, 60, 0x2a1f4a);
    button.setStrokeStyle(2, 0x00ffff);
    button.setInteractive({ useHandCursor: true });

    // Texto do botão
    const buttonText = this.add
      .text(x, y, text, {
        fontSize: "28px",
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

    // Título
    this.add
      .text(640, 80, "SOBRE O JOGO", {
        fontSize: "48px",
        fontFamily: "Arial",
        color: "#00ffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

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
        .text(640, yPos, line, {
          fontSize: "24px",
          fontFamily: "Arial",
          color: "#ffffff",
          align: "center",
        })
        .setOrigin(0.5);
      yPos += 35;
    });

    // Botão voltar
    this.createMenuButton(640, 620, "VOLTAR", () => this.showMainMenu());
  }

  showInstrucoes() {
    this.clearScreen();
    this.currentView = "instrucoes";

    // Título
    this.add
      .text(640, 80, "INSTRUÇÕES", {
        fontSize: "48px",
        fontFamily: "Arial",
        color: "#00ffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Instruções
    const instructions = [
      "COMO JOGAR:",
      "",
      "• Use as SETAS para mover o personagem",
      "",
      "• Pressione ESPAÇO para viajar no tempo",
      "",
      "• Encontre caminhos alternativos em diferentes épocas",
      "",
      "• Resolva puzzles para desbloquear novas áreas",
      "",
      "• Chegue à saída para completar cada nível",
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
        .text(640, yPos, line, {
          fontSize: fontSize,
          fontFamily: "Arial",
          color: color,
          align: "center",
          fontStyle: line.endsWith(":") ? "bold" : "normal",
        })
        .setOrigin(0.5);
      yPos += line === "" ? 20 : 35;
    });

    // Botão voltar
    this.createMenuButton(640, 620, "VOLTAR", () => this.showMainMenu());
  }

  startGame() {
    // Efeito de transição
    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.time.delayedCall(500, () => {
      // Iniciar a cena do jogo
      this.scene.start("Game");
    });
  }

  testGameOver() {
    // Método temporário para testar o ecrã de Game Over
    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.time.delayedCall(500, () => {
      this.scene.start("GameOver", {
        level: 5, // Nível alcançado
        score: 1250, // Pontuação
        timeElapsed: 245, // Tempo em segundos (4:05)
        timeTravels: 12, // Número de viagens no tempo
      });
    });
  }

  clearScreen() {
    // Remove todos os objetos da cena exceto o fundo (background)
    // Criar uma cópia do array para evitar problemas ao destruir durante iteração
    const children = [...this.children.list];
    children.forEach((child) => {
      // Não destruir o fundo
      if (child !== this.background) {
        child.destroy();
      }
    });
  }

  update() {
    // Aqui você pode adicionar animações de fundo se desejar
  }
}
