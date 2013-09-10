// inject code
// javascript: (function () { function append (src) { var script = document.createElement ('script'); script.src = src; document.head.appendChild (script); } append ('http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.1/underscore-min.js'); append ('http://localhost/parser/index.js'); void 0;}) ();

// 

(function (document) {
	_.sum = function (arr) {
		return _.reduce (arr, function (a, b) {
			return a + b;
		});
	};

	function Analyzer (document) {
		this.document = document;

		this.signals = this.extractVisualSignals ();
		this.vectors = this.extractVisualVectors (this.signals);
	}

	Analyzer.prototype.extractVisualSignals = function () {
		var signals = {},
			index = 1;

		function walk (root, rootPath) {
			for (var i = 0, node, tag, path; i < root.childNodes.length; i++) {
				node = root.childNodes.item (i);
				tag = node.tagName;

				if (tag) {
					path = rootPath + '/' + tag.toLowerCase ();

					if (!signals [path]) {
						signals [path] = [index++];
					} else {
						signals [path].push (index++);
					}

					walk (node, path);
				}
			}
		}

		walk (document.body, 'html/body');
		this.vectorSize = index;

		return signals;
	};

	Analyzer.prototype.extractVisualVectors = function (signals) {
		var vectorSize = this.vectorSize,
			vectors = {};

		function vector (entries, size) {
			var result = [];

			for (var i = 0; i < size; i++) {
				result.push (
					(entries.indexOf (i + 1) !== -1) ? 1 : 0
				);
			}

			return result;
		}

		_.each (signals, function (entries, index) {
			vectors [index] = vector (entries, vectorSize);
		});

		return vectors;
	};

	Analyzer.prototype.vetorsSimilarity = function (Si, Sj) {
		var l = _.size (Si);

		if (_.size (Sj) != l) {
			throw new Error ('Different vectors size');
		}

		// function U (S) {
		// 	var result = 0;

		// 	for (var i = 0; i < l; i++) {
		// 		if (S [i]) {
		// 			result += Math.pow (S [i], i + 1);
		// 		}
		// 	}

		// 	return result;
		// }

		function T (S) {
			console.log (l)
			return Math.pow (_.sum (S), l) / _.sum (S);
		}

		return Math.abs (
			T (Si) - T (Sj)
		);
	};

	var analyzer = new Analyzer (document);
	
	function printVectors (vectors) {
		return _.map (vectors, function (vector) {
			return vector.join ('');
		}).join ('\n');
	}


	// _.each (analyzer.vectors, function (vector, index) {
	// 	if (_.sum (vector) == 0) {
	// 		console.log (analyzer.signals [index]);
	// 	}
 // 	})

	// console.log (analyzer.signals);
	// console.log (printVectors (analyzer.vectors));

	var vectors = _.values (analyzer.vectors),
		v1 = vectors [22],
		v2 = vectors [100],
		x = analyzer.vetorsSimilarity (v1, v2);

	console.log ('similarity', x, 'of vectors', v1, v2);

}) (document);

