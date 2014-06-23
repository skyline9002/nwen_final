var express = require('express');
var fs = require('fs');
var app = express();
var pg = require('pg').native;
var connectionString = process.env.DATABASE_URL;
var client;

app.set('views', __dirname + '/views');

app.use(express.multipart());
app.set('port', process.env.PORT || 3000);
app.use(express.bodyParser());
app.use(express.static(__dirname));
app.use(app.router);

client = new pg.Client(connectionString);
client.connect();

app.get('/data', function(req, res){ 
    var query = client.query('SELECT * FROM stories', function(err, result) {
        if(err) console.log(err);
        res.send(result.rows);
    });
});

app.get('/base/image/:index', function (req, res) {
   if(stories.length <= req.params.index || req.params.index < 0) {
    res.statusCode = 404;
    return res.send('Error 404: No quote found');
  }
  res.send({"imageName" : stories[req.params.index].image});
});

app.post('/base/upload', function (req, res) {
    console.log(req.files);

    if(!req.body.hasOwnProperty('etching') || 
       !req.body.hasOwnProperty('headline') || 
       !req.body.hasOwnProperty('latitude') || 
       !req.body.hasOwnProperty('longitude')) {
    res.statusCode = 400;
    return res.send('Error 400: Post syntax incorrect.');
    }

    fs.readFile(req.files.fileInput.path, function(err, data) {
    var imageName = req.files.fileInput.name;
    if(!imageName) {
      client.query('INSERT INTO stories(headline, author, story, latitude, longitude) VALUES($1, $2, $3, $4, $5)',
      [
        req.body.headline, 
        req.body.author, 
        req.body.etching, 
        req.body.latitude, 
        req.body.longitude
      ]);
    }else {
      var newPath = __dirname + "/public/image/" + imageName;
      fs.writeFile(newPath, data, function (err) {
        client.query('INSERT INTO stories(headline, author, story, image_name, latitude, longitude) VALUES($1, $2, $3, $4, $5, $6)', 
        [
          req.body.headline, 
          req.body.author, 
          req.body.etching, 
          req.files.fileInput.name, 
          req.body.latitude, 
          req.body.longitude
        ]);
      });
    }
    res.redirect("/");
  });
});

app.get('/base/uploads/:file', function (request, response) {
	var file = request.params.file;
	var img = fs.readFileSync(__dirname + "/public/image/" + file);
	response.writeHead(200, {'Content-Type': 'image/jpeg' });
	response.end(img);
});

var server = app.listen(app.get('port'), function () {
    console.log('Listening on port %d', server.address().port);
});
