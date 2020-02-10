function dataUploadFilePreview(el){

	var idInput = el.attr('id') || '',
		nameInput = el.attr('name') || '',
		uploadFilePreviewContainer = el.data('upload-file-preview-container') || '',
		uploadFilePreviewTemplate = el.data('upload-file-preview-template') || '#uploadItemTemplate';

    $('#' + idInput).change(function () {
        var input = $(this).get(0);
        uploadFilePreview(input.files,uploadFilePreviewContainer, nameInput);
    });


    if(uploadFilePreviewContainer != '' && uploadFilePreviewContainer !== undefined){
		$(uploadFilePreviewContainer).on('click', '.deleteFile', function () {
			var index = $(this).closest('.file').data('index');
			$(this).closest('.file').remove();
			uploadFilesArray[nameInput].splice(index, 1);

			//Renovamos los indices de los ficheros que están en preview
			$(uploadFilePreviewContainer).find('.file').each(function(index){
				$(this).data("index",index);
				$(this).attr("data-index",index);
			});
		});
    }   

}

function uploadFilePreview(files,previewContainer,nameInput){
	$.each(files, function (index) {
        var filename = files[index].name.split('.')[0],
            extension = files[index].name.split('.')[1],
            type = '';

    	var preview = window.URL.createObjectURL(files[index]);             

        $(previewContainer).find(".file").each(function () {
            var filename = $(this).data('filename');

            if (files[index].name == filename) {
                var i = $(this).data('index');
                uploadFilesArray[nameInput].splice(i, 1);
                $(this).remove();
            }
        });
        
        if(uploadFilesArray[nameInput] === undefined){
        	uploadFilesArray[nameInput] = []
        }

        uploadFilesArray[nameInput].push(files[index]);

        switch (files[index].type.split('/')[0]) {

            case 'audio':
                type = 'music';
                break;

            case 'video':
                type = 'video';
                break;

            case 'image':
                type = 'image';
                break;
        }
        var data = { "data": { "filename": filename, "extension": extension, "type": type, "index": index, "preview":preview } };
        var tmpl = $.templates(uploadItemTemplate);
		var html = tmpl.render(data);
		$(previewContainer).append(html);
    });	
}

function uploadFileCallback(data){
	$('#modal-multimedia-uploadingFiles .progressBarButton:not(.loadingButton)').addClass('d-none');
	$('#modal-multimedia-uploadingFiles .progressBarButton.loadingButton').removeClass('d-none');

	var nItems = parseInt($('.progressBar-block .current:eq(0)').text());
    if (nItems < parseInt($('.progressBar-block .total:eq(0)').text())) {
        $('.progressBar-block .current').text(nItems + 1);
        $('.progressBar-block .percentage').text(parseFloat(parseInt($('.progressBar-block .current:eq(0)').text()) * 100 / parseInt($('.progressBar-block .total:eq(0)').text())).toFixed() + '%');
        $('.progressBar-block .progress-bar').css('width', (parseInt($('.progressBar-block .current:eq(0)').text()) * 100 / parseInt($('.progressBar-block .total:eq(0)').text())) + '%');
        
        var filename = data.filename || "Unknown filename";
        var classes = "alert-success";
        var message = data.filename + " se ha subido correctamente";
        var messsage_detail = '';

        if (data.error) {
            switch (data.error.code) {
                case 'FILE_FORMAT_ERROR"':
                    messsage_detail = 'El formato del fichero no es válido.'
                    break;

                case 'FILE_EXIST_ERROR':
                    messsage_detail = 'El fichero ya existe. SI deseas volver a subirlo, elimina el anterior y vuelve a subirlo.'
                    break;    

                default:
                    messsage_detail = "Ha ocurrido un error al intentar subir el fichero";
                    break;
            }

            classes = "alert-danger";
            message = "Error al subir el fichero " + filename + "." + messsage_detail;
        }
		var tmpl = $.templates('#alertTemplate');
		var html = tmpl.render({ data: { 'message': message, 'class': classes } });
		$('#modal-multimedia-uploadingFiles .alerts-block').append(html);
    }

    totalLoadedContents++;

    if (totalLoadedContents == itemsUploaded) {
        itemsUploaded = 0;
        totalLoadedContents = 0;
        uploadError = false;

		$('#modal-multimedia-add form')[0].reset();
		$('#modal-multimedia-uploadingFiles .progressBarButton:not(.loadingButton)').removeClass('d-none');
		$('#modal-multimedia-uploadingFiles .progressBarButton.loadingButton').addClass('d-none');

    }
}