const API_KEY = '';
const MOVIE_ID = 11;
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';
const BASE_URL = 'https://api.themoviedb.org/3';
function isMobile() {
  return window.innerWidth <= 767.98; 
}


async function loadMovieInfo() {
  try {
    const resMovie = await fetch(`${BASE_URL}/movie/${MOVIE_ID}?api_key=${API_KEY}&language=pt-BR`);
    const movie = await resMovie.json();

    const resCredits = await fetch(`${BASE_URL}/movie/${MOVIE_ID}/credits?api_key=${API_KEY}&language=pt-BR`);
    const credits = await resCredits.json();

    const director = credits.crew.find(person => person.job === 'Director');
    const writers = credits.crew.filter(person =>
      person.job === 'Writer' || person.job === 'Screenplay' || person.job === 'Author'
    );
    const writerNames = writers.map(w => w.name).join(', ') || 'Unknown';

    const infoSection = document.getElementById('info');

    const posterHTML = `
      <div class="info-image" style="min-width: 200px;">
        <img src="${IMG_BASE + movie.poster_path}" alt="Movie poster of ${movie.title}" class="img-fluid" />
      </div>
    `;

    const genres = movie.genres.map(g => g.name).join(', ');

    const textHTML = `
      <div class="info-text flex-grow-1 pl-4">
        <h2 class="font-weight-bold">${movie.title} (${movie.release_date.slice(0, 4)})</h2>
        <p><strong>Genre:</strong> ${genres}</p>
        <p><strong>Overview:</strong><br />${movie.overview}</p>

        <div class="info-details-container d-flex flex-wrap">
          <div class="info-block flex-fill pr-3">
            <p><strong>Directed by:</strong><br />${director ? director.name : 'Unknown'}</p>
          </div>
          <div class="info-block flex-fill">
            <p><strong>Written by:</strong><br />${writerNames}</p>
          </div>
          <div class="info-block flex-fill pr-3">
            <p><strong>Status:</strong><br />${movie.status}</p>
          </div>
          <div class="info-block flex-fill">
            <p><strong>Language:</strong><br />${movie.original_language.toUpperCase()}</p>
          </div>
          <div class="info-block flex-fill pr-3">
            <p><strong>Budget:</strong><br />$${movie.budget.toLocaleString()}</p>
          </div>
          <div class="info-block flex-fill">
            <p><strong>Revenue:</strong><br />$${movie.revenue.toLocaleString()}</p>
          </div>
        </div>
      </div>
    `;

    infoSection.innerHTML = posterHTML + textHTML;
  } catch (error) {
    console.error('Error loading movie information:', error);
  }
}

async function loadCast() {
  try {
    const res = await fetch(`${BASE_URL}/movie/${MOVIE_ID}/credits?api_key=${API_KEY}&language=pt-BR`);
    const data = await res.json();
    const cast = data.cast.slice(0, 10);

    const castList = document.getElementById('cast-list');
    castList.innerHTML = '';

    cast.forEach(actor => {
      const div = document.createElement('div');
      div.className = 'cast-item';

      const img = document.createElement('img');
      img.className = 'cast-img';
      img.src = actor.profile_path
        ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
        : 'https://via.placeholder.com/100x100?text=No+Photo';
      img.alt = actor.name;

      const name = document.createElement('div');
      name.innerHTML = `<strong>${actor.name}</strong>`;

      const character = document.createElement('div');
      character.textContent = actor.character;

      div.append(img, name, character);
      castList.appendChild(div);
    });

    updateBlur();
  } catch (error) {
    console.error('Error loading cast:', error);
  }
}

