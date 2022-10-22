export class Menu {
  constructor (selectorMenu) {
    this._nodeMenu = document.querySelector(`${selectorMenu}-container`);
    this._selectorMenuOpened = 'header__menu-container_opened';
    this._buttonMenu = document.querySelector(`${selectorMenu}-button`);
  }

  _switchVisible () {
    console.log(this._nodeMenu);
    console.log(this._buttonMenu);
    this._nodeMenu.classList.toggle(this._selectorMenuOpened);
  }

  setEventListeners () {
    this._buttonMenu.addEventListener('click', () => this._switchVisible());
  }

}
