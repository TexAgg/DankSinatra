/*
	parse.js
	Reads the incoming message and chooses the appropriate response
*/

const login = require("facebook-chat-api");
const cool = require('cool-ascii-faces');
const http = require('http');

// Make choices.greet case insensitive
var choices = {
	help: /\\help/,
	
	greet: /Dank/,
	
	weather: /\\weather/,
	date: /\\date/,
	
	insult: /\\insult/,
	
	cool: /\\face/
};

/*
	TODO: instead of sending message from here, 
	pass the response back to server.js
*/
function parse(api, message){
	var response = '';
	
	if (choices.help.test(message.body)){
		response = "Type '\\help' for a list of commands.\n";
		response += "\\weather: See the current weather in Houston.\n";
		response += "\\date: See the current date.\n";
		response += "\\face: Send a cool ascii face.";
		api.sendMessage(response, message.threadID);
		console.log("Sending " + response);
	}
	
	else if (choices.cool.test(message.body)){
		response = cool();
		console.log("Sending " + response);
		api.sendMessage(response, message.threadID);
	}
	
	else if (choices.weather.test(message.body)){
		http.get('http://api.wunderground.com/api/ecc2911f5f7c6247/conditions/q/TX/Houston.json',function(response){
			var body = '';
			var temp = {};
			var status = {};
			
			response.on('data', function(chunk){
				body += chunk;
			});
			
			response.on('end', function(){
				var weather_data = JSON.parse(body);
				temp = weather_data.current_observation.temp_f;
				status = weather_data.current_observation.weather;
				
				response += "The current temperature in Houston is " + temp + ".\n";
				response += "The weather is " + status + ".";
				
				console.log("Sending " + response);
				api.sendMessage(response, message.threadID);
			});
		});
	}
	
	else if (choices.date.test(message.body)){
		//var date = new Date();
		response = "The date is " + Date() + ".";
		console.log("Sending " + response);
		api.sendMessage(response, message.threadID);
	}
}

module.exports.parse = parse;