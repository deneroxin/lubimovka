// Скопировать текст каждой кнопки в свойство "content" её псевдо-элемента ::before,
// с помощью которого выполнена анимация кнопки и требует дублирования текста кнопки
const allTheButtons = Array.from(document.querySelectorAll('.button_type_left'));
allTheButtons.forEach(button => button.setAttribute('data-before', button.textContent));

const playbillSlider = document.querySelector('.playbill__slider');
new CustomSlider(playbillSlider, '.announcement');
