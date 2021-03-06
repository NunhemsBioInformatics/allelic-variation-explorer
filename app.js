
/**
* Module dependencies.
*/

var express = require('express');
var seqdb = require('./seqdb');
var os = require('os');
var stylus = require('stylus');

var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

// Configuration
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(stylus.middleware({ src: __dirname + '/public'}));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));

});

app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
server.listen(3838);

var hostip = process.argv[2];

// Routes

app.get('/', function(req, res) {
    res.render('index', {
        title: 'Allelic Variation Explorer',
        hostip: hostip
    });
});

// socket.io
io.set('log level', 1);
io.sockets.on('connection', function(socket) {

    socket.on('getData', function(region) {
        console.log("fetching data from: ");
        console.log("region");
        seqdb.getRegion(region, function(err, data){
            if (err) {throw err;}
            if (data.refseq === "") {
              console.log("empty");
              socket.emit('featureNotFound',
              "region out of range!");
            } else {
              console.log("data arrived!");
              console.log(data);
              socket.emit('data', data);
            }
        });
    });

    socket.on('getFeatureRegion', function(req) {
        console.log(req);
        var genome = req.genome;
        var name = req.name;
        var flank = req.flank;
        seqdb.getFeatureRegion(genome, name, flank, function(err, reg) {
          console.log(reg);
            if (err) {console.log(err);}
            if (reg.start === undefined) {
                socket.emit('featureNotFound',
                "Feature has not been found");
            } else {socket.emit('featureRegion', reg);}
        });
    });

    socket.on('getStrains', function(genome) {
      seqdb.getAllStrains(genome, function(data) {
        socket.emit('strains', data);
      });
    });

    socket.on('getRefList', function() {
      seqdb.getRefList(function(data) {
        socket.emit('refList', data);
      });
    });

    socket.on('getChromInfo', function() {
      seqdb.getChromInfo(function(data) {
        console.log(data);
        socket.emit('chromInfo', data);
      });
    });

    socket.on('switchReference', function(refgen) {
      seqdb.switchDb(refgen);
    });

});

console.log("Express server listening on port %d in %s mode",
    server.address().port, app.settings.env);
