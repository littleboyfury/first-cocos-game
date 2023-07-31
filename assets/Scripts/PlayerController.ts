import { _decorator, Component, EventMouse, Input, input, Node, Vec3, Animation, log } from 'cc';
const { ccclass, property } = _decorator;
export const BLOCK_SIZE = 40

@ccclass('PlayerController')
export class PlayerController extends Component {
  @property(Animation)
  BodyAnim: Animation = null
  // 是否开始跳跃
  private _startJump: boolean = false
  // 跳跃步数
  private _jumpStep: number = 0
  // 当前的跳跃时间
  private _curJumpTime: number = 0
  // 跳跃时间
  private _jumpTime: number = 0.1
  // 移动速度
  private _curJumpSpeed: number = 0
  // 当前的位置
  private _curPos: Vec3 = new Vec3()
  // 位移
  private _deltaPos: Vec3 = new Vec3(0, 0, 0)
  // 目标位置
  private _targetPos: Vec3 = new Vec3()

  private _curMoveIndex: number = 0

  start() {
    // input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this)
  }

  update(deltaTime: number) {
    if (this._startJump) {
      this._curJumpTime += deltaTime
      if (this._curJumpTime > this._jumpTime) {
        this.node.setPosition(this._targetPos)
        this._startJump = false
        this.onOnceJumpEnd()
      } else {
        this.node.getPosition(this._curPos)
        this._deltaPos.x = this._curJumpSpeed * deltaTime
        Vec3.add(this._curPos, this._curPos, this._deltaPos)
        this.node.setPosition(this._curPos)
      }
    }
  }

  onMouseUp(event: EventMouse) {
    if (event.getButton() === 0) {
      this.jumpByStep(1)
    } else if (event.getButton() === 2) {
      this.jumpByStep(2)
    }
  }

  jumpByStep(step: number) {
    if (this._startJump) {
      return
    }

    this._startJump = true
    this._jumpStep = step
    this._curJumpTime = 0

    if (this.BodyAnim) {
      const clipName = step === 1 ? 'oneStep' : 'twoStep'
      const state = this.BodyAnim.getState(clipName)
      this._jumpTime = state.duration

    }
    this._curJumpSpeed = this._jumpStep * BLOCK_SIZE / this._jumpTime
    this.node.getPosition(this._curPos)
    Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep * BLOCK_SIZE, 0, 0))
    if (this.BodyAnim) {
      if (step === 1) {
        this.BodyAnim.play('oneStep')
      } else if (step === 2) {
        this.BodyAnim.play('twoStep')
      }
    }
    this._curMoveIndex += step
  }

  setInputActive(active: boolean) {
    if (active) {
      input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this)
    } else {
      input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this)
    }
  }

  reset() {
    this._curMoveIndex = 0
  }

  onOnceJumpEnd() {
    this.node.emit('JumpEnd', this._curMoveIndex)
  }
}


