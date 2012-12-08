/**
 * The javascript file for templates view.
 *
 * @version	   $Id:  $
 * @copyright  Copyright (C) 2011 Migur Ltd. All rights reserved.
 * @license	   GNU General Public License version 2 or later; see LICENSE.txt
 */

window.addEvent('domready', 

	function() {
	
		var edit  = $$('#templates-edit > button');
		var trash = $$('#templates-trash > button');
		var glasses = $$('.templateslist .search')
		var checkboxes = $$('.templateslist [type=checkbox]');
		
		var buttons = [edit, trash];

		// Manipulates with access to a buttons depending on checkboxes
		var updateBtnState = function() {
			
			checkboxes.some(function(el){ return el.get('checked') })? 

				buttons.each(function(el){
					 el.removeClass('disabled');
				 }) :

				 buttons.each(function(el){
					 el.addClass('disabled');
				});
		}
		
		checkboxes.addEvent('click', updateBtnState);
		buttons.each(function(el) { el.removeProperty('onclick'); });
		updateBtnState();

		/* Expand the functionality of the delete button */
		trash.addEvent('click', function() {
			if (
				$(this).hasClass('disabled') == false && 
				confirm('One or more newsletters may use this template(s). Do you want to delete?') 
			) {
				Joomla.submitform('templates.delete', $$('[name=templatesForm]')[0]);
			};
			
			return false;
		});



		/* Expand the functionality of the edit button */
		edit.addEvent('click', function(ev){

			ev.stop();

			checkboxes.each(function(el){
				if(el.getProperty('checked')) {
					el.getParent('tr').getElements('.modal').fireEvent('click');
				}
			});
		});


		// Add AJAX preview functionality to glasses
		glasses.addEvent('click', function(){

			var id = $(this).getParent('tr').getElements('[name=cid[]]')[0].get('value');

			new Request.JSON({
				url: '?option=com_newsletter&task=template.getparsed&shownames=1',
				data: {
					t_style_id: id,
					tagsRenderMode: 'schematic',
					type: 'html' },

				onComplete: function(res){

					$('preview-container').set('html', res.data.content);
					$('tpl-title').set('text', res.data.information.name);
					$('tpl-name').set('text', res.data.information.author);
					$('tpl-email').set('text', res.data.information.authorEmail);
				}
			}).send();

			return false;
		});


		glasses[0].fireEvent('click');

	}
);
