export class Preloader extends Phaser.Scene {
  constructor() {
    super("Preloader");
  }

  preload() {
    // Criar barra de progresso
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Fundo
    this.add.rectangle(width / 2, height / 2, width, height, 0x0d0617);

    // Título
    const loadingText = this.add
      .text(width / 2, height / 2 - 100, "VIAGEM NO TEMPO", {
        fontSize: "48px",
        fontFamily: "Arial",
        color: "#00ffff",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Texto "Carregando..."
    const percentText = this.add
      .text(width / 2, height / 2 - 30, "0%", {
        fontSize: "32px",
        fontFamily: "Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Barra de progresso (fundo)
    const progressBar = this.add.rectangle(
      width / 2,
      height / 2 + 50,
      600,
      30,
      0x2a1f4a
    );
    progressBar.setStrokeStyle(3, 0x00ffff);

    // Barra de progresso (preenchimento)
    const progressFill = this.add.rectangle(
      width / 2 - 300,
      height / 2 + 50,
      0,
      30,
      0x00ffff
    );
    progressFill.setOrigin(0, 0.5);

    // Texto de asset sendo carregado
    const assetText = this.add
      .text(width / 2, height / 2 + 100, "", {
        fontSize: "18px",
        fontFamily: "Arial",
        color: "#888888",
      })
      .setOrigin(0.5);

    // Eventos de carregamento
    this.load.on("progress", (value) => {
      percentText.setText(Math.floor(value * 100) + "%");
      progressFill.width = 600 * value;
    });

    this.load.on("fileprogress", (file) => {
      assetText.setText("Carregando: " + file.key);
    });

    this.load.on("complete", () => {
      assetText.setText("Concluído!");
    });

    // Carregar imagem de fundo
    this.load.image("menuBackground", "assets/Imagem/MenuInicial.png");

    // Carregar sons
    this.load.audio("menuMusic", "assets/audio/Menu.mp3");
    this.load.audio("keyCollect", "assets/audio/Key.mp3");
    this.load.audio("timeTravel", "assets/audio/ViajarTempo.mp3");
    this.load.audio("damage", "assets/audio/dano.mp3");
    this.load.audio("levelComplete", "assets/audio/NivelConcluido.mp3");
    this.load.audio("gameOverMusic", "assets/audio/GameOverMenu.mp3");
  }

  create() {
    // Aguardar um momento antes de ir para o menu
    this.time.delayedCall(500, () => {
      this.scene.start("MainMenu");
    });
  }
}
