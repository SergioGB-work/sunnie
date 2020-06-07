function reloadDataList(){
	$('[data-noreload="true"][data-enable-get-params="true"]').each(function(e){//Iteramos por todos los elementos que tenga aplicados filtros de URL
		var paramsList = $(this).attr('data-get-params-list') || [];
		var rels = $(this).attr('data-rel') || '';
		var paramsModified = paramsChanged();

		if(paramsList === undefined || paramsList == ''){ //Si le aplican todos los parámetros de la URL
			//FALTA CONTROLAR EL rel

			if(rels != '' && compareParams(paramsList,paramsModified,rels)){//Comprueba si alguno de los parametros que ha cambiado lo usa el listado	
				dataList($(this));
				filterContentByRol();
			}
			else if(rels==''){
				dataList($(this));
				filterContentByRol();
			}
		}
		else{
			paramsList = paramsList.split(',');

			if(compareParams(paramsList,paramsModified,rels)){//Comprueba si alguno de los parametros que ha cambiado lo usa el listado	
				dataList($(this));
				filterContentByRol();
			}

		}

	});
}