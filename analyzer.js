var summary = require ('summary'),
	clusterfck = require ('clusterfck'),
	_ = require ('lodash');


function sum (arr) {
	return _.reduce (arr, function (a, b) {
		return a + b;
	});
};

function variance (data) {
	return summary (data).variance () || Infinity;
}

function extractVisualSignals (document) {
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
				signals [path].path = path;

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
	
	return signals;
}


function distance (Si, Sj) {
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
			} else if (Sj [i]) {
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
}

module.exports = function (document) {
	var signals = extractVisualSignals (document),
		data = _.map (signals, function (signal) {
			return signal.vector;
		}),
		clusters = clusterfck.hcluster (data, distance, 'complete');


	function id (vector) {
		for (var i in signals) {
			if (vector == signals [i].vector) {
				return signals [i].path;
			}
		}
	}

	function print (memo, leaf) {
		console.log (
			memo, leaf.size, id (leaf.value)
		);
	}

	function walk (clusters) {
		if (clusters.right && clusters.right.value) {
			print ('r', clusters.right);
		} else {
			walk (clusters.right)
		}

		if (clusters.left && clusters.left.value) {
			print ('l', clusters.left);
		} else {
			walk (clusters.left)
		}

		// console.log (clusters)
	}

	walk (clusters);
};














