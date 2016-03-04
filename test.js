const readline = require('readline');

var help = /\\help/;
var weather = /\\weather/;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('What do you think of Node.js? ', (answer) => {
  // TODO: Log the answer in a database
  //console.log('Thank you for your valuable feedback:', answer);
  
	if(help.exec(answer))
  		console.log("Here are our commands:");
	else
		console.log('oh');	 
  
  rl.close();
});