/*
	parse.js
	Reads the incoming message and chooses the appropriate response
*/

const login = require("facebook-chat-api");
const cool = require('cool-ascii-faces');
const http = require('http');
const Firebase = require("firebase");

var message_reqs = new Firebase(process.env.DANK_SINATRA_FIREBASE + '//Requests');

// Requests
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
	
	TODO: Simulate conversation. Use IDs and DB
	
	TODO: Refactor message matching. 
	If the sender sends a request, add the message to the
	database in an user-specific path. 
*/
function parse(api, message){
	var response = '';
	
	if (choices.help.test(message.body)){
		response = "Type '\\help' for a list of commands.\n";
		response += "\\weather: See the current weather in Houston.\n";
		response += "\\date: See the current date.\n";
		response += "\\face: Send a cool ascii face.";
		
		message_reqs.push(message);
		console.log("Sending " + response);		
		api.sendMessage(response, message.threadID);
	}
	
	else if (choices.cool.test(message.body)){
		response = cool();
		
		message_reqs.push(message);
		console.log("Sending " + response);
		api.sendMessage(response, message.threadID);
	}
	
	else if (choices.weather.test(message.body)){
		http.get('http://api.wunderground.com/api/'+process.env.WEATHER_API_KEY+'/conditions/q/TX/Houston.json',function(res){
			var body = '';
			var temp = '';
			var status = '';
			
			res.on('data', function(chunk){
				body += chunk;
			});
			
			res.on('end', function(){
				var weather_data = JSON.parse(body);
				temp = weather_data.current_observation.temp_f;
				status = weather_data.current_observation.weather;
				
				response += "The current temperature in Houston is " + temp + ".\n";
				response += "The weather is " + status + ".";
				
				message_reqs.push(message);		
				console.dir("Sending " + response);
				api.sendMessage(response, message.threadID);
			});
		});
	}
	
	else if (choices.date.test(message.body)){
		//var date = new Date();
		response = "The date is " + Date() + ".";
		message_reqs.push(message);		
		console.log("Sending " + response);
		api.sendMessage(response, message.threadID);
	}
	
	// return response;
}

module.exports.parse = parse;