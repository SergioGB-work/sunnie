var api = "http://localhost:3000";
var items_per_page_default = 10;
var defaultImg = './images/default-img.png';
var uploadFilesArray={};
var totalLoadedContents = 0;
var itemsUploaded = 0;
var baseSiteURL = window.location.href.split('${{ default.urlLang }}$/')[0];