const login = require("facebook-chat-api");

// Parse messages

// Maybe use google translate API or weather
// Maybe connect 4

function parse(api, message){
	var response = '';
	
	if (message.body == "\\help"){
		response = "Ok!";
		console.log("Sending");
		api.sendMessage(response, message.threadID);
	}
}

module.exports.parse = parse;