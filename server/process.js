/**
 * @module process
 */

const functions = require('./functions.js');

let processListPending = [];
let processListDone = [];
let processListRunning = [];
let processRes = [];
let processRunning = false;

module.exports = (app) => {	

	app.get('/process/list', function (req, res) {
		res.send(processListRunning.concat(processListPending,processListDone));
	});

	app.get('/process/list/:status', function (req, res) {

		if(req.params.status == 'pending'){
			res.send(processListPending);
		}
		else if(req.params.status == 'done'){
			res.send(processListDone);
		}
	});	

	app.post('/process/add', function (req, res) {
		
		let msg= req.body.msg,
			code = req.body.code;

		if(!msg || msg==""){
			return res.status(400).send("msg in mandatory")
		}

		if(!code || code == ""){
			return res.status(400).send("code in mandatory")
		}

		var processDetail = {
			msg: msg,
			status:"pending",
			code:code,
			dateCreated: Date.now()
		}
		processListPending.push(processDetail);
		processRes.push(res);
		runProcess();

		return res.send("Proceso añadido a la cola de ejecución");
	});
}

function runProcess(){
	const { exec } = require('child_process');
	if(processListPending.length > 0 && !processRunning){
		
		let currentProcess = processListPending.shift(),
			code = currentProcess.code,
			res = processRes.shift();
		
		currentProcess.status = 'running';
		console.log('START COMPILE ' + code);	
		processRunning = true;
		processListRunning.push(currentProcess);

		exec( code + ' && gulp removeTMP', (err, stdout, stderr) => {
			
			let status = 'success';

			if (err) {
				// node couldn't execute the command
				console.log('DEPLOY ERROR:' + err);
				status = "error"
				res.send('ERROR');
			}

			// the *entire* stdout and stderr (buffered)
			console.log('DEPLOY FINISHED: ' + stdout + stderr);
			processListRunning.shift();
			processListDone.push({
				msg: currentProcess.msg,
				status:status,
				code:code,
				dateCreated: currentProcess.dateCreated,
				dateFinished: Date.now()
			});

			processRunning = false;

			if(processListPending.length > 0){
				runProcess();
			}

		});
	}
}

