export class CustomSlider {

  getOffset(el, parent) {
    let offset = 0;
    while (el !== parent) {
      offset += el.offsetLeft;
      el = el.offsetParent;
    }
    return offset;
  }

  handleFocusIn(evt) {
    if (this.mouseFocus) {
      this.mouseFocus = false;
    } else {
      const offset = this.getOffset(evt.target, this.tape) + this.interactiveWidth / 2;
      this.jump(this.boxWidth / 2 - offset);
    }
  }

  jump(position) {
    this.bigStep = true;
    this.x1 = position;
    this.processMoving();
  }

  // options:
  //   dataSource
  //   createChild
  //   fillChild
  //   interactiveClass
  //   cyclic
  //   numChildrenPresent

  constructor(box, options, hasButtons = true) {
    box.dat = this;
    box.addEventListener('scroll', evt => evt.currentTarget.scrollLeft = 0);
    this.box = box;
    this.options = options;
    this.scroll = (options.cyclic ? this.scrollCyclic : this.scrollFinite);
    this.tape = box.querySelector('.custom-slider__tape');
    this.buttonsVisible = Number(hasButtons) << 1;
    this.isButtonVisible = [false, null, false];
    this.n = (options.cyclic ? options.numChildrenPresent
      : Math.min(options.numChildrenPresent, options.dataSource.length));
    for (let i = 0; i < this.n; i++)
      this.tape.append(options.createChild(this.options.dataSource[(i % options.dataSource.length)]));
    this.start = 0;
    this.prevButton = box.querySelector('.custom-slider__button_action_prev');
    this.nextButton = box.querySelector('.custom-slider__button_action_next');
    this.buttonTarget = false;
    this.f = null;
    this.fDecay = 0.6;
    this.fThreshold = 10;
    this.vDecay = 0.98;
    this.m = 0.2;
    this.m1 = 0.2;
    this.pushX = null;
    this.x1 = this.x = this.v = 0;
    this.vClick = 0;
    this.down = (evt => this.handlePointerDown(evt));
    this.move = (evt => this.handlePointerMove(evt));
    this.up = (() => this.handlePointerUp());
    this.cancel = (() => this.handlePointerCancel());
    this.click = (evt => this.handleClick(evt));
    this.focusin = (evt => this.handleFocusIn(evt));
    this.mouse = false;
    this.bigStep = false;
    window.addEventListener('resize', () => this.handleResize());
    this.handleResize();
    this.prevButton.addEventListener('click', () => this.jump(this.x1 + this.step));
    this.nextButton.addEventListener('click', () => this.jump(this.x1 - this.step));
  }

  handleResize() {
    const child = this.tape.children[0];
    const gap = Number(window.getComputedStyle(this.tape)
      .getPropertyValue('column-gap').replace('px',''));
    const childWidth = Number(window.getComputedStyle(child)
      .getPropertyValue('width').replace('px',''));
    if (this.options.interactiveClass) {
      this.interactiveWidth = Number(window.getComputedStyle(child.querySelector(`.${this.options.interactiveClass}`))
        .getPropertyValue('width').replace('px',''));
    } else this.interactiveWidth = 0;
    this.step = gap + childWidth;
    this.tapeWidth = this.step * this.n - gap;
    this.tapeFullWidth = this.step * this.options.dataSource.length - gap;
    this.histeresis = 2 * this.step;
    this.boxWidth = Number(window.getComputedStyle(this.box)
      .getPropertyValue('width').replace('px',''));
    const buttonWidth = Number(window.getComputedStyle(this.prevButton)
      .getPropertyValue('width').replace('px',''));
    this.active = Number(window.getComputedStyle(this.box)
      .getPropertyValue('--custom-slider__active') == 1) << 1;
    this.active |= Number(this.tapeFullWidth > this.boxWidth);
    this.buttonsVisible &= 2;
    this.buttonsVisible |= Number(this.boxWidth > this.step + 2 * buttonWidth);
    this.leftEdge = (this.boxWidth - this.histeresis - this.tapeWidth) / 2;   // < le - addRight
    this.rightEdge = (this.boxWidth + this.histeresis - this.tapeWidth) / 2;  // > re - addLeft
    if (this.active === 3) {
      if (this.buttonsVisible != 3) {
        this.hideButton(-1);
        this.hideButton(1);
      }
      this.pushed = false;
      this.box.addEventListener('pointerdown', this.down);
      this.box.addEventListener('click', this.click, true);
      this.tape.addEventListener('focusin', this.focusin);
      if (this.options.cyclic) {
        this.showButton(-1);
        this.showButton(1);
      }
      this.scroll(0);
    } else {
      this.box.style.width = `${this.tapeWidth}px`;
      this.hideButton(-1);
      this.hideButton(1);
      this.box.removeEventListener('pointerdown', this.down);
      this.box.removeEventListener('click', this.click, true);
      this.tape.removeEventListener('focusin', this.focusin);
    }
  }

