const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const connectDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server started at http://localhost:3000/movies/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
connectDBAndServer();

//Get All Movies API

app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `
    SELECT
    movie_name
    FROM
    movie;
    `;
  const allMovies = await db.all(getAllMoviesQuery);
  response.send(
    allMovies.map((movieNames) => {
      return {
        movieName: movieNames.movie_name,
      };
    })
  );
});

// Post Movie Details

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const newMovieQuery = `
    INSERT INTO
        movie (director_id, movie_name, lead_actor)
    VALUES
    (
        '${directorId}', 
        '${movieName}', 
        '${leadActor}'
    );
    `;
  const movieDetailsPosted = await db.run(newMovieQuery);
  const movieId = movieDetailsPosted.lastId;
  response.send("Movie Successfully Added");
});

//Get a Movie Details

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const getMovieDetailsQuery = `
  SELECT
    *
  FROM
    movie
  WHERE
    movie_id = '${movieId}';
  `;
  const movieDetails = await db.get(getMovieDetailsQuery);
  console.log(movieDetails);
  let selectedMovie = {
    movieId: movieDetails.movie_id,
    directorId: movieDetails.director_id,
    movieName: movieDetails.movie_name,
    leadActor: movieDetails.lead_actor,
  };
  response.send(selectedMovie);
});

//Update a Movie Details

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateAMovieQuery = `
    UPDATE
        movie
    SET
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'    
    WHERE
        movie_id = ${movieId};
    `;
  await db.run(updateAMovieQuery);
  response.send("Movie Details Updated");
});

//Delete a Movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
  DELETE FROM
    movie
  WHERE
    movie_id = ${movieId};
  `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Get All Directors API

app.get("/directors/", async (request, response) => {
  const getAllDirectorsQuery = `
    SELECT
        *
    FROM
        director;
    `;
  const allDirectors = await db.all(getAllDirectorsQuery);
  response.send(
    allDirectors.map((directorDetails) => {
      return {
        directorId: directorDetails.director_id,
        directorName: directorDetails.director_name,
      };
    })
  );
});

//Get Movie by specific Director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
        movie_name
    FROM
        movie
    WHERE
        director_id = ${directorId};
    `;
  const directorMovies = await db.all(getDirectorMoviesQuery);
  response.send(
    directorMovies.map((movie) => {
      return {
        movieName: movie.movie_name,
      };
    })
  );
});

module.exports = app;
