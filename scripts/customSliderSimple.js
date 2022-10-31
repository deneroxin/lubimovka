export class CustomSliderSimple {

  constructor(box, interactiveClass, hasButtons = true) {
    this.box = box;
    this.tape = box.querySelector('.custom-slider__tape');
    this.prevButton = this.box.querySelector('.custom-slider__button_action_prev');
    this.nextButton = this.box.querySelector('.custom-slider__button_action_next');
    this.interactiveClass = interactiveClass;
    this.buttonsVisible = Number(hasButtons) << 1;
    this.isButtonVisible = [false, null, false];
    this.f = null;
    this.fDecay = 0.6;
    this.fThreshold = 10;
    this.vDecay = 0.98;
    this.m = 0.2;
    this.pushX = null;
    this.vClick = 0;
    this.x = this.v = 0;
    this.mouse = false;
    this.active = false;
    this.defineEventListeners();
    this.handleResize();
    this.setupEventListeners();
  }

  defineEventListeners() {
    this.down = (evt => this.handlePointerDown(evt));
    this.move = (evt => this.handlePointerMove(evt));
    this.up = (() => this.handlePointerUp());
    this.cancel = (() => this.handlePointerCancel());
    this.click = (evt => this.handleClick(evt));
    this.focusin = (evt => this.handleFocusIn(evt));
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.handleResize());
    this.box.addEventListener('scroll', evt => evt.currentTarget.scrollLeft = 0);
    this.prevButton.addEventListener('click', () => {
      this.turnTransitionOn();
      this.scroll(this.step);
    });
    this.nextButton.addEventListener('click', () => {
      this.turnTransitionOn();
      this.scroll(-this.step);
    });
  }

  addBasicEventListeners() {
    this.box.addEventListener('pointerdown', this.down);
    this.box.addEventListener('click', this.click, true);
    this.tape.addEventListener('focusin', this.focusin);
  }

  removeBasicEventListeners() {
    this.box.removeEventListener('pointerdown', this.down);
    this.box.removeEventListener('click', this.click, true);
    this.tape.removeEventListener('focusin', this.focusin);
  }

  addEventListeners() {
    this.box.addEventListener('pointermove', this.move);
    this.box.addEventListener('pointerup', this.up);
    this.box.addEventListener('pointercancel', this.cancel);
  }

  removeEventListeners() {
    this.box.removeEventListener('pointermove', this.move);
    this.box.removeEventListener('pointerup', this.up);
    this.box.removeEventListener('pointercancel', this.cancel);
  }

  handleResize() {
    const child = this.tape.children[0];
    const gap = this.getWidth(this.tape, 'column-gap');
    const childWidth = this.getWidth(child);
    this.interactiveWidth = 0;
    if (this.interactiveClass) {
      const interactiveElement = child.querySelector(`.${this.interactiveClass}`);
      this.interactiveWidth = this.getWidth(interactiveElement);
    }
    this.step = gap + childWidth;
    this.tapeWidth = (gap + childWidth) * this.tape.children.length - gap;
    this.boxWidth = this.getWidth(this.box);
    const buttonWidth = this.getWidth(this.prevButton);
    this.active = Number(this.getWidth(this.box, '--custom-slider__active') == 1) << 1;
    this.active |= Number(this.tapeWidth > this.boxWidth);
    this.buttonsVisible &= 2;
    this.buttonsVisible |= Number(this.boxWidth > this.step + 2 * buttonWidth);
    if (this.active === 3) {
      if (this.buttonsVisible != 3) {
        this.hideButton(-1);
        this.hideButton(1);
      }
      this.pushed = false;
      this.addBasicEventListeners();
      this.scroll(0);
    } else {
      this.box.style.width = `${this.tapeWidth}px`;
      this.hideButton(-1);
      this.hideButton(1);
      this.removeBasicEventListeners();
    }
  }

  getWidth(element, name = 'width') {
    return Number(window.getComputedStyle(element)
      .getPropertyValue(name).replace('px',''));
  }

  getOffset(el, parent) {
    let offset = 0;
    while (el !== parent) {
      offset += el.offsetLeft;
      el = el.offsetParent;
    }
    return offset;
  }

  chooseButton(buttonKind) {
    return buttonKind > 0 ? this.nextButton : this.prevButton;
  }

  showButton(buttonKind) {
    if (this.active === 3 && this.buttonsVisible === 3 && !this.isButtonVisible[buttonKind + 1]) {
      this.chooseButton(buttonKind).classList.add('custom-slider__button_visible');
      this.isButtonVisible[buttonKind + 1] = true;
    }
  }

  hideButton(buttonKind) {
    if (this.isButtonVisible[buttonKind + 1]) {
      this.chooseButton(buttonKind).classList.remove('custom-slider__button_visible');
      this.isButtonVisible[buttonKind + 1] = false;
    }
  }

  turnTransitionOn() {
    this.tape.classList.add('custom-slider__tape_use-transition');
  }

  turnTransitionOff() {
    this.tape.classList.remove('custom-slider__tape_use-transition');
  }

  scroll(step) {
    this.x += step;
    if (this.x + this.tapeWidth > this.boxWidth) {
      this.showButton(1);
    } else {
      this.x = this.boxWidth - this.tapeWidth;
      this.v = 0;
      this.hideButton(1);
    }
    if (this.x < 0) {
      this.showButton(-1);
    } else {
      this.x = 0;
      this.v = 0;
      this.hideButton(-1);
    }
    this.tape.style.setProperty('--shift', `${this.x}px`);
  }

  processMoving() {
    if (this.pushed) {
      this.f *= this.fDecay;
      setTimeout(() => this.processMoving(), 50);
    } else {
      this.scroll(this.v);
      this.v *= this.vDecay;
      if (Math.abs(this.v) < 1) {
        this.v = 0;
      } else {
        setTimeout(() => this.processMoving(), 50);
      }
    }
  }

  handlePointerDown(evt) {
    if (!evt.target.classList.contains(this.interactiveClass)) evt.preventDefault(); else this.mouseFocus = true;
    this.pushX = evt.clientX;
    this.vClick = this.v;
    this.turnTransitionOff();
    this.v = this.f = 0;
    this.pushed = true;
    this.addEventListeners();
    setTimeout(() => this.processMoving(), 50);
  }

  handlePointerMove(evt) {
    if (this.pushed) {
      if (!(evt.buttons & 1)) {
        this.handlePointerCancel();
        return;
      }
      this.f += evt.movementX;
      this.scroll(evt.movementX);
    }
  }

  handlePointerUp() {
    if (this.pushed) {
      if (Math.abs(this.f) > this.fThreshold) this.v += this.m * this.f;
      this.handlePointerCancel();
    }
  }

  handlePointerCancel() {
    this.pushed = false;
    this.removeEventListeners();
  }

  handleClick(evt) {
    if (evt.eventPhase === 1 && (this.vClick || Math.abs(this.pushX - evt.clientX) > 5)) {
      evt.stopPropagation();
    }
  }

  handleFocusIn(evt) {
    if (this.mouseFocus) {
      this.mouseFocus = false;
    } else {
      const offset = this.getOffset(evt.target, this.tape) + this.interactiveWidth / 2;
      this.turnTransitionOn();
      this.scroll(this.boxWidth / 2 - (offset + this.x));
    }
  }
}
