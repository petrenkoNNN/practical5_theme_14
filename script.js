const formEl = document.querySelector('.film-form');
const errorEl = document.querySelector('.error');
const submitBtnEl = document.querySelector('.submit-btn');
const cancelBtnEl = document.querySelector('.cancel-btn');
const sortSelectEl = document.querySelector('.sort-select');
const sortBtnEl = document.querySelector('.sort-btn');
const filmTableBodyEl = document.querySelector('.film-tbody');

const requiredItems = ['title', 'genre', 'releaseYear'];

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

const validateForm = (formData) => {
  for (let i = 0; i < requiredItems.length; i++) {
    const value = formData.get(requiredItems[i]);

    if (!value || value.trim() === '') {
      errorEl.textContent = 'Заполните все поля: название, жанр и год выпуска.';
      return false;
    }
  }

  if (!(+formData.get('releaseYear') > 0)) {
    errorEl.textContent = 'Год выпуска должен быть положительным числом.';
    return false;
  }

  errorEl.textContent = '';
  return true;
};

const handleFormSubmit = (e) => {
  e.preventDefault()
  const formData = new FormData(formEl);

  if (!validateForm(formData)) {
    return;
  }

  const film = {};

  for (let [key, value] of formData) {
    film[key] = value.trim();
  }

  film.isWatched = formData.has('isWatched');

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

   Object.entries(film).forEach(([name, value]) => {
    const fieldEl = formEl.elements[name];
    if (!fieldEl) return;

    if (fieldEl.type === 'checkbox') {
      fieldEl.checked = value;
    } else {
      fieldEl.value = value;
    }
  });

  editIndex = index;
  errorEl.textContent = '';
  submitBtnEl.textContent = 'Обновить';
  cancelBtnEl.hidden = false;
};

const sortFilms = () => {
  const key = sortSelectEl.value;
  const films = getFilms();

  films.sort((a, b) => {
    if (!isNaN(a[key]) && !isNaN(b[key])) {
      return +a[key] - +b[key];
    }

    return a[key].localeCompare(b[key]);
  });

  saveFilms(films);
  renderTable();
  resetForm();
};

const actionDict = {
  delete: deleteFilm,
  edit: startEdit,
};

formEl.addEventListener('submit', handleFormSubmit);
cancelBtnEl.addEventListener('click', resetForm);
sortBtnEl.addEventListener('click', sortFilms);

filmTableBodyEl.addEventListener('click', (e) => {
  const { action, index } = e.target.dataset;

  if (actionDict[action]) {
    actionDict[action](+index);
  }
});

renderTable();