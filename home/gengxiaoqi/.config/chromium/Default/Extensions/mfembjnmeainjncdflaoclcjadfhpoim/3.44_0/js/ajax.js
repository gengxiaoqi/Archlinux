(function () {
	var ajax = function (opt)
	{
		this.url = opt.url;
		this.complete = opt.complete;
		this.error = opt.error;
		this.success = opt.success;
	};
	
	ajax.prototype = {
		
		get: function (opt)
		{
			return $.ajax({
				url: opt.url || this.url,
				dataType: 'json',
				success: opt.success || this.success,
				error: opt.error || this.error,
				complete: opt.complete || this.complete
			});
		},
		
		post: function (opt)
		{
			return $.ajax({
				url: opt.url || this.url,
				dataType: 'json',
				method: 'post',
				success: opt.success || this.success,
				error: opt.error || this.error,
				complete: opt.complete || this.complete
			});
		}

	};

})();