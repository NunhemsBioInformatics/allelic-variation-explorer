
/**
* Module dependencies.
*/

var express = require('express');
var seqdb = require('./seqdb');

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);

var stalker = require('stalker');

// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(require('stylus').middleware({src: __dirname + '/public'}));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res) {
    res.render('index', {
        title: 'Allelic Variation Explorer'
    });
});

// socket.io
io.set('log level', 3);
io.sockets.on('connection', function(socket) {

    socket.on('reloadDb', function(){
        seqdb.reloadDb(function(err, results) {
            if(err) console.log(err);
            else console.log(results);
            seqdb.getFromRegion(seqdb.Feature, 'mRNA',
                {chrom: 1, start: 3000, end: 1000000},
                function(err, doc) {
                    if (err) console.log(err);
                    console.dir("mrnas: " + doc[0]);
                } );
        });
    });

    socket.on('getData', function(region) {
        console.log(region);
        seqdb.getRegion(region, function(err, data){
            if (err) throw err;
            else {
                console.log(data);
                socket.emit('data', data);
            }
        });
    });

    socket.on('getGeneModels', function(region) {
        seqdb.getGeneModels(region, function(err, data){
            if (err) throw err;
            else {
                socket.emit('geneModels', data);
            }
        });
    });

    socket.on('getFeatureRegion', function(req) {
        var name = req.name;
        var flank = req.flank;
        seqdb.getFeatureRegion(name, flank, function(err, reg) {
            if (err) console.log(err);
            if (reg.start === undefined) {
                socket.emit('featureNotFound',
                "Feature has not been found");
            } else socket.emit('featureRegion', reg);
        });
    });

    // socket.on('getFasta', function(region) {
        //    seqdb.getRefRegion(region, function (err, data) {
            //      if (err) throw err;
            //      console.log("fasta region: ");
            //      console.log(data);
            //    });
            // });
});

// seqdb.getRefRegion({chrom: 1, start: 6484, end: 47889},
//     function(err, data) {
//       if (err) throw err;
//       console.log("refregion: !");
//       console.log(data);
//       console.log(data.length);
// });

//seqdb.annotateCodNCodSNPs(function() {
//    console.log("annotated coding SNPs")
//    });

// seqdb.getRefRegion({ start: 14584, end: 39789, chrom: 1 },
//   function(err, data) {
//     if (err) throw err;
//     console.log("ref seq: ");
//     console.log(data);
//   });

// seqdb.importRefSeq(function(err, res) {
//   if (err) throw err;
//   console.log(res);
// })

// // use stalker to watch the database directory
// stalker.watch('./data/imports', {buffer: 5000},
//     function(err, files) {
//         if (err) throw err;
//         seqdb.onDbFilesAdded(files);
//     },
//     function(err, files) {
//         if (err) throw err;
//         seqdb.onDbFilesRemoved(files);
//     }
// );

app.listen(3000);
console.log("Express server listening on port %d in %s mode",
    app.address().port, app.settings.env);