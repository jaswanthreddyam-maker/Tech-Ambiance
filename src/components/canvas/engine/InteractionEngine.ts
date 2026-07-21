import { EventBus } from './EventBus';
import type { InteractionState } from './types';

export class InteractionEngine {
  private eventBus: EventBus;
  private state: InteractionState = {
    mouseX: 0,
    mouseY: 0,
    pointerActive: false,
    normalizedX: 0,
    normalizedY: 0,
    scrollOffset: 0,
    scrollVelocity: 0,
  };

  private boundOnMouseMove: (e: MouseEvent) => void;
  private boundOnTouchMove: (e: TouchEvent) => void;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.boundOnMouseMove = this.onMouseMove.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
  }

  public boot(_container?: HTMLElement): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('mousemove', this.boundOnMouseMove, { passive: true });
    window.addEventListener('touchmove', this.boundOnTouchMove, { passive: true });
  }

  public updateScroll(offset: number, velocity: number): void {
    this.state.scrollOffset = offset;
    this.state.scrollVelocity = velocity;
    this.eventBus.emit('interaction.scroll', { offset, velocity });
  }

  public getState(): InteractionState {
    return { ...this.state };
  }

  private onMouseMove(e: MouseEvent): void {
    const width = window.innerWidth || 1;
    const height = window.innerHeight || 1;

    this.state.mouseX = e.clientX;
    this.state.mouseY = e.clientY;
    this.state.pointerActive = true;
    this.state.normalizedX = (e.clientX / width) * 2 - 1;
    this.state.normalizedY = -(e.clientY / height) * 2 + 1;

    this.eventBus.emit('interaction.pointer', {
      x: this.state.mouseX,
      y: this.state.mouseY,
      normalizedX: this.state.normalizedX,
      normalizedY: this.state.normalizedY,
    });
  }

  private onTouchMove(e: TouchEvent): void {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    const width = window.innerWidth || 1;
    const height = window.innerHeight || 1;

    this.state.mouseX = touch.clientX;
    this.state.mouseY = touch.clientY;
    this.state.pointerActive = true;
    this.state.normalizedX = (touch.clientX / width) * 2 - 1;
    this.state.normalizedY = -(touch.clientY / height) * 2 + 1;

    this.eventBus.emit('interaction.pointer', {
      x: this.state.mouseX,
      y: this.state.mouseY,
      normalizedX: this.state.normalizedX,
      normalizedY: this.state.normalizedY,
    });
  }

  public destroy(): void {
    if (typeof window === 'undefined') return;
    window.removeEventListener('mousemove', this.boundOnMouseMove);
    window.removeEventListener('touchmove', this.boundOnTouchMove);
  }
}
