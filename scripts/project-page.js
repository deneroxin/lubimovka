console.log('Script attached');

// Функция копирует текст каждой кнопки в свойство "content" её псевдо-элемента ::before,
// так как анимация кнопки требует совпадения текста у кнопки и у дублирующего слоя
function prepareAnimatedButtons() {
  function prepareAnimatedButtons(container) {
    const buttons = Array.from(container.querySelectorAll('.button'));
    buttons.forEach(button =>
      button.setAttribute('data-before', button.textContent));
  }
  prepareAnimatedButtons(document);
  const allTemplates = Array.from(document.querySelectorAll('template'));
  allTemplates.forEach(template =>
    prepareAnimatedButtons(template.content));
}

prepareAnimatedButtons();



import {Menu} from './Menu.js';
const menuSection = new Menu('.header__menu');
menuSection.setEventListeners();

import {findVideos} from './video-button.js';
findVideos();





import {initialData} from './initialData.js';
import {CustomSlider} from './customSlider.js';


const templates = {};

function addTemplate(name) {
    const template = document.querySelector(`.${name}-template`).content.querySelector(`.${name}`);
    templates[name] = template;
}

addTemplate('gallery__item');
addTemplate('announcement');
addTemplate('play');
addTemplate('person');

const fill = {
  gallery__item: (element, data) => {
    const image = element.querySelector('.gallery__image');
    image.src = `./images/gallery/${data.image}-low.jpg`;
    image.alt = data.alt;
  },
  announcement: (element, data) => {
    const image = element.querySelector('.announcement__image')
    image.src = `./images/playbill/${data.image}.jpg`;
    image.alt = data.title;
    Object.keys(data).forEach(key =>
      element.querySelector(`.announcement__${key}`).textContent = data[key]);
  },
  play: (element, data) => {
    element.querySelector('.play__title').textContent = data.title;
    const name = element.querySelectorAll('.play__name');
    const dataName = data.name.split(' ');
    name.forEach((el, i) => el.textContent = dataName[i]);
    const cityYear = element.querySelectorAll('.play__city-year');
    cityYear[0].textContent = data.city;
    cityYear[1].textContent = data.year;
  },
  person: (element, data) => {
    const photo = element.querySelector('.person__photo');
    photo.src = `./images/personnel/${data.photo}.jpg`;
    photo.alt = data.name;
    const name = element.querySelectorAll('.person__name-word');
    const dataName = data.name.split(' ');
    name.forEach((el, i) => el.textContent = dataName[i]);
    element.querySelector('.person__position').textContent = data.position;
  },
};

const create = {
  gallery__item: (data) => {
    const element = templates['gallery__item'].cloneNode(true);
    fill.gallery__item(element, data);
    element.addEventListener('click', () => handleGalleryItemClick(data));
    return element;
  },
  announcement: (data) => {
    const element = templates['announcement'].cloneNode(true);
    fill.announcement(element, data);
    //Set event listeners if necessary
    return element;
  },
  play: (data) => {
    const element = templates['play'].cloneNode(true);
    fill.play(element, data);
    //Set event listeners if necessary
    return element;
  },
  person: (data) => {
    const element = templates['person'].cloneNode(true);
    fill.person(element, data);
    //Set event listeners if necessary
    return element;
  },
};

let keyboardOwner = null;

window.addEventListener('keydown', evt => {
  if (keyboardOwner) keyboardOwner.handleKeyDown(evt);
});

function setKeyboardOwner(owner) { keyboardOwner = owner }

function setupSliders() {
  const sliders = Array.from(document.querySelectorAll('.custom-slider'));
  sliders.forEach(slider => {
    const dataType = slider.getAttribute('data-type');
    new CustomSlider(slider, {
      dataSource: initialData[slider.getAttribute('data-source')],
      createChild: create[dataType],
      fillChild: fill[dataType],
      interactiveClass: slider.getAttribute('data-interactive'),
      cyclic: Boolean(slider.getAttribute('data-cyclic')),
      numChildrenPresent: slider.getAttribute('data-present'),
      setKeyboardOwner
    });
  });
}

function setupPlaybillSingle() {
  const playbillSingles = Array.from(document.querySelectorAll('.playbill_type_single'));
  playbillSingles.forEach(playbill => {
    const container = playbill.querySelector('.playbill__container');
    const element = create['announcement'](initialData[container.getAttribute('data-source')]);
    container.append(element);
  });
}

function fillInGallery() {
  const container = document.querySelector('.gallery__container');
  const dataCopy = initialData.gallery.slice();
  for (let n = container.getAttribute('data-num-elements') || 4;
           n > 0 && dataCopy.length;
           n--)
  {
    const idx = Math.floor(Math.random() * dataCopy.length);
    container.append(create['gallery__item'](dataCopy[idx]));
    const lastItem = dataCopy.pop();
    if (idx != dataCopy.length) dataCopy[idx] = lastItem;
  }
}

function handleGalleryItemClick(data) {
  const idx = initialData.gallery.indexOf(data);
  console.log('Open popup ' + idx);
}

setupSliders();
setupPlaybillSingle();
fillInGallery();
