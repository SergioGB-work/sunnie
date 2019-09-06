require('dotenv').config();
const dialogflow = require('dialogflow');
const uuid = require('uuid');
const bodyParser = require('body-parser');

const projectId = 'botijo-ad784';
// A unique identifier for the given session
const sessionId = uuid.v4();

// Create a new session
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: './server/credentials.json'
});
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

/**
 * @module chatbot
 */
module.exports = (app) => {		
	app.post('/send-message', function (req, res) {
		var message = req.body.message;	
		var maxLength = 0;
		// The text query request.
		const request = {
			session: sessionPath,
			queryInput: {
				text: {
				// The query to send to the dialogflow agent
					text: message,
					// The language used by the client (en-US)
					languageCode: 'es-ES'
				}
			}
		};
		// Send request and log result

		console.log('/send-message Invocado');
		console.log(message);

		sessionClient.detectIntent(request).then(responses => {
			const result = responses[0].queryResult;
			return res.json(result);
		});
	});

}	