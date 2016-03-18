/*
	parse.js
	Reads the incoming message and chooses the appropriate response
*/

const login = require("facebook-chat-api");
const cool = require('cool-ascii-faces');
const http = require('http');
const Firebase = require("firebase");
const cows = require('cows');
const url = require('url');
const Client = require('node-rest-client').Client;

var db = new Firebase(process.env.DANK_SINATRA_FIREBASE);
var message_reqs = db.child("Requests");
var usersDB = db.child("users");
var chatsDB = db.child("chats");

// All commands go here
var choices = {
	help: /\\help/,
	
	greet: /\\howdy/,
	magic8: /\\magic8/,
	
	weather: /\\weather/,
	date: /\\date/,
	
	insult: /\\insult/,
	
	cool: /\\face/, 
	cow: /\\cow/,
	senate: /\\senate/
};

/*	
	TODO: 
	1. Simulate conversation. Use IDs and DB
	2. Give a random greeting
	2. Magic 8 ball
*/
function parse(api, message){
	var response = '';
	
	// Add child for the threadID and append message there
	chatsDB.child(message.threadID).set(message);
	usersDB.child(message.senderID).set(message);
	
	if (choices.help.test(message.body)){
		response = "Type '\\help' for a list of commands.\n";
		response += "\\howdy: Send a greeting.\n";
		response += "\\weather (ZIP code): Send the current weather in the given ZIP code.\n";
		response += "\\date: Send the current date.\n";
		response += "\\face: Send a cool ascii face.\n";
		response += "\\cow: Send an ascii cow.\n";
		response += "\\senate: send a fact about the United States Senate."
		
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
	
	else if (choices.cow.test(message.body)){
		response = cows()[Math.floor(Math.random()*418)];
		message_reqs.push(message);
		console.log("Sending " + response);
		api.sendMessage(response, message.threadID);
	}
	
	else if (choices.insult.test(message.body)){
		response = "Fuck you " + message.senderName + "!";
		message_reqs.push(message);		
		console.log("Sending " + response);
		api.sendMessage(response, message.threadID);
	}
	
	else if (choices.senate.test(message.body)){

		var client = new Client();
		var nyt_url = url.format({
			protocol: 'http',
			host: 'api.nytimes.com',
			pathname: '/svc/politics/v3/us/legislative/congress/113/senate/members.json',
			query: {
				'api-key': process.env.NYT_CONGRESS
			}
		});
		client.get(nyt_url, function(data, response) {			
			// Sort by total votes
			data.results[0].members.sort(function(a, b){
				return a.total_votes - b.total_votes;		
			});
			//console.log(data.results[0].members[0]);
			response = "The senator with the fewest total votes cast is ";
			response += data.results[0].members[0].first_name + ' ' + data.results[0].members[0].last_name;
			response += " with " + data.results[0].members[0].total_votes + " total votes.";
			
			message_reqs.push(message);
			console.log("Sending " + response);
			api.sendMessage(response, message.threadID);			
			
		});
	}
	
	else if (choices.greet.test(message.body)){
		
		// Choose randomly from array of greetings
		
		response = "Howdy, " + message.senderName + "!";
		message_reqs.push(message);
		console.log("Sending " + response);
		api.sendMessage(response, message.threadID);
	}
}

module.exports.parse = parse;
