let { open } = require("sqlite");
let sqlite3 = require("sqlite3");

const path = require("path");
let dbPath = path.join(__dirname, "moviesData.db");

let express = require("express");
let app = express();
app.use(express.json());
module.exports = app;

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error : ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//list of movie names
app.get("/movies/", async (request, response) => {
  const movieNamesQuery = `
    SELECT movie_name AS movieName
    FROM movie ;`;
  let movieNames = await db.all(movieNamesQuery);
  response.send(movieNames);
});

//adding a director
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO 
     movie(
         director_id ,
         movie_name ,
         lead_actor)
     VALUES(
         ${directorId} ,
         '${movieName}',
         '${leadActor}');`;
  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastId;
  response.send("Movie Successfully Added");
});

//movie info based on movie_id
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetailsQuery = `
   SELECT 
   movie_id AS movieId ,
   director_id AS directorId ,
   movie_name AS movieName ,
   lead_actor AS leadActor
   FROM movie 
   WHERE movie_id = ${movieId} ;`;
  const movieDetails = await db.get(movieDetailsQuery);
  response.send(movieDetails);
});

//update movie details by movie_id
app.put("/movies/:movieId/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const { movieId } = request.params;
  const UpdateMovieDetailsQuery = `
    UPDATE 
     movie
         SET
         director_id = ${directorId} ,
         movie_name ='${movieName}' ,
         lead_actor ='${leadActor}'
    WHERE 
     movie_id = ${movieId} ;
     `;
  await db.run(UpdateMovieDetailsQuery);
  response.send("Movie Details Updated");
});

//delete a movie from movie table
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  let deleteMovieQuery = `
    DELETE FROM 
    movie
    WHERE movie_id = ${movieId} ;`;
  const deleteMovie = await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//get all thae directors and their id's
app.get("/directors/", async (request, response) => {
  const directorslistQuery = `
    SELECT 
    director_id AS directorId ,
    director_name AS directorName 
    FROM director ;`;
  const directorslist = await db.all(directorslistQuery);
  response.send(directorslist);
});

//get the movies of the specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const moviesOfDirectorQuery = `
    SELECT 
    movie_name 
    FROM 
    movie
    WHERE director_id = ${directorId} ;`;
  const moviesOfDirector = await db.all(moviesOfDirectorQuery);
  response.send(
    moviesOfDirector.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