  moveTape(position) {
    this.tape.style.setProperty('--shift', `${position}px`);
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

  addRightElement() {
    const end = (this.start + this.n) % this.options.dataSource.length;
    this.options.fillChild(this.tape.children[0], this.options.dataSource[end]);
    if (++this.start >= this.options.dataSource.length) this.start -= this.options.dataSource.length;
    this.tape.append(this.tape.children[0]);
    this.x += this.step;
    this.x1 += this.step;
    // console.log('--<');
  }

  addLeftElement() {
    if (--this.start < 0) this.start += this.options.dataSource.length;
    this.tape.prepend(this.tape.children[this.n-1]);
    this.x -= this.step;
    this.x1 -= this.step;
    this.options.fillChild(this.tape.children[0], this.options.dataSource[this.start]);
    // console.log('>--');
  }

  shuffleElements() {
    while (this.x < this.leftEdge
      && this.start + this.n < this.options.dataSource.length)
        this.addRightElement();
    while (this.x > this.rightEdge
      && this.start > 0)
        this.addLeftElement();
  }

  shuffleElementsCyclic() {
    while (this.x < this.leftEdge) this.addRightElement();
    while (this.x > this.rightEdge) this.addLeftElement();
  }

  scrollFinite(step) {
    this.x += step;
    this.shuffleElements();
    if (this.x + this.tapeWidth <= this.boxWidth && this.start + this.n == this.options.dataSource.length) {
      this.x = this.boxWidth - this.tapeWidth;
      this.v = 0;
      this.bigStep = false;
      this.hideButton(1);
    } else {
      this.showButton(1);
    }
    if (this.x >= 0 && this.start == 0) {
      this.x = 0;
      this.v = 0;
      this.bigStep = false;
      this.hideButton(-1);
    } else {
      this.showButton(-1);
    }
    this.moveTape(this.x);
  }

  scrollCyclic(step) {
    this.x += step;
    this.shuffleElementsCyclic();
    this.moveTape(this.x);
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
    if (evt.target.classList.contains(this.options.interactiveClass)) {
      this.mouseFocus = true;
    } else {
      evt.preventDefault();
    }
    this.buttonTarget = (evt.target === this.prevButton || evt.target === this.nextButton);
    this.bigStep = false;
    this.pushX = evt.clientX;
    this.vClick = this.v;
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
      if (this.bigStep) {
        if (Math.abs(this.x1 - this.x) < 1) {
          this.x = this.x1;
          this.v = 0;
        } else {
          this.v = this.m1 * (this.x1 - this.x);
          if (Math.abs(this.v) < 1) this.v = Math.sign(this.x1 - this.x);
        }
        this.scroll(this.v);
      } else {
        this.scroll(this.v);
        this.x1 = this.x;
        this.v *= this.vDecay;
      }
      if (Math.abs(this.v) < 1) {
        this.v = 0;
      } else {
        setTimeout(() => this.processMoving(), 50);
      }
    }
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
    if (evt.eventPhase === 1
      && !this.buttonTarget
        && (this.vClick || Math.abs(this.pushX - evt.clientX) > 5))
          evt.stopPropagation();
  }

}
