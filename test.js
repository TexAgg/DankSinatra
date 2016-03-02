const http = require('http');

//https://www.dropbox.com/home/Programming/Node/Hello?preview=main.js
// https://teamtreehouse.com/matthewgaikema.json
var request = http.get('http://api.wunderground.com/api/ecc2911f5f7c6247/conditions/q/CA/San_Francisco.json',function(response){
	console.log(response.statusCode);
	var body = '';
	response.on('data',function(chunk){
		//console.log("Getting data");
		body += chunk;
	});
	response.on('end',function(){
		//console.log("hi");
		var weather = JSON.parse(body);
		console.dir(weather.current_observation.temp_f);
	});
});

//console.log(process.env.EMAIL);