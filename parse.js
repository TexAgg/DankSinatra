/*
	parse.js
	Reads the incoming message and chooses the appropriate response
*/

const login = require("facebook-chat-api");
const cool = require('cool-ascii-faces');
const http = require('http');
const Firebase = require("firebase");

var db = new Firebase(process.env.DANK_SINATRA_FIREBASE);
var message_reqs = db.child("Requests");
var usersDB = db.child("users");
var chatsDB = db.child("chats");

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
	TODO: Simulate conversation. Use IDs and DB
*/
function parse(api, message){
	var response = '';
	
	// Add child for the threadID and append message there
	chatsDB.child(message.threadID).set(message);
	usersDB.child(message.senderID).set(message);
	
	if (choices.help.test(message.body)){
		response = "Type '\\help' for a list of commands.\n";
		response += "\\weather (ZIP code): See the current weather in the given ZIP code.\n";
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
		
		var zip_code = message.body.replace(choices.weather,"");
		zip_code = zip_code.trim();
		console.log(zip_code);
		
		http.get('http://api.wunderground.com/api/'+process.env.WEATHER_API_KEY+'/conditions/q/' + zip_code + '.json',function(res){
			var body = '';
			var temp = '';
			var status = '';
			var city = '';
			
			res.on('data', function(chunk){
				body += chunk;
			});
			
			res.on('error', function(error){
				console.error(error.message);
				api.sendMessage("Invalid argument!",message.threadID);
			});			
			
			res.on('end', function(){
				var weather_data = JSON.parse(body);
				console.log(weather_data);
				
				if (!weather_data.response.error){
					temp = weather_data.current_observation.temp_f;
					status = weather_data.current_observation.weather;
					city = weather_data.current_observation.display_location.city;
					
					response += "The current temperature in " + city + " is " + temp + ".\n";
					response += "The weather is " + status + ".";
					
					message_reqs.push(message);		
					console.dir("Sending " + response);
					api.sendMessage(response, message.threadID);
				}
				else{
					response = JSON.stringify(weather_data.response.error);
					api.sendMessage(response,message.threadID);
				}
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
}

module.exports.parse = parse;