async function loadReviews() {
  try {
    const res = await fetch(`${BASE_URL}/movie/${MOVIE_ID}/reviews?api_key=${API_KEY}&language=pt-BR&page=1`);
    const data = await res.json();

    const reviewsContainer = document.getElementById('reviews-container');
    reviewsContainer.innerHTML = '';

    const reviews = data.results.slice(0, 2);

    reviews.forEach(review => {
      const { author, content, created_at, author_details } = review;

      const rating = author_details.rating || 'No rating';
      const formattedDate = new Date(created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      const reviewBox = document.createElement('div');
      reviewBox.className = 'col-12 col-md-6';
      reviewBox.innerHTML = `
        <div class="review-box">
          <p class="mb-2">
            ${content.length > 200 ? content.substring(0, 800) + '...' : content}
          </p>
          <p class="mb-2">
            by <span class="review-author">${author}</span>
          </p>
          <div class="d-flex justify-content-between text-muted small">
            <span>${formattedDate}</span>
            <span>Rating: ${
              typeof rating === 'number'
                ? `<span class="review-score">${rating}</span>/10`
                : 'No rating'
            }</span>
          </div>
        </div>
      `;

      reviewsContainer.appendChild(reviewBox);
    });
  } catch (error) {
    console.error('Error loading reviews:', error);
  }
}

async function loadVideos() {
  try {
    const res = await fetch(`${BASE_URL}/movie/${MOVIE_ID}/videos?api_key=${API_KEY}&language=pt-BR`);
    const data = await res.json();

    const videoList = document.getElementById('video-list');
    const videos = data.results;
    videoList.innerHTML = '';

    const titleElement = document.getElementById('videos-title');
    titleElement.textContent = 'Videos';
    titleElement.setAttribute('data-count', `(${videos.length})`);

    videos.slice(0, 3).forEach(video => {
      const iframe = document.createElement('iframe');
      iframe.width = '300';
      iframe.height = '170';
      iframe.src = `https://www.youtube.com/embed/${video.key}`;
      iframe.title = video.name;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;

      videoList.appendChild(iframe);
    });
  } catch (error) {
    console.error('Error loading videos:', error);
  }
}

async function loadImages() {
  try {
    const res = await fetch(`${BASE_URL}/movie/${MOVIE_ID}/images?api_key=${API_KEY}`);
    const data = await res.json();

    const posterList = document.getElementById('poster-list');
    const backdropList = document.getElementById('backdrop-list');
    posterList.innerHTML = '';
    backdropList.innerHTML = '';

    const posterCount = data.posters.length;
    const backdropCount = data.backdrops.length;

    const postersTitle = document.getElementById('posters-title');
    postersTitle.textContent = 'Posters';
    postersTitle.setAttribute('data-count', `(${posterCount})`);

    const backdropsTitle = document.getElementById('backdrops-title');
    backdropsTitle.textContent = 'Backdrops';
    backdropsTitle.setAttribute('data-count', `(${backdropCount})`);

    data.posters.slice(0, 4).forEach(poster => {
      const img = document.createElement('img');
      img.src = `https://image.tmdb.org/t/p/w300${poster.file_path}`;
      img.alt = 'Poster';
      img.style.width = '200px';
      img.style.borderRadius = '8px';
      posterList.appendChild(img);
    });

    data.backdrops.slice(0, 2).forEach(backdrop => {
      const img = document.createElement('img');
      img.src = `https://image.tmdb.org/t/p/w500${backdrop.file_path}`;
      img.alt = 'Backdrop';
      img.style.width = '300px';
      img.style.borderRadius = '8px';
      backdropList.appendChild(img);
    });

    // <<< CHAMADA IMPORTANTE para ativar o blur inicial dos carrosseis de posters e backdrops:
    updateBlurGeneric('.poster-carousel-wrapper', '#poster-list');
    updateBlurGeneric('.backdrop-carousel-wrapper', '#backdrop-list');

  } catch (error) {
    console.error('Error loading images:', error);
  }
}


function updateBlur() {
  const carousel = document.querySelector('.cast-carousel');
  const wrapper = document.querySelector('.cast-carousel-wrapper');
  const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;

  wrapper.classList.toggle('show-blur-left', carousel.scrollLeft > 5);
  wrapper.classList.toggle('show-blur-right', carousel.scrollLeft < maxScrollLeft - 5);
}

document.addEventListener('DOMContentLoaded', () => {
  loadMovieInfo();
  loadCast();
  loadVideos();
  loadImages();
  loadRecommended();
  loadReviews();

  const carousel = document.querySelector('.cast-carousel');
  const wrapper = document.querySelector('.cast-carousel-wrapper');

  let isDown = false;
  let startX, scrollLeft;

  carousel.addEventListener('scroll', updateBlur);

  carousel.addEventListener('mousedown', (e) => {
    isDown = true;
    carousel.classList.add('active');
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
  });

  document.addEventListener('mouseup', () => {
    isDown = false;
    carousel.classList.remove('active');
  });

  carousel.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 1.5;
    carousel.scrollLeft = scrollLeft - walk;
  });
  const posterCarousel = document.querySelector('#poster-list');
const backdropCarousel = document.querySelector('#backdrop-list');

posterCarousel.addEventListener('scroll', () =>
  updateBlurGeneric('.poster-carousel-wrapper', '#poster-list')
);

backdropCarousel.addEventListener('scroll', () =>
  updateBlurGeneric('.backdrop-carousel-wrapper', '#backdrop-list')
);
});

async function loadRecommended() {
  try {
    const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=pt-BR&page=1`);
    const data = await res.json();
    const movies = data.results.slice(0, 6);

    const grid = document.getElementById('recomendados-grid');
    const scroll = document.getElementById('recomendados-scroll');

    movies.forEach((movie) => {
      const { title, poster_path, vote_average } = movie;
      const percentage = Math.round(vote_average * 10);

      const col = document.createElement('div');
      col.className = 'col-6 col-md-4 col-lg-2 mb-4 text-center text-white';
      col.innerHTML = `
        <img src="${IMG_BASE + poster_path}" alt="${title}" class="img-fluid recomendado-poster mb-2 rounded">
        <strong class="d-block">${title}</strong>
        <p class="m-0">${percentage}%</p>
      `;
      grid.appendChild(col);

      const scrollItem = document.createElement('div');
      scrollItem.innerHTML = `
        <div class="text-center">
          <img src="${IMG_BASE + poster_path}" alt="${title}" class="recomendado-poster rounded" style="width: 100%; max-width: 100%;">
          <strong class="d-block small mt-1">${title}</strong>
          <p class="m-0 small">${percentage}%</p>
        </div>
      `;

      scroll.appendChild(scrollItem);
    });
  } catch (error) {
    console.error('Error loading recommended movies:', error);
  }
}
function updateBlurGeneric(wrapperSelector, carouselSelector) {
  const carousel = document.querySelector(carouselSelector);
  const wrapper = document.querySelector(wrapperSelector);

  if (!carousel || !wrapper) return;

  // Só aplica blur no mobile
  if (!isMobile()) {
    wrapper.classList.remove('show-blur-left', 'show-blur-right');
    return;
  }

  const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
  
  // Só aplica blur se for rolável (mais de um item)
  if (maxScrollLeft <= 0) {
    wrapper.classList.remove('show-blur-left', 'show-blur-right');
    return;
  }

  wrapper.classList.toggle('show-blur-left', carousel.scrollLeft > 5);
  wrapper.classList.toggle('show-blur-right', carousel.scrollLeft < maxScrollLeft - 5);
}
