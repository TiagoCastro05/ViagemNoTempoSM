export class GameOver extends Phaser.Scene {
  constructor() {
    super("GameOver");
    this.musicaGameOver = null;
  }

  init(data) {
    // Recebe dados do jogo (nível alcançado, pontos, tempo, etc.)
    this.level = data.level || 1;
    this.score = data.score || 0;
    this.timeElapsed = data.timeElapsed || 0;
    this.timeTravels = data.timeTravels || 0;
    this.deathReason = data.deathReason || "Morreste!";
  }

  preload() {
    this.load.audio("gameOverMusic", "assets/audio/GameOverMenu.mp3");
  }

  create() {
    // Parar música do menu (mantém sons de efeito)
    const menuMusic = this.sound.get("menuMusic");
    if (menuMusic) {
      menuMusic.stop();
    }

    // Aguardar um momento antes de iniciar música de Game Over
    // (dá tempo para o som de dano terminar)
    this.time.delayedCall(300, () => {
      this.musicaGameOver = this.sound.add("gameOverMusic", {
        volume: 0.3,
        loop: true,
      });
      this.musicaGameOver.play();
    });

    // Fundo escuro com efeito de game over
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x0d0617, 0x0d0617, 0x1a0515, 0x1a0515, 1);
    graphics.fillRect(0, 0, 1920, 1080);

    // Partículas de fundo para efeito visual
    this.createBackgroundParticles();

    // Título GAME OVER
    const gameOverText = this.add
      .text(960, 100, "GAME OVER", {
        fontSize: "100px",
        fontFamily: "Arial",
        color: "#ff0000",
        stroke: "#000000",
        strokeThickness: 8,
        shadow: {
          offsetX: 4,
          offsetY: 4,
          color: "#000",
          blur: 8,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Animação de entrada do título
    this.tweens.add({
      targets: gameOverText,
      alpha: 1,
      scale: { from: 0.5, to: 1 },
      duration: 1000,
      ease: "Bounce.out",
    });

    // Razão da morte
    const deathReasonText = this.add
      .text(960, 220, this.deathReason, {
        fontSize: "36px",
        fontFamily: "Arial",
        color: "#ffaa00",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(100);

    this.tweens.add({
      targets: deathReasonText,
      alpha: 1,
      duration: 800,
      delay: 500,
      ease: "Power2",
    });

    // Efeito de pulsação
    this.tweens.add({
      targets: gameOverText,
      scale: { from: 1, to: 1.1 },
      duration: 1500,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: 1000,
    });

    // Painel de resultados
    this.createResultsPanel();

    // Botões
    this.createButtons();

    // Mensagem motivacional
    this.showMotivationalMessage();
  }

  createBackgroundParticles() {
    // Criar algumas partículas flutuantes no fundo
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, 1920);
      const y = Phaser.Math.Between(0, 1080);
      const size = Phaser.Math.Between(2, 6);

      const particle = this.add.circle(x, y, size, 0x00ffff, 0.3);

      this.tweens.add({
        targets: particle,
        y: y + Phaser.Math.Between(-100, 100),
        x: x + Phaser.Math.Between(-50, 50),
        alpha: { from: 0.1, to: 0.5 },
        duration: Phaser.Math.Between(3000, 6000),
        ease: "Sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }
  }

  createResultsPanel() {
    // Painel com fundo semi-transparente
    const panel = this.add.rectangle(960, 500, 800, 450, 0x1a0f2e, 0.9);
    panel.setStrokeStyle(4, 0x00ffff);

    // Título do painel
    this.add
      .text(960, 340, "RESULTADOS", {
        fontSize: "50px",
        fontFamily: "Arial",
        color: "#00ffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Formatação do tempo
    const minutes = Math.floor(this.timeElapsed / 60);
    const seconds = this.timeElapsed % 60;
    const timeFormatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    // Resultados
    const results = [
      { label: "NÍVEL ALCANÇADO:", value: this.level, color: "#ffff00" },
      { label: "Tempo decorrido:", value: timeFormatted, color: "#ffffff" },
      { label: "Viagens no tempo:", value: this.timeTravels, color: "#00ffff" },
    ];

    let yPos = 430;
    results.forEach((result) => {
      // Label
      this.add
        .text(600, yPos, result.label, {
          fontSize: result.label.includes("NÍVEL") ? "40px" : "32px",
          fontFamily: "Arial",
          color: "#aaaaaa",
          fontStyle: result.label.includes("NÍVEL") ? "bold" : "normal",
        })
        .setOrigin(0, 0.5);

      // Valor
      this.add
        .text(1320, yPos, result.value.toString(), {
          fontSize: result.label.includes("NÍVEL") ? "40px" : "32px",
          fontFamily: "Arial",
          color: result.color,
          fontStyle: "bold",
        })
        .setOrigin(1, 0.5);

      yPos += result.label.includes("NÍVEL") ? 75 : 60;
    });
  }

  createButtons() {
    const buttonY = 800;
    const buttonSpacing = 300;

    // Botão Jogar Novamente
    this.createMenuButton(660, buttonY, "JOGAR NOVAMENTE", () =>
      this.playAgain()
    );

    // Botão Menu Principal
    this.createMenuButton(1260, buttonY, "MENU PRINCIPAL", () =>
      this.goToMainMenu()
    );
  }

  createMenuButton(x, y, text, callback) {
    // Fundo do botão
    const button = this.add.rectangle(x, y, 440, 85, 0x2a1f4a);
    button.setStrokeStyle(3, 0x00ffff);
    button.setInteractive({ useHandCursor: true });

    // Texto do botão
    const buttonText = this.add
      .text(x, y, text, {
        fontSize: "32px",
        fontFamily: "Arial",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Efeitos hover
    button.on("pointerover", () => {
      button.setFillStyle(0x3d2f5f);
      button.setScale(1.05);
      buttonText.setScale(1.05);

      this.tweens.add({
        targets: [button, buttonText],
        scale: 1.05,
        duration: 100,
      });
    });

    button.on("pointerout", () => {
      button.setFillStyle(0x2a1f4a);
      button.setScale(1);
      buttonText.setScale(1);
    });

    button.on("pointerdown", () => {
      button.setFillStyle(0x1a0f2e);
      button.setScale(0.98);
      buttonText.setScale(0.98);
    });

    button.on("pointerup", () => {
      button.setFillStyle(0x3d2f5f);
      callback();
    });

    // Animação de entrada
    button.setAlpha(0);
    buttonText.setAlpha(0);

    this.tweens.add({
      targets: [button, buttonText],
      alpha: 1,
      duration: 500,
      delay: 1500,
      ease: "Power2",
    });

    return { button, buttonText };
  }

  showMotivationalMessage() {
    const messages = [
      "O tempo não espera por ninguém... Tente novamente!",
      "Cada falha é uma oportunidade de aprender!",
      "O passado pode revelar o caminho para o futuro!",
      "Continue viajando... A saída está mais perto!",
      "Nem todos os caminhos são visíveis no presente!",
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    const message = this.add
      .text(960, 950, randomMessage, {
        fontSize: "26px",
        fontFamily: "Arial",
        color: "#888888",
        fontStyle: "italic",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: message,
      alpha: 0.8,
      duration: 1000,
      delay: 2000,
      ease: "Power2",
    });
  }

  playAgain() {
    // Parar música de Game Over
    if (this.musicaGameOver) {
      this.musicaGameOver.stop();
    }

    // Reiniciar música do menu
    const menuMusic = this.sound.add("menuMusic", { volume: 0.3, loop: true });
    menuMusic.play();

    // Efeito de transição
    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.time.delayedCall(500, () => {
      // Reiniciar o jogo
      this.scene.start("Game");
    });
  }

  goToMainMenu() {
    // Parar música de Game Over
    if (this.musicaGameOver) {
      this.musicaGameOver.stop();
    }

    // Efeito de transição
    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.time.delayedCall(500, () => {
      this.scene.start("MainMenu");
    });
  }

  update() {
    // Animações contínuas se necessário
  }
}
