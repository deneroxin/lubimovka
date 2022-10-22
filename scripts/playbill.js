const playbillSliders = Array.from(document.querySelectorAll('.playbill__slider'));
playbillSliders.forEach(el => new CustomSlider(el, 'button'));
