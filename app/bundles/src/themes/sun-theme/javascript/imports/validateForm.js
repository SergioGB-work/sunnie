function validateForm(el){

	if(el.find('textarea:required:invalid,input:required:invalid,select:required:invalid').length > 0){
		return false;
	}
	else{
		return true;
	}

}