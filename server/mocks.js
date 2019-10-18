module.exports = (app) => {

	app.post('/ok', function (req, res) {

		res.status(200).send();

	});

	app.get('/coches/lista', function (req, res) {
		res.status(200).send(
			[
				{
					"id":"0",
					"name":"Selecciona la marca de tu coche"
				},			
				{
					"id":"1",
					"name":"Renault"
				},
				{
					"id":"2",
					"name":"Peugeot"
				},
				{
					"id":"3",
					"name":"Ford"
				},
				{
					"id":"4",
					"name":"Mercedes"
				}
			]
		);	
	});

	app.get('/coches/modelos', function (req, res) {
		res.status(200).send(
			[
				{
					"id":"",
					"name":"Selecciona el modelo de tu coche"
				},			
				{
					"id":"1",
					"name":"Clio"
				},
				{
					"id":"2",
					"name":"Megane"
				},
				{
					"id":"3",
					"name":"Talisman"
				},
				{
					"id":"4",
					"name":"Captur"
				}
			]
		);	
	});


	app.post('/coches/modelos', function (req, res) {

		var idMarca = req.body.marca;

		console.log(req.body);
		console.log(idMarca);

		switch(idMarca){
			case '0':
				res.status(200).send(
					[
					]
				);			
				break;			
			case '1':
				res.status(200).send(
					[
						{
							"id":"1",
							"name":"Clio"
						},
						{
							"id":"2",
							"name":"Scenic"
						},
						{
							"id":"3",
							"name":"Talisman"
						},
						{
							"id":"4",
							"name":"Megane"
						}

					]
				);

				break;
			case '2':
				res.status(200).send(
					[
						{
							"id":"1",
							"name":"208"
						},
						{
							"id":"2",
							"name":"308"
						},
						{
							"id":"3",
							"name":"3008"
						},
						{
							"id":"3",
							"name":"5008"
						}

					]
				);			
				break;
			case '3':
				res.status(200).send(
					[
						{
							"id":"1",
							"name":"Fiesta"
						},
						{
							"id":"2",
							"name":"Focus"
						},
						{
							"id":"3",
							"name":"Mondeo"
						},
						{
							"id":"3",
							"name":"Kuga"
						}

					]
				);			
				break;
			case '4':
				res.status(200).send(
					[
						{
							"id":"1",
							"name":"A 180d"
						},
						{
							"id":"2",
							"name":"C 220"
						},
						{
							"id":"3",
							"name":"E 350d"
						},
						{
							"id":"3",
							"name":"55S AMG"
						}
					]
				);			
				break;

			default:
				res.status(200).send();
		}	
	});
}