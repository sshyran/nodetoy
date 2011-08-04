var path = require('path');
var fs = require('fs');

var defaults = require('./default');
var resolve = require('../persistence/file-resolve');
var ssiParser = require('../ssi/ssi-parser');
var ssi = require('../ssi/ssi-handler');
/**
 * Stream a named file to the response.
 */
function doGet(request, response, url) {

	resolve.resolveApp(url.pathname, true, function(fileSystemPath) {

		// open the file
		var instream = fs.createReadStream(fileSystemPath , { flags: 'r' });
		
		instream.on('error', function() {
			// TODO this is not correct FNF should be detected some other way
			defaults.fileNotFound(response);
		});
		
		// set default HTTP headers
		response.statusCode = 200;
		var mime = defaults.mimeMagic(response, url.pathname);
		response.setHeader("Content-Type", mime);
		defaults.addNoCacheHeaders(response);
		
		// If it is HTML parse SSI 
		if (mime == "text/html") {
			
			response.setHeader("Content-Type", "text/html;charset=utf-8");
			
			// set up SSI
			var handler = new ssi.SsiHandler();
			var parser = new ssiParser.Parser("Http Server" , instream, response, handler);
		
			// exec
			parser.exec(function(message) {
				response.end();
			});
		}
		// otherwise stream the response as is.
		else {
			instream.pipe(response);
		}
		
	});
	
};


exports.doGet = doGet;