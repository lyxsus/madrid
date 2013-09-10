// inject code
// javascript: (function () { function append (src) { var script = document.createElement ('script'); script.src = src; document.head.appendChild (script); } append ('http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.1/underscore-min.js'); append ('https://raw.github.com/jtobey/javascript-bignum/master/biginteger.js'); append ('http://localhost/parser/index.js'); void 0;}) ();

// 

(function (document) {
	function sum (arr) {
		return _.reduce (arr, function (a, b) {
			return a + b;
		});
	};

	// todo: debug for length = 1
	function variance (D) {
		// if (D.length == 1) {
		// 	return D [0];
		// }

		var l = D.length,
			mean = sum (D) / l;

		return sum (
			_.map (D, function (x) {
				return Math.pow (x - mean, 2)
			})
		) / (l - 1);
	}

	function Analyzer (document) {
		this.document = document;

		this.extractVisualSignals ();
	}

	Analyzer.prototype.extractVisualSignals = function () {
		var signals = {},
			index = 1;

		// collect signals
		function walk (root, rootPath) {
			for (var i = 0, node, tag, path; i < root.childNodes.length; i++) {
				node = root.childNodes.item (i);
				tag = node.tagName;

				if (tag) {
					path = rootPath + '/' + tag.toLowerCase ();

					if (!signals [path]) {
						signals [path] = {
							positions: [],
							nodes: []
						};
					}

					signals [path].positions.push (index++);
					signals [path].nodes.push (node);

					walk (node, path);
				}
			}
		}

		walk (document, '');

		// calculate vectors
		function vector (entries, size) {
			var result = [];

			for (var i = 0; i < size; i++) {
				result.push (
					(entries.indexOf (i + 1) !== -1) ? 1 : 0
				);
			}

			return result;
		}

		_.each (signals, function (signal) {
			signal.vector = vector (signal.positions, index);
		});
		
		this.signals = signals;
		this.positions = index;
	};

	Analyzer.prototype.similarity = function (Si, Sj) {
		var epsilon = 10,
			l = Si.length;

		if (l !== Sj.length) {
			throw new Error ('Different vectors size');
		}

		function omega (Si, Sj) {
			function A (S) {
				var r = 0;
				for (var i = 0; i < l; i++) {
					if (S [i]) {
						r += i + 1;
					}
				}
				return r;
			}

			return Math.abs (
				(A (Si) / sum (Si)) - (A (Sj) / sum (Sj))
			);
		}

		function segments (Si, Sj) {
			var segs = [],
				p = -1,
				rewind = true;

			for (var i = 0; i < Si.length; i++) {
				if (Si [i]) {
					if (rewind) {
						segs [++p] = 0;
						rewind = false;
					}

					segs [p] += 1;
				}

				if (Sj [i]) {
					rewind = true;
				}
			}

			return segs;
		}

		function yota (Si, Sj) {
			return Math.max (
				variance (segments (Si, Sj)),
				variance (segments (Sj, Si))
			);
		}

		return epsilon /
			(omega (Si, Sj) * yota (Si, Sj) + epsilon);
	};

	Analyzer.prototype.matrix = function () {
		var result = [],
			signals = this.signals,
			p,
			sigma = this.similarity;

		for (var i in signals) {
			p = [];
			result.push (p);
			for (var j in signals) {
				p.push (
					sigma (signals [i].vector, signals [j].vector) || 0
				);
			}
		}



		return result;
	};

	var analyzer = new Analyzer (document);
	
	var vectors = _.map (analyzer.signals, function (signal) {
		return signal.vector;
	});

	// [test & debug]
	function getCanvas (matrix, options) {
		var node = document.createElement ('canvas');
		node.width = matrix [0].length * options.pixelSize * 10;
		node.height = matrix.length * options.pixelSize * 10;

		document.body.appendChild (node);

		return node;
	}

	function grayscale (ratio) {
		var s = (Math.round ((ratio) * 0xFF)).toString (16).toUpperCase ();
		return '#' + s + s + s;
	}

	function draw (matrix, options) {
		var canvas = getCanvas (matrix, options),
			context = canvas.getContext ('2d');

		for (var i = 0; i < matrix.length; i++) {
			for (var j = 0; j < matrix [i].length; j++) {
				context.beginPath ();
				context.rect (j * options.pixelSize, i * options.pixelSize, options.pixelSize, options.pixelSize);
				context.fillStyle = grayscale (matrix [i] [j]);
				context.fill ();
			}
		}
	}

	_.each ($ ('canvas'), function (node) {
		node.parentNode.removeChild (node);
	});

	var matrix = [], c = 0;
	for (var i in analyzer.signals) {
		if (!matrix [c]) {
			matrix [c] = [];
		}

		for (var j in analyzer.signals [i].vector) {
			matrix [c] [j] = analyzer.signals [i].vector [j];
		}
		c++;
	}

	draw (matrix, {
		pixelSize: 1
	});


	draw (analyzer.matrix (), {
		pixelSize: 3
	});
}) (document);






