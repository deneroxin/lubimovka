// Скопировать текст каждой кнопки в свойство "content" её псевдо-элемента ::before,
// с помощью которого выполнена анимация кнопки и требует дублирования текста кнопки
const allTheButtons = Array.from(document.querySelectorAll('.button_type_left'));
allTheButtons.forEach(button => button.setAttribute('data-before', button.textContent));

const playbillSliders = Array.from(document.querySelectorAll('.playbill__slider'));
playbillSliders.forEach(el => new CustomSlider(el, 'button_type_left'));
