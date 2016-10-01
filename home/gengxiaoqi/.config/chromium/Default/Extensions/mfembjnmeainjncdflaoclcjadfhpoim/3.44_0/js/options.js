if (!localStorage.language) {
	var lang		=	navigator.language.toLowerCase(),
		langPart	=	lang.split('-'),
		language	=	$('[value=' + lang + '],[value=' + langPart[0] + '], [value=en]')[0].value;	
	
	var value = {
		language			:	language,
		font_size			:	11,
		dblclick_checkbox	:	true,
		dblclick_key		:	'',
		select_checkbox		:	false,
		select_key			:	''
	};
	
	for (var key in value) {
		localStorage[key] = value[key];
	}
	
	$(function() {
		$( '<p style="margin-top:.5em">The pop-up bubble will not work in tabs that were open prior to installation; such tabs must be refreshed. Also, note that all extensions are disabled on Chrome Web Store pages.</p>' ).dialog({
			buttons: {
				'Ok': function ()
				{
					$(this).dialog('close');
				}
			},
			modal: true,
			title: 'IMPORTANT'
		});
	});

}

var reset = $('[type=reset]').click(function (e)
{
	e.preventDefault();
	$('button').attr('disabled', true);
	
	for (var name in localStorage)
	{
		var elem = $('[name=' + name + ']'),
			val = localStorage[name];
		
		if (elem[0] && elem[0].type == 'checkbox')
		{
			val = val == 'true' ? true : false; 
			elem.attr('checked', val);
		}
		else
		{
			elem.val(val);
		}	
	}
}).click();

$('form').submit(function (e) {
	e.preventDefault();
	
	for (var name in localStorage) {
		var elem = $('[name=' + name + ']'),
			val = elem.val();
		
		if (elem[0] && elem[0].type == 'checkbox') {
			val = elem[0].checked ? true : false;

		}
		
		localStorage[name] = val;
		
	}
	
	$('#saved').css('visibility', '').stop(1).show().delay(2225).fadeOut('slow');
	
	reset.click();
	
	chrome.extension.sendMessage({
		method: 'update_app_detail',
	});
	
});

$('#select_checkbox, #dblclick_checkbox').change(function () {
	if (this.type == 'checkbox') {
		var keyGroup = $('.' + this.id);
		
		$('select', keyGroup).attr('disabled', true);
		keyGroup.addClass('disabled');
		
		if (this.checked) {
			keyGroup.removeClass('disabled');
			$('select', keyGroup).attr('disabled', false);
		}
		
	}
}).change();

$('input, select').change(function () {
	$('button').attr('disabled', false);	
});

var app = JSON.parse(localStorage['app']);
$('#option_version').text(app.version);