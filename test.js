const INFO = require('./info.js');

const FB = require('fb');
const http = require('http');

FB.setAccessToken(INFO.FB_ACCESS_TOKEN);

// GET

FB.api('4', function (res) {
  	if(!res || res.error) {
   		console.log(!res ? 'error occurred' : res.error);
  		return;
  	}
  	console.log(res.id);
  	console.log(res.name);
});


console.log('test');

// https://developers.facebook.com/tools/explorer/1132299496800613/?session_id=590519631101405
var options = {
	host: 'graph.facebook.com',
	method: 'GET',
	path: '/v2.5/404041393126881/feed'
};

var request = http.request(options, function(response){
	var str = '';
	console.log('lets do this');
	
	console.log(`STATUS: ${response.statusCode}`);
  	console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
  	response.setEncoding('utf8');

	response.on('data', function(chunk){
		str+=chunk;
		console.log('getting data');
	});
	response.on('end', function() {
		var prof = JSON.parse(str);
		console.dir(prof);
	})
});
request.on('error', function(){
	console.log('idk');
});

//console.dir(request);