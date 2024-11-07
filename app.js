/* Función para solicitar películas a la API */
const getAllMovies = async () => {
    try {
        const URL_API = "https://api.themoviedb.org/3/discover/movie?api_key=ebe642ddd92b38307fb9c7d2ac07e4b6&language=es-ES";

        const response = await fetch(URL_API);
        const dataMovies = await response.json();
        return dataMovies.results;
    } catch (error) {
        console.error(error);
    }
}

/* Función para solicitar los generos de películas a la API */
const getGenreMovies = async () => {
    try {
        const URL_API_GENRES = "https://api.themoviedb.org/3/genre/movie/list?api_key=ebe642ddd92b38307fb9c7d2ac07e4b6&language=es-ES";
        const response = await fetch(URL_API_GENRES);
        const dataGenres = await response.json();
        return dataGenres.genres;
    } catch (error) {
        console.error(error);
    }
}

/* Función para crear la UI card de cada película */
const createMovieCard = (movieTitle, poster_path, idModal, dateReleased) => {
    const URL_API_IMAGES = "https://image.tmdb.org/t/p/";
    const movieCard = document.createElement('div');
    movieCard.classList.add('card');
    movieCard.style.width = '14rem';
    movieCard.innerHTML =
        `<img src="${URL_API_IMAGES}w185${poster_path}" class="card-img-top" alt="Película ${movieTitle}">
        <div class="card-body">
            <h6 class="card-title">${movieTitle}</h6>
            <a class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal-${idModal}">Detalles</a>
        </div>
        <p class="p-2"><strong>Fecha de publicación:</strong> ${dateReleased}</p>`;
    return movieCard;
}

/* Función para listar todas las películas */
const listMovies = async (dataListMovies) => {

    if (!dataListMovies) {
        dataListMovies = await getAllMovies();
    }

    const movies = await dataListMovies;
    const containerMovies = document.getElementById("container-movies");

    if (movies.length === 0) {
        containerMovies.innerHTML =
            `<div class="alert alert-warning m-4" style="max-width: 400px;" role="alert">
            Lo siento, no pudimos encontrar ninguna película que coincida con tu búsqueda. Por favor, verifica que el nombre de la película esté escrito correctamente y vuelve a intentarlo. Recuerda que puedes buscar por el título exacto de la película o por una parte del título. :)
        </div>`;
    } else {
        containerMovies.innerHTML = '';
        const genres = await getGenreMovies();

        const genreMap = new Map();
        genres.forEach(genre => {
            genreMap.set(genre.id, genre.name);
        });

        movies.forEach(movie => {
            const genreNames = movie.genre_ids.map(id => genreMap.get(id)).join(" - ");
            const movieCardCreated = createMovieCard(movie.title, movie.poster_path, movie.id, movie.release_date);
            containerMovies.appendChild(movieCardCreated);
            const modal = createModalMovieDetails(movie.title, movie.id, movie.backdrop_path, movie.overview, genreNames, movie.release_date);
            document.body.insertAdjacentHTML('beforeend', modal);
        });
    }
}

/* Función para crear la UI del modal con detalles de la película */
const createModalMovieDetails = (movieTitle, idModal, backdropMovie, movieOverview, genreNames, releaseDate) => {
    const URL_API_IMAGES = "https://image.tmdb.org/t/p/";
    const modalMovieDetails =
        `<div class="modal" tabindex="-1" id="modal-${idModal}">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${movieTitle}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <img src="${URL_API_IMAGES}w300${backdropMovie}" class="img-fluid rounded-2" alt="Fondo película ${movieTitle}" style="width: 100%;">
                        <p>${movieOverview}</p>
                        <p><strong>Géneros:</strong> ${genreNames}</p>
                        <p><strong>Fecha de publicación:</strong> ${releaseDate}</p>
                        <hr/>
                        <div class="mb-3">
                            <label for="overview-comment-${idModal}" class="form-label">Escribe tu reseña</label>
                            <textarea class="form-control" id="overview-comment-${idModal}" rows="3"></textarea>
                        </div>
                        <div class="overflow-auto" style="max-height: 100px;" id="container-comments-${idModal}">
                            <p><strong>Reseñas</strong></p>
                            <p id="no-reviews">Sin reseñas todavia...</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        <button type="button" class="btn btn-primary" id:"add-comment" onclick=addComment(${idModal})>Agregar comentario</button>
                    </div>
                </div>
            </div>
        </div>`;
    return modalMovieDetails;
}

/* Función para añadir comentarios */
const addComment = (idContainerComments) => {
    const comment = document.getElementById(`overview-comment-${idContainerComments}`).value;
    const containerComments = document.getElementById(`container-comments-${idContainerComments}`);
    const noReviews = document.getElementById("no-reviews");
    if (comment === "") {
        alert("Escribe algo como reseña");
    } else {
        noReviews.remove();
        containerComments.innerHTML += `<p><strong>Usuario: </strong>${comment}</p>`;
        document.getElementById(`overview-comment-${idContainerComments}`).value = "";
    }
}

/* Función para buscar película */
const searchMovie = async () => {
    const arrayMovies = await getAllMovies();
    const inputSearch = document.getElementById("input-search");
    const inputSearchValue = inputSearch.value.trim().toLowerCase();
    const resultSearch = arrayMovies.filter(foundMovie => foundMovie.title.toLowerCase().includes(inputSearchValue));
    return resultSearch;
}

/* Función para filtrar por fecha */
const filterMoviesByDate = () => {
    const dropdownDateFilter = document.getElementById("dropdown-date-filter");
    const dateFilters = ["Más recientes", "Más antiguas"];

    dropdownDateFilter.innerHTML = '';
    dateFilters.forEach(filter => {
        let filterElement = document.createElement('li');
        let link = document.createElement('a');
        link.textContent = filter;
        link.classList.add('dropdown-item');
        link.onclick = () => sortMovies(filter);
        filterElement.appendChild(link);
        dropdownDateFilter.appendChild(filterElement);
    });
}

/* Función para ordenar las películas */
const sortMovies = async (sortOrder) => {
    let movies = await getAllMovies();
    if (sortOrder === "Más recientes") {
        movies.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
    } else {
        movies.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
    }
    listMovies(movies);
}

filterMoviesByDate();
listMovies();
