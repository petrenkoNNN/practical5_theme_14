const formEl = document.querySelector('#film-form');
const titleEl = document.querySelector('#title');
const genreEl = document.querySelector('#genre');
const releaseYearEl = document.querySelector('#releaseYear');
const isWatchedEl = document.querySelector('#isWatched');
const errorEl = document.querySelector('#error');
const submitBtnEl = document.querySelector('#submit-btn');
const cancelBtnEl = document.querySelector('#cancel-btn');
const sortSelectEl = document.querySelector('#sort-select');
const sortBtnEl = document.querySelector('#sort-btn');
const filmTableBodyEl = document.querySelector('#film-tbody');

let editIndex = null;

const getFilms = () => JSON.parse(localStorage.getItem('films')) || [];

const saveFilms = (films) => {
  localStorage.setItem('films', JSON.stringify(films));
};

const resetForm = () => {
  formEl.reset();
  editIndex = null;
  errorEl.textContent = '';
  submitBtnEl.textContent = 'Добавить';
  cancelBtnEl.hidden = true;
};

const validateForm = () => {
  const title = titleEl.value.trim();
  const genre = genreEl.value.trim();
  const releaseYear = releaseYearEl.value.trim();

  if (!title || !genre || !releaseYear) {
    errorEl.textContent = 'Заполните все поля: название, жанр и год выпуска.';
    return false;
  }

  if (!(+releaseYear > 0)) {
    errorEl.textContent = 'Год выпуска должен быть положительным числом.';
    return false;
  }

  errorEl.textContent = '';
  return true;
};

const handleFormSubmit = (e) => {
  e.preventDefault()

  if (!validateForm()) {
    return;
  }

  const film = {
    title: titleEl.value.trim(),
    genre: genreEl.value.trim(),
    releaseYear: releaseYearEl.value.trim(),
    isWatched: isWatchedEl.checked,
  }

  if (editIndex === null) {
    addFilmToLocalStorage(film)
  } else {
    updateFilmInLocalStorage(editIndex, film)
  }

  resetForm();
}

const addFilmToLocalStorage = (film) => {
  const films = getFilms();
  films.push(film)
  saveFilms(films);

  renderTable();
}

const updateFilmInLocalStorage = (index, film) => {
  const films = getFilms();
  films[index] = film;
  saveFilms(films);

  renderTable();
}

const renderTable = () => {
  const films = getFilms();

  filmTableBodyEl.innerHTML = ""

  films.forEach((film, index) => {
    const row = document.createElement('tr');
    const values = [
      film.title,
      film.genre,
      film.releaseYear,
      film.isWatched ? "Да" : "Нет",
    ];

    values.forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });

    const actionsCell = document.createElement('td');
    actionsCell.innerHTML = `
      <button type="button" data-action="edit" data-index="${index}">Редактировать</button>
      <button type="button" data-action="delete" data-index="${index}">Удалить</button>
    `;
    row.appendChild(actionsCell);

    filmTableBodyEl.appendChild(row);
  })
}

const deleteFilm = (index) => {
  const films = getFilms();
  films.splice(index, 1);
  saveFilms(films);
  renderTable();

  if (editIndex === index) {
    resetForm();
  } else if (editIndex !== null && editIndex > index) {
    editIndex--;
  }
};

const startEdit = (index) => {
  const film = getFilms()[index];

  titleEl.value = film.title;
  genreEl.value = film.genre;
  releaseYearEl.value = film.releaseYear;
  isWatchedEl.checked = film.isWatched;

  editIndex = index;
  errorEl.textContent = '';
  submitBtnEl.textContent = 'Обновить';
  cancelBtnEl.hidden = false;
};

const sortFilms = () => {
  const key = sortSelectEl.value;
  const films = getFilms();

  films.sort((a, b) => {
    if (key === 'releaseYear') {
      return +a.releaseYear - +b.releaseYear;
    }

    return a[key].localeCompare(b[key]);
  });

  saveFilms(films);
  renderTable();
  resetForm();
};

formEl.addEventListener('submit', handleFormSubmit);
cancelBtnEl.addEventListener('click', resetForm);
sortBtnEl.addEventListener('click', sortFilms);

filmTableBodyEl.addEventListener('click', (e) => {
  const { action, index } = e.target.dataset;

  if (action === 'delete') {
    deleteFilm(+index);
  }

  if (action === 'edit') {
    startEdit(+index);
  }
});

renderTable();