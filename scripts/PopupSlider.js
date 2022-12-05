export class PopupSlider {
  constructor(sliderElement, dataSource, setKeyboardOwner) {
    this.slider = sliderElement;
    this.box = sliderElement.querySelector('.popup-slider__box');
    this.dataSource = dataSource;
    this.setKeyboardOwner = setKeyboardOwner;
    this.isOpened = false;
    this.hint = this.slider.querySelector('.popup-slider__hint');
    const title = this.hint.querySelectorAll('.popup-slider__title');
    this.title = title[0];
    this.position = title[1];
    this.cache = [];
    this.bigDistSqr = 200**2;
    this.smallDistSqr = 10**2;
    this.bigVelocitySqr = (20/200)**2;
    this.fDecay = 0.6;
    this.fThresholdSqr = 2**2;
    this.vDecay = 0.997;
    this.m = 0.05;
    this.step = 100;
    this.handleResize();
    this.addEventListeners();
  }

  getPhotoSize() {
    this.photoWidth = this.getWidth(this.cache[this.i]);
    this.photoHeight = this.getWidth(this.cache[this.i], 'height');
  }

  handleResize() {
    this.boxWidth = this.getWidth(this.box);
    this.boxHeight = this.getWidth(this.box, 'height');
    if (this.i !== undefined) this.getPhotoSize();
  }

  getWidth(element, name = 'width') {
    return Number(window.getComputedStyle(element)
      .getPropertyValue(name).replace('px',''));
  }

  setShift(x, y) {
    this.slider.style.setProperty('--shift-x', `${x/2}px`);
    this.slider.style.setProperty('--shift-y', `${y/2}px`);
    this.slider.style.setProperty('--scale-x', `${(Math.abs(x)+this.boxWidth)/this.boxWidth}`);
    this.slider.style.setProperty('--scale-y', `${(Math.abs(y)+this.boxHeight)/this.boxHeight}`);
  }

  setPan() {
    this.slider.style.setProperty('--pan-x', `${this.x}px`);
    this.slider.style.setProperty('--pan-y', `${this.y}px`);
  }

  addEventListeners() {
    this.slider.addEventListener('pointerdown', evt => this.handlePointerDown(evt));
    this.slider.addEventListener('pointermove', evt => this.handlePointerMove(evt));
    this.slider.addEventListener('pointerup', evt => this.handlePointerUp(evt));
    this.slider.addEventListener('pointercancel', evt => this.handlePointerCancel(evt));
    this.slider.addEventListener('dblclick', evt => this.handleDblClick(evt));
    window.addEventListener('resize', () => this.handleResize());
  }

  loadImage(index) {
    if (!this.cache[index]) {
      const img = document.createElement('img');
      img.src = `./images/gallery/${this.dataSource[index].image}.jpg`;
      img.alt = this.dataSource[index].alt;
      img.classList.add('popup-slider__image');
      this.cache[index] = img;
    }
  }

  freezeBody() {
    document.querySelector('body').classList.add('popup-slider-body-frozen');
  }

  unfreezeBody() {
    document.querySelector('body').classList.remove('popup-slider-body-frozen');
  }

  changeImage() {
    if (this.box.children[1]) this.box.children[1].remove();
    this.setShift(0, 0);
    this.box.prepend(this.cache[this.i]);
    this.title.textContent = this.cache[this.i].alt;
    this.position.textContent = `${this.i+1} / ${this.dataSource.length}`;
  }

  open(data) {
    this.slider.style.setProperty('--trans-dur-back', '.5s');
    this.pushed = false;
    this.box.innerHTML = '';
    this.zoomMode = false;
    const w = this.dataSource.length;
    this.i = this.dataSource.indexOf(data);
    this.il = (this.i + w - 1) % w;
    this.ir = (this.i + 1) % w;
    this.loadImage(this.il);
    this.loadImage(this.i);
    this.loadImage(this.ir);
    this.changeImage();
    this.freezeBody();
    this.slider.classList.add('popup-slider_opened');
    this.oldKeyboardOwner = this.setKeyboardOwner(this);
    this.isOpened = true;
    this.justOpened = true;
  }

  close() {
    this.unfreezeBody();
    this.setKeyboardOwner(this.oldKeyboardOwner);
    this.slider.classList.remove('popup-slider_opened');
    this.isOpened = false;
  }

  next() {
    const w = this.dataSource.length;
    this.il = this.i;
    this.i = this.ir;
    if (++this.ir >= w) this.ir -= w;
    this.loadImage(this.ir);
    this.changeImage();
  }

  prev() {
    const w = this.dataSource.length;
    this.ir = this.i;
    this.i = this.il;
    if (--this.il < 0) this.il += w;
    this.loadImage(this.il);
    this.changeImage();
  }

  enterZoomMode() {
    this.zoomMode = true;
    this.slider.classList.add('popup-slider_zoom-mode');
    this.handleResize();
    this.x = (this.boxWidth - this.photoWidth) / 2;
    this.y = (this.boxHeight - this.photoHeight) / 2;
    this.vx = this.vy = 0;
    this.setPan();
  }

  exitZoomMode() {
    this.zoomMode = false;
    this.slider.classList.remove('popup-slider_zoom-mode');
  }

  move(fx, fy) {
    const timerStopped = (this.vx == 0 && this.vy == 0);
    this.vx += this.m * fx;
    this.vy += this.m * fy;
    if (timerStopped) this.startAnimation();
  }

  scroll(stepX, stepY) {
    this.x += stepX;
    this.y += stepY;
    if (this.x + this.photoWidth <= this.boxWidth) {
      this.x = this.boxWidth - this.photoWidth;
      this.vx = 0;
    }
    if (this.y + this.photoHeight <= this.boxHeight) {
      this.y = this.boxHeight - this.photoHeight;
      this.vy = 0;
    }
    if (this.x >= 0) {
      this.x = 0;
      this.vx = 0;
    }
    if (this.y >= 0) {
      this.y = 0;
      this.vy = 0;
    }
    this.setPan();
  }

  continueAnimation() {
    window.requestAnimationFrame(this.processMoving.bind(this));
    if (++this.tick == 3) this.tick = 0;
  }

  startAnimation() {
    this.continueAnimation();
    this.tick = 0;
  }

  processMoving() {
    let keepAnimationRunning = true;
    if (this.tick == 0 && this.zoomMode) {
      if (this.pushed) {
        this.fx *= this.fDecay;
        this.fy *= this.fDecay;
      } else {
        this.scroll(this.vx, this.vy);
        this.vx *= this.vDecay;
        this.vy *= this.vDecay;
        if (this.vx**2 + this.vy**2 < 1) {
          this.vx = this.vy = 0;
          keepAnimationRunning = false;
        }
      }
    }
    if (keepAnimationRunning) this.continueAnimation();
  }

  handlePointerDown(evt) {
    evt.preventDefault();
    this.pushed = true;
    if (this.zoomMode) {
      this.vx = this.vy = this.fx = this.fy = 0;
      this.startAnimation();
    } else {
      this.timeStart = evt.timeStamp;
      this.pushX = evt.clientX;
      this.pushY = evt.clientY;
    }
  }

  handlePointerMove(evt) {
    evt.preventDefault();
    if (!this.pushed) return;
    if (!(evt.buttons & 1)) {
      this.handlePointerCancel();
      return;
    }
    if (this.zoomMode) {
      this.fx += evt.movementX;
      this.fy += evt.movementY;
      this.scroll(evt.movementX, evt.movementY);
    } else {
      const dx = evt.clientX - this.pushX;
      const dy = evt.clientY - this.pushY;
      const dx1 = Math.sqrt(Math.abs(dx)) * Math.sign(dx);
      const dy1 = Math.sqrt(Math.abs(dy)) * Math.sign(dy);
      const vert = Math.abs(dy) > Math.abs(dx);
      this.setShift(vert ? 0 : dx1, vert ? dy1 : 0);
    }
  }

  handlePointerUp(evt) {
    evt.preventDefault();
    if (!this.pushed) return;
    this.handlePointerCancel();
    if (this.zoomMode) {
      const rect = this.slider.getBoundingClientRect();
      const dist = (evt.clientX - rect.right)**2 + (rect.width * (evt.clientY - rect.top) / rect.height)**2;
      if (dist < (rect.width / 5)**2) {
        this.exitZoomMode();
        return;
      }
      const abs = this.fx**2 + this.fy**2;
      if (abs > this.fThresholdSqr) this.move(this.fx, this.fy);
    } else {
      const time = evt.timeStamp - this.timeStart;
      if (time != 0) {
        const dx = evt.clientX - this.pushX;
        const dy = evt.clientY - this.pushY;
        const distSqr = dx*dx + dy*dy;
        let react = true;
        if (distSqr < this.bigDistSqr) {
          const velocitySqr = distSqr / time**2;
          react = (velocitySqr >= this.bigVelocitySqr && distSqr >= this.smallDistSqr);
        }
        if (react) {
          const direction = (Math.abs(dy) > Math.abs(dx) ? 4 + Math.sign(dy) : 1 + Math.sign(dx));
          switch(direction) {
            case 0: this.next(); break;
            case 2: this.prev(); break;
            case 3: this.enterZoomMode(); break;
            case 5: this.close();
          }
        }
      }
    }
  }

  handlePointerCancel(evt) {
    this.pushed = false;
    if (!this.zoomMode) {
      this.setShift(0, 0);
    }
  }

  handleDblClick(evt) {
    if (this.zoomMode) this.exitZoomMode(); else this.enterZoomMode();
  }

  handleKeyDown(evt) {
    if (this.justOpened) {
      this.justOpened = false;
      if (evt.keyCode == 13) return;
    }
    if (this.zoomMode) {
      switch(evt.keyCode) {
        case 27:  //Esc
          this.exitZoomMode();
          this.close();
          break;
        case 8:   //Backspace
        case 13:  //Enter
          this.exitZoomMode();
          break;
        case 38:  //ArrowUp
        case 104:  //8 (up)
          this.move(0, this.step);
          break;
        case 40:  //ArrowDown
        case 98:  //2 (down)
          this.move(0, -this.step);
          break;
        case 37:  //ArrowLeft
        case 100: //4 (left)
          this.move(this.step, 0);
          break;
        case 39:  //ArrowRight
        case 102: //6 (right)
          this.move(-this.step, 0);
          break;
        case 101: //5 ()
        case 32:  //Space
          this.vx = this.vy = 0;
      }
    } else {
      switch(evt.keyCode) {
        case 27:  //Esc
        case 40:  //ArrowDown
        case 98:
          this.close();
          break;
        case 13:  //Enter
        case 38:  //ArrowUp
        case 104:
          this.enterZoomMode();
          break;
        case 37:  //ArrowLeft
        case 100: //4 (left)
          this.prev();
          break;
        case 39:  //ArrowRight
        case 102: //6 (right)
          this.next();
          break;
      }
    }
  }
}
