'use strict';

var express = require('express');
var stormpath = require('express-stormpath');
var path = require('path');
var fs = require('fs');

var app = express();

var SPA_ROOT = process.argv[2]; // The path to the SPA app to serve

function isValidPath(path) {
  try {
    return path && fs.lstatSync(SPA_ROOT).isDirectory() === true;
  } catch(error) {
    return false;
  }
}

if (!isValidPath(SPA_ROOT)) {
  console.error('Error: First argument must be a valid path to your front-end app.');
  return 1;
}

app.use(stormpath.init(app, {
  web: {
    login: {
      enabled: true
    },
    logout: {
      enabled: true
    },
    register: {
      enabled: true
    },
    me: {
      enabled: true
    },
    spaRoot: path.join(SPA_ROOT, 'public', 'index.html')
  }
}));

app.use(express.static(path.join(__dirname, 'public')));

// All undefined asset or api routes should return a 404
app.route('/:url(api|auth|components|app|bower_components|assets)/*').get(function(req, res) {
  res.status(404).end();
});

// All other routes should redirect to the index.html
app.route('/*').get(function(req, res) {
  res.sendFile(path.join(SPA_ROOT, 'index.html'));
});

app.on('stormpath.ready', function() {
  app.listen(3000, function() {
    console.log('Stormpath SPA Development Server listening at http://localhost:3000');
  });
});
