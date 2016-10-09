function getAPIDataDomain(domain, params, timeout, successCallback, errorCallback) {
   getAPIDataURL(api + domain + "/all", params, timeout, successCallback, errorCallback);
}

 function getAPIDataURL(url, params, timeout, successCallback, errorCallback) {
    $.ajax({
        url: url,
	
        data: params || null,
        dataType: "json",
	type: "post",
        timeout: timeout,
        success: successCallback,
        error: errorCallback
    });
}