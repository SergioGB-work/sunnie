function compareParams(array1, array2, rels){

	var rels = rels != '' ? rels.split(',') : [''];

	if(array1.length >0){

		for(var i=0; i<rels.length;i++){

			var rel = rels[i] != '' ? '_' + rels[i] : '';

			for(var x=0; x<array1.length;x++){
				if(array2.includes(array1[x] + rel)){
					return true;
				}		
			}			
		}
	}
	else{
		for(var i=0; i<rels.length;i++){
			if(JSON.stringify(array2).includes(rels[i])){
				return true;
			}
		}
	}	

	return false;

}