window.addEvent('domready', function() {


    $$('[name=newsletter-email]')[0].addEvent('focus', function(){
		if (this.value.substr(0,5) == 'Email') {
			this.value = '';
		}
		$(this).setStyle('color', 'black');
    });

    $$('[name=newsletter-name]')[0].addEvent('focus', function(){
		if (this.value.substr(0,4) == 'Name') {
			this.value = '';
		}
		$(this).setStyle('color', 'black');
    });

    document.formvalidator.setHandler('newsletter-name',
        function (value) {
            regex=/^.+$/;
            return regex.test(value);
    });

    document.formvalidator.setHandler('newsletter-email',
        function (value) {
            regex = /^[A-Za-z0-9_\-\.]+\@[A-Za-z0-9_\-\.]+\.[A-Za-z]{2,4}$/;
            return regex.test(value);
    });

    modNewsletterSubmit = function(el) {

        var form = $(el.form);

        $$('[name=newsletter-email], [name=newsletter-name]').fireEvent('focus');

        if (document.formvalidator.isValid(form)) {

            var query = form.toQueryString();

            new Request({
                url: migurSiteRoot + 'index.php?option=com_newsletter&task=subscribe.subscribe',
                onComplete: function(res){
                    alert(res);
                }
            }).send(query);
        }
    }
});