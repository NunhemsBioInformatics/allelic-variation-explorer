var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/seqdb');

var Schema = mongoose.Schema;

var FeatureSchema = new Schema({
	seqid: String,
	source: String,
	type: {type: String},
	start: {},
	end: {},
	score: String,
	strand: {type: String},
	phase: {type: String},
	attributes: {}
}).index({start: '2d'})
	.index({end: '2d'});

mongoose.model('Feature', FeatureSchema);


var GeneModelSchema = new Schema({
	mRNA: {},
	protein: [FeatureSchema],
	fivePrimeUTRs: [FeatureSchema],
	CDSs: [FeatureSchema],
	exons: [FeatureSchema],
	threePrimeUTRs: [FeatureSchema],
	introns: {}
});

mongoose.model('GeneModel', GeneModelSchema);

var LocusSchema = new Schema({
	start: {},
	end: {},
	gene: {},
	geneModels: [GeneModelSchema]
}).index({start: '2d'})
	.index({end: '2d'});

mongoose.model('Locus', LocusSchema);

var Feature = mongoose.model('Feature');
var GeneModel = mongoose.model('GeneModel');
var Locus = mongoose.model('Locus');

exports.Feature = Feature;
exports.GeneModel = GeneModel;
exports.Locus = Locus;