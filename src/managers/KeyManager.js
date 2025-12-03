import { Key } from "../entities/Key.js";

/**
 * Classe KeyManager - Gerencia o spawn e controle das chaves colecionáveis
 * Responsável por: posicionamento aleatório controlado, spawn único entre passado/futuro
 * Implementa aleatoriedade controlada: chave aparece em apenas 1 época aleatória
 */
export class KeyManager {
  constructor(scene, map) {
    this.scene = scene;
    this.map = map;

    // Grupo de física para as chaves (facilita colisões)
    this.keysGroup = scene.physics.add.group();

    // Armazenar época e posição da chave (definido aleatoriamente no início)
    this.keyTime = null; // 'passado' ou 'futuro' (escolhido aleatoriamente)
    this.keyPosition = null; // {x, y} (posição específica)
    this.keyFrame = 179; // Frame do spritesheet da chave
  }

  /**
   * Spawnar chave baseado no tempo atual
   * Chave só aparece no tempo correto (passado OU futuro)
   * Se é a primeira vez, escolhe aleatoriamente a época e posição
   * @param {string} currentTime - Tempo atual ('passado' ou 'futuro')
   */
  spawnKeys(currentTime) {
    // Limpar chaves existentes antes de spawnar novas
    this.keysGroup.clear(true, true);

    // Se a chave ainda não foi definida, escolher aleatoriamente
    if (!this.keyTime || !this.keyPosition) {
      this.chooseRandomKeyLocation();
    }

    // Só criar a chave se estivermos no tempo correto
    // (implementa o puzzle: jogador precisa viajar no tempo para encontrar a chave)
    if (currentTime !== this.keyTime) {
      console.log(
        `Chave está no ${this.keyTime}, mas estamos no ${currentTime}`
      );
      return;
    }

    // Criar a chave na posição definida
    const key = new Key(
      this.scene,
      this.keyPosition.x,
      this.keyPosition.y,
      this.keyFrame
    );
    this.keysGroup.add(key);

    console.log(
      `Chave criada no ${currentTime} em (${this.keyPosition.x}, ${this.keyPosition.y})`
    );
  }

  /**
   * Escolher aleatoriamente a localização da chave
   * ALEATORIEDADE CONTROLADA:
   * - Escolhe 1 época aleatória (passado ou futuro)
   * - Escolhe 1 posição aleatória entre os spawn points válidos
   * - Garante que sempre há uma solução possível
   */
  chooseRandomKeyLocation() {
    // Escolher aleatoriamente entre passado e futuro (50% cada)
    this.keyTime = Phaser.Math.Between(0, 1) === 0 ? "passado" : "futuro";

    // Obter layer de spawn points do tempo escolhido
    const objectLayerName =
      this.keyTime === "passado" ? "chaves passado" : "chaves futuro";
    const objectLayer = this.map.getObjectLayer(objectLayerName);

    if (!objectLayer) {
      console.warn(`Object layer "${objectLayerName}" não encontrado no mapa`);
      return;
    }

    // Coletar todos os spawn points válidos da época escolhida
    const validSpawnPoints = objectLayer.objects.filter(
      (obj) => obj.type === "item" || obj.name.includes("spawn_key")
    );

    if (validSpawnPoints.length === 0) {
      console.warn("Nenhum spawn point encontrado");
      return;
    }

    // Selecionar aleatoriamente 1 spawn point
    const randomIndex = Phaser.Math.Between(0, validSpawnPoints.length - 1);
    const selectedSpawn = validSpawnPoints[randomIndex];
    this.keyPosition = { x: selectedSpawn.x, y: selectedSpawn.y };

    console.log(
      `Chave aparecerá no ${this.keyTime} na posição (${this.keyPosition.x}, ${this.keyPosition.y})`
    );
  }

  /**
   * Resetar o manager para um novo jogo
   * Limpa época e posição, permitindo nova aleatoriedade
   */
  reset() {
    this.keyTime = null;
    this.keyPosition = null;
    this.keysGroup.clear(true, true);
  }

  /**
   * Obter o grupo de chaves para configurar colisões
   * @returns {Phaser.Physics.Arcade.Group} Grupo de física das chaves
   */
  getGroup() {
    return this.keysGroup;
  }
}
