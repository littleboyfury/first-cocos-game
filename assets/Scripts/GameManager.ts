import { _decorator, CCInteger, Component, instantiate, Label, log, Node, Prefab, Vec3 } from 'cc'
import { BLOCK_SIZE, PlayerController } from './PlayerController'

const { ccclass, property } = _decorator

enum BlockType {
  BT_NONE,
  BT_STONE,
}

enum GameState {
  GS_INIT,
  GS_PLAYING,
  GS_END,
}

@ccclass('GameManager')
export class GameManager extends Component {
  @property({ type: Prefab })
  public boxPrefab: Prefab | null = null

  @property({ type: CCInteger })
  public roadLength: number = 50

  // 开始 UI
  @property({ type: Node })
  public startMenu: Node | null = null

  // 角色控制器
  @property({ type: PlayerController })
  public playerController: PlayerController | null = null

  // 计步器
  @property({ type: Label })
  public stepsLabel: Label | null = null

  @property({ type: Label })
  public aliveLabel: Label | null = null

  private _road: BlockType[] = []


  start() {
    this.setCurState(GameState.GS_INIT)
    this.playerController?.node.on('JumpEnd', this.onPlayerJumpEnd, this)
  }

  update(deltaTime: number) {
  }

  generateRoad() {
    this.node.removeAllChildren()
    this._road = []
    this._road.push(BlockType.BT_STONE)
    for (let i = 1; i < this.roadLength; i++) {
      if (this._road[i - 1] === BlockType.BT_NONE) {
        this._road.push(BlockType.BT_STONE)
      } else {
        this._road.push(Math.floor(Math.random() * 2))
      }
    }
    this._road.push(BlockType.BT_STONE)
    for (let j = 0; j < this._road.length; j++) {
      let block: Node | null = this.spawnBlockByType(this._road[j])
      if (block) {
        this.node.addChild(block)
        block.setPosition(j * BLOCK_SIZE, 0, 0)
      }
    }
  }

  spawnBlockByType(type: BlockType) {
    if (!this.boxPrefab) {
      return null
    }
    let block: Node | null = null
    switch (type) {
      case BlockType.BT_STONE:
        block = instantiate(this.boxPrefab)
        break
    }
    return block
  }

  setCurState(value: GameState, isDead = false) {
    switch (value) {
      case GameState.GS_INIT:
        this.init()
        break
      case GameState.GS_PLAYING:
        this.playing()
        break
      case GameState.GS_END:
        this.end(isDead)
        break
    }
  }

  init() {
    if (this.startMenu) {
      this.startMenu.active = true
    }

    this.generateRoad()

    if (this.playerController) {
      this.playerController.setInputActive(false)
      this.playerController.node.setPosition(Vec3.ZERO)
      this.playerController.reset()
    }
  }

  playing() {
    if (this.startMenu) {
      this.startMenu.active = false
    }

    if (this.stepsLabel) {
      this.stepsLabel.string = '0'
    }

    if (this.aliveLabel) {
      this.aliveLabel.string = ''
    }

    setTimeout(() => {
      if (this.playerController) {
        this.playerController.setInputActive(true)
      }
    }, 0.1)
  }

  end(isDead: boolean) {
    if (isDead) {
      this.aliveLabel.string = 'DEAD!!!'
    } else {
      this.aliveLabel.string = 'SUCCESS!!!'
    }
    this.setCurState(GameState.GS_INIT)
  }

  onStartButtonClicked() {
    this.setCurState(GameState.GS_PLAYING)
  }

  onPlayerJumpEnd(moveIndex: number) {
    if (this.stepsLabel) {
      this.stepsLabel.string = '' + (moveIndex >= this.roadLength ? this.roadLength : moveIndex)
    }
    this.checkResult(moveIndex)
  }

  checkResult(moveIndex: number) {
    if (moveIndex < this.roadLength) {
      if (this._road[moveIndex] === BlockType.BT_NONE) {
        this.setCurState(GameState.GS_END, true)
      }
    } else {
      this.setCurState(GameState.GS_END)
    }
  }

}
