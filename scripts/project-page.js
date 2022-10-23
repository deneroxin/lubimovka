console.log('Script attached');

// Скопировать текст каждой кнопки в свойство "content" её псевдо-элемента ::before,
// с помощью которого выполнена анимация кнопки и требует дублирования текста кнопки
const allTheButtons = Array.from(document.querySelectorAll('.button'));
allTheButtons.forEach(button => button.setAttribute('data-before', button.textContent));

import {CustomSlider} from '../blocks/custom-slider/custom-slider.js';
const playbillSliders = Array.from(document.querySelectorAll('.playbill__slider'));
playbillSliders.forEach(el => new CustomSlider(el, 'button'));

import {Menu} from './Menu.js';
const menuSection = new Menu('.header__menu');
menuSection.setEventListeners();
