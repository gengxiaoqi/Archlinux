(function () {
	
	var reference = function (opt)
	{
		this.url = opt.url;
		this.complete = opt.complete;
		this.error = opt.error;
		this.success = opt.success;
	};

	
	reference.prototype = {
		all: function ()
		{
			
		},
	
		antonyms: function ()
		{
			
		},
		
		definitions: function (opt)
		{
			return $.ajax({
				url: opt.url || this.url,
				dataType: 'json',
				success: opt.success || this.success,
				error: opt.error || this.error,
				complete: opt.complete || this.complete
			});
		},
		
		dictionary: function ()
		{
			
		},
		
		encyclopedia: function ()
		{
			
		},
		
		synonyms: function ()
		{
			
		}

	};

})();