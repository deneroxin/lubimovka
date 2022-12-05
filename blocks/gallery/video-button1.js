function parseMediaURL(link) {
  const regexp = /\/([a-zA-Z0-9_-]+)$/;
  return (link.href.match(regexp))[1];
}

function generateURL(id) {
  return `https://www.youtube.com/embed/${id}?rel=0&showinfo=0&autoplay=1`;
}

function setupVideo(video) {
  const link = video.querySelector('.video__link');
  const id = parseMediaURL(link);
  video.addEventListener('click', () => {
    link.remove();
    video.appendChild(createIframe(id));
  });
  link.removeAttribute('href');
  video.classList.add('video_enabled');
}

function createIframe(id) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('allow', 'autoplay');
  iframe.setAttribute('src', generateURL(id));
  iframe.classList.add('video__media');
  return iframe;
}

export function findVideos() {
  document.querySelectorAll('.video').forEach(setupVideo);
}
