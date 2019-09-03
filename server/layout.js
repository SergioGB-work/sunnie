const fs = require('fs');
const functions = require('./functions.js');

module.exports = (app) => {		

	app.get('/layout/list', function (req, res) {
		try{
			var dirLayoutsBundles = fs.readdirSync('./app/bundles/src/layouts/');
			var dirLayoutsPlugins = fs.readdirSync('./app/plugins/layouts/');
			res.send(dirLayoutsBundles.concat(dirLayoutsPlugins));
		}
		catch(e){
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"LAYOUT_LIST_ERROR"
				}
			)
		};			
	});

	app.get('/layout/detail/:id', function (req, res) {
		try{
			var idLayout = req.params.id;
			var columns = functions.getLayoutColumns(idLayout);
			var responseParams = {"columns": columns};
			res.send(responseParams);
		}
		catch(e){
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"LAYOUT_DETAIL_ERROR"
				}
			)
		};			
	});

}