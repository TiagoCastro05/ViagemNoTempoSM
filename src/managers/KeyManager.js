import { Key } from "../entities/Key.js";

/**
 * Classe KeyManager - Gerencia o spawn e controle das chaves
 * Responsável por: posicionamento aleatório, spawn único entre passado/futuro
 */
export class KeyManager {
  constructor(scene, map) {
    this.scene = scene;
    this.map = map;

    // Grupo de física para as chaves
    this.keysGroup = scene.physics.add.group();

    // Armazenar época e posição da chave (definido no início do jogo)
    this.keyTime = null; // 'passado' ou 'futuro'
    this.keyPosition = null; // {x, y}
    this.keyFrame = 179; // Frame do spritesheet
  }

  /**
   * Spawnar chave baseado no tempo atual
   * Se é a primeira vez, escolhe aleatoriamente entre passado/futuro
   */
  spawnKeys(currentTime) {
    // Limpar chaves existentes
    this.keysGroup.clear(true, true);

    // Se a chave já foi definida, usar os valores salvos
    let keyTimeToUse = this.keyTime;
    let keyPosToUse = this.keyPosition;

    // Se é a primeira vez (início do jogo), escolher aleatoriamente
    if (!keyTimeToUse || !keyPosToUse) {
      this.chooseRandomKeyLocation();
      keyTimeToUse = this.keyTime;
      keyPosToUse = this.keyPosition;
    }

    // Só criar a chave se estivermos no tempo correto
    if (currentTime !== keyTimeToUse) {
      console.log(
        `Chave está no ${keyTimeToUse}, mas estamos no ${currentTime}`
      );
      return;
    }

    // Criar a chave na posição definida
    const key = new Key(
      this.scene,
      keyPosToUse.x,
      keyPosToUse.y,
      this.keyFrame
    );
    this.keysGroup.add(key);

    console.log(
      `Chave criada no ${currentTime} em (${keyPosToUse.x}, ${keyPosToUse.y})`
    );
  }

  /**
   * Escolher aleatoriamente a localização da chave
   */
  chooseRandomKeyLocation() {
    // Escolher aleatoriamente entre passado e futuro
    const randomTime = Phaser.Math.Between(0, 1) === 0 ? "passado" : "futuro";
    this.keyTime = randomTime;

    // Obter spawn points do tempo escolhido
    const objectLayerName =
      randomTime === "passado" ? "chaves passado" : "chaves futuro";
    const objectLayer = this.map.getObjectLayer(objectLayerName);

    if (!objectLayer) {
      console.warn(`Object layer "${objectLayerName}" não encontrado no mapa`);
      return;
    }

    // Coletar todos os spawn points válidos
    const validSpawnPoints = [];
    objectLayer.objects.forEach((obj) => {
      if (obj.type === "item" || obj.name.includes("spawn_key")) {
        validSpawnPoints.push(obj);
      }
    });

    if (validSpawnPoints.length === 0) {
      console.warn("Nenhum spawn point encontrado");
      return;
    }

    // Selecionar aleatoriamente 1 spawn point
    const randomIndex = Phaser.Math.Between(0, validSpawnPoints.length - 1);
    const selectedSpawn = validSpawnPoints[randomIndex];
    this.keyPosition = { x: selectedSpawn.x, y: selectedSpawn.y };

    console.log(
      `Chave aparecerá no ${randomTime} na posição (${this.keyPosition.x}, ${this.keyPosition.y})`
    );
  }

  /**
   * Resetar o manager para um novo jogo
   */
  reset() {
    this.keyTime = null;
    this.keyPosition = null;
    this.keysGroup.clear(true, true);
  }

  /**
   * Obter o grupo de chaves para configurar colisões
   */
  getGroup() {
    return this.keysGroup;
  }
}
