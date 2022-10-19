// Скопировать текст каждой кнопки в свойство "content" её псевдо-элемента ::before,
// с помощью которого выполнена анимация кнопки и требует дублирования текста кнопки
const allTheButtons = Array.from(document.querySelectorAll('.button_type_left'));
allTheButtons.forEach(button => button.setAttribute('data-before', button.textContent));

const playbillSlider = document.querySelector('.playbill__slider');
const playbillAnnouncementButton = playbillSlider.querySelector('.announcement').querySelector('.button_type_left');
const playbillAnnouncementButtonWidth =
  Number(window.getComputedStyle(playbillAnnouncementButton).getPropertyValue('width').replace('px',''));
new CustomSlider(playbillSlider, '.announcement', /*playbillAnnouncementButtonWidth + 4*/ 160);
