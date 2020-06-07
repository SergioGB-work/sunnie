const fs = require('fs');
const functions = require('./functions.js');

/**
 * @module layout
 */
module.exports = (app) => {		

	/**
	* @function /layout/list
	* GET service to obtain the layouts list
	* @return {array} Array of layouts names availables ['layout1','layout2',...]
	*/
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

	/**
	* @function
	* GET service to obtain the layout detail.
	* @param {string} id - Name of the layout to get the detail
	* @return {json} JSON with the layout columns {"columns":['column1','column2',...]}
	*/
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