var pg = require('pg').native
  , connectionString = process.env.DATABASE_URL
  , client
  , query;

client = new pg.Client(connectionString);
client.connect();
query = client.query('CREATE TABLE stories (story_id serial PRIMARY KEY, headline text not null, author text, story text not null, image_name text, latitude numeric(30, 20) not null, longitude numeric(30, 20) not null)');
query.on('end', function(result) { client.end(); });
