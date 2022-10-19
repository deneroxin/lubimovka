class CustomSlider {

  constructor(box, childClass, hasButtons = true) {
    box.dat = this;
    this.box = box;
    this.tape = box.querySelector('.custom-slider__tape');
    this.hasButtons = hasButtons;
    this.isButtonVisible = [false, false];
    const child = this.tape.querySelector(childClass);
    const gap = Number(window.getComputedStyle(this.tape).getPropertyValue('gap').replace('px',''));
    const childWidth = Number(window.getComputedStyle(child).getPropertyValue('width').replace('px',''));
    this.step = gap + childWidth;
    this.width = (gap + childWidth) * this.tape.children.length - gap;
    this.prevButton = this.box.querySelector('.custom-slider__button_action_prev');
    this.nextButton = this.box.querySelector('.custom-slider__button_action_next');
    this.prevButton.addEventListener('click', () => {
      this.turnTransitionOn();
      this.scroll(this.step);
    });
    this.nextButton.addEventListener('click', () => {
      this.turnTransitionOn();
      this.scroll(-this.step);
    });
    this.f = null;
    this.fDecay = 0.6;
    this.fThreshold = 10;
    this.vDecay = 0.98;
    this.m = 0.2;
    this.pushX = null;
    this.vClick = 0;
    this.down = (evt => this.handlePointerDown(evt));
    this.move = (evt => this.handlePointerMove(evt));
    this.up = (() => this.handlePointerUp());
    this.cancel = (() => this.handlePointerCancel());
    this.click = (evt => this.handleClick(evt));
    window.addEventListener('resize', () => this.handleResize());
    this.active = false;
    this.handleResize();
    return this;
  }

  handleResize() {
    const lastActive = this.active;
    this.active = (window.getComputedStyle(this.box).getPropertyValue('--custom-slider__active') == 1);
    this.boxWidth = Number(window.getComputedStyle(this.box).getPropertyValue('width').replace('px',''));
    if (this.active && !lastActive) {
      this.x = this.v = 0;
      this.pushed = false;
      this.box.addEventListener('pointerdown', this.down);
      this.box.addEventListener('click', this.click, true);
        console.log(this.isButtonVisible);
      this.scroll(0);
      return;
    }
    if (!this.active && lastActive) {
      this.hideButton(-1);
      this.hideButton(1);
      this.box.removeEventListener('pointerdown', this.down);
      this.box.removeEventListener('click', this.click, true);
    }
  }

  chooseButton(buttonKind) {
    return buttonKind > 0 ? this.nextButton : this.prevButton;
  }

  showButton(buttonKind) {
    const buttonIdx = (buttonKind >> 1) & 1;
    if (this.hasButtons && !this.isButtonVisible[buttonIdx] ) {
      this.chooseButton(buttonKind).classList.add('custom-slider__button_visible');
      this.isButtonVisible[buttonIdx] = true;
    }
  }

  hideButton(buttonKind) {
    const buttonIdx = (buttonKind >> 1) & 1;
    if (this.isButtonVisible[buttonIdx]) {
      this.chooseButton(buttonKind).classList.remove('custom-slider__button_visible');
      this.isButtonVisible[buttonIdx] = false;
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
    if (this.width + this.x > this.boxWidth) {
      this.showButton(1);
    } else {
      this.x = this.boxWidth - this.width;
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

  handlePointerDown(evt) {
    evt.preventDefault();
    this.pushX = evt.clientX;
    this.vClick = this.v;
    this.turnTransitionOff();
    this.v = this.f = 0;
    this.pushed = true;
    this.addEventListeners();
    setTimeout(() => this.processMoving(), 50);
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

  handlePointerMove(evt) {
    evt.preventDefault();
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

}
