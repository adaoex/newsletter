/**
 * The javascript file for subscriber view.
 *
 * @version	   $Id:  $
 * @copyright  Copyright (C) 2011 Migur Ltd. All rights reserved.
 * @license	   GNU General Public License version 2 or later; see LICENSE.txt
 */

window.addEvent('domready', function(){

	// Fix for IE8. Because IE triggers native submit when 
	// clicking on <button> that is placed INSIDE of a form.
	// So we need to prevent that default unwanted action.
	$$('form button').each(function(el){
		var onClick = el.getProperty('onclick');
		if (onClick) el.setProperty('onclick', 'event.returnValue = false; ' + onClick + '; return false;');
	})

	var isNew = $$('[name="subscriber_id"]')[0].getProperty('value')  == '';

	if (isNew) {
		$$('#toolbar-cancel button')[0]
			.removeProperty('onclick')
			.addEvent('click', function(ev){
				ev.stop();
				Migur.closeModal();
			})
			
	} else {


		if ( $('history-list') ) {
			Migur.lists.sortable.setup($('history-list'));
			historyPaginator = new Migur.lists.paginator($('history-list'));
		}

		Migur.lists.sortable.setup($('table-subs'));
	}
	
});
