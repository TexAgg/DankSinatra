var PythonShell = require('python-shell');
 
 var options = {
	mode: 'text',
  	script: 'mail.py',
  	pythonOptions: ['-u'],
  	args: ['1','2']
};
 
PythonShell.run('mail.py', options, function (err, results) {
	if (err) throw err;
	console.log('results: %j', results);
  	console.log('finished');
});

/*
var pyshell = new PythonShell('mail.py');

pyshell.on('message', function (message) {
  	// received a message sent from the Python script (a simple "print" statement) 
  	console.log(message);
});
*/