const http = require('http');

var temp = '';
var status = '';

//https://www.dropbox.com/home/Programming/Node/Hello?preview=main.js
// https://teamtreehouse.com/matthewgaikema.json
// http://www.wunderground.com/weather/api/d/docs?MR=1
/*
	Requests must be in the form 'http://api.wunderground/api/<your key>/conditions/q/<State initials>/<City>.json
*/
var request = http.get('http://api.wunderground.com/api/ecc2911f5f7c6247/conditions/q/TX/Houston.json',function(response){	
	//console.log(response.statusCode);
	
	var body = '';
	
	// Add json response to string
	response.on('data',function(chunk){
		body += chunk;
	});
	response.on('end',function(){
		
		// Parse data
		var weather = JSON.parse(body);
		temp = weather.current_observation.temp_f;
		status = weather.current_observation.weather;
		
		console.log(temp);
		console.log(status);
		
		//console.dir(weather.current_observation.temp_f);
		//console.dir(weather.current_observation.display_location.city);
	});
});

module.exports.CURRENT_TEMPERATURE = temp;
module.exports.WEATHER_STATUS = status;