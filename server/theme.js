const functions = require('./functions.js');

module.exports = (app) => {	

	app.get('/theme/list', function (req, res) {
		try{
			var dirThemesBundles = functions.getDirectories(pathBundles + '/themes/');
			var dirThemesPlugins = functions.getDirectories(pathPlugins + '/themes/');
			res.send(dirThemesBundles.concat(dirThemesPlugins));
		}
		catch(e){
			console.log(e);
			res.status(412).send(
				{
					"code":"412",
					"statusCode":"THEME_LIST_ERROR"
				}
			)
		};			
	});
}	

