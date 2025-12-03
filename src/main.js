import { Preloader } from "./scenes/Preloader.js";
import { MainMenu } from "./scenes/MainMenu.js";
import { Settings } from "./scenes/Settings.js";
import { Game } from "./scenes/Game.js";
import { GameOver } from "./scenes/GameOver.js";

const config = {
  type: Phaser.AUTO,
  title: "Viagem No Tempo",
  description: "Escape do Edifício Temporal",
  parent: "game-container",
  width: 1920,
  height: 1080,
  backgroundColor: "#000000",
  pixelArt: true,
  scene: [Preloader, MainMenu, Settings, Game, GameOver],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  audio: {
    disableWebAudio: false,
    noAudio: false,
  },
};

new Phaser.Game(config);
