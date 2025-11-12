import { MainMenu } from "./scenes/MainMenu.js";
import { GameOver } from "./scenes/GameOver.js";

const config = {
  type: Phaser.AUTO,
  title: "Viagem No Tempo",
  description: "Escape do Edifício Temporal",
  parent: "game-container",
  width: 1280,
  height: 720,
  backgroundColor: "#000000",
  pixelArt: false,
  scene: [MainMenu, GameOver],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
