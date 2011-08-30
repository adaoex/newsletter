/**
 * The javascript file for list view.
 *
 * @version	   $Id:  $
 * @copyright  Copyright (C) 2011 Migur Ltd. All rights reserved.
 * @license	   GNU General Public License version 2 or later; see LICENSE.txt
 */

//TODO: Tottaly refacktoring. Create and use widgets!

Migur.dnd.makeDND = function(el, droppables){

        var avatar = el;
        avatar.makeDraggable({

            droppables: droppables,

            onBeforeStart: function(draggable, droppable){
                var coords = draggable.getCoordinates($$('body')[0]);
                $(draggable).store('source', draggable.getParent());
                $$('body').grab(draggable);
                draggable.setStyles({
                    left: coords.left + 'px',
                    top:  coords.top  + 'px',
                    position: 'absolute',
                    zIndex: 1000
                });
            },

            onEnter: function(draggable, droppable){
                var maxElsCount = droppable.retrieve('maxElsCount');
                var elsCount = $(droppable).getChildren('.drag').length;

                if (maxElsCount == null || elsCount < maxElsCount) {
                    droppable.addClass('overdropp');
                }
            },

            onLeave: function(draggable, droppable){
                droppable.removeClass('overdropp');
            },

            onDrop: function(draggable, droppable){

                var maxElsCount = (droppable)? parseInt(droppable.retrieve('maxElsCount')) : null;
                var elsCount = (droppable)? $(droppable).getChildren('.drag').length : null;
                var source = $(draggable).retrieve('source');

                if (!droppable || (maxElsCount != null && elsCount >= maxElsCount) || source == droppable) {
                    // out of dropable
                    source.grab(draggable);
                    draggable.setStyles({
                        left: 0,
                        top:  0,
                        position: 'relative',
                        zIndex: 1000
                    });

                } else {

                    // hit in dropable
                    droppable.grab(draggable);
                    draggable.setStyles({
                        left: 0,
                        top:  0,
                        position: 'relative',
                        zIndex: 'auto'
                    });
                }
            },
            
            onCancel: function() {
                this.droppables.removeClass('overdropp');
            },
            
            onComplete: function() {
                this.droppables.removeClass('overdropp');
            }
        });
        
        return avatar;
    }

window.addEvent('domready', function() {
try {

  if ( typeof(Uploader) == 'undefined' ) Uploader = {};

    Uploader.getHead = function(target, type) {
        var settings = Uploader.getSettings(type) || {};
        Uploader.uploadControl = target;
        var id = $$('[name=list_id]')[0].get('value');
        new Request.JSON({
            url: '?option=com_newsletter&task=list.gethead&format=json',
            onComplete: Uploader.headParser
        }).send( '&list_id=' + id + '&jsondata=' + JSON.encode(settings) );
    }


    Uploader.headParser = function(req) {

        if (typeof (req.fields) == 'undefined' || req.fields.length == 0) {
            alert('No fields founded!');
            return;
        }

        if (typeof (req) == 'undefined') {
            alert('An unknown error occured!');
            return;
        }

        var ctr = $(Uploader.uploadControl);

        if (ctr.getProperty('id') == 'import-file') {

            $('import-file').removeClass('hide');
            $$('#import-file .drag').destroy();

            for(var i=0; i < req.fields.length; i++) {
                var newEl = new Element(
                        'div',
                        {
                            'html'    : req.fields[i],
                            'class'   : 'drag',
                            'position': 'relative',
                            'rel'     : i
                        }
                    )

                $('import-founded-fields').grab(newEl);
                Migur.dnd.makeDND(newEl, $$('#import-file .drop'));
                newEl.setStyle('position', 'relative');
            }

        } else {

            $('exclude-file').removeClass('hide');
            ctr.getElements('.drag').destroy();

            for(var i=0; i < req.fields.length; i++) {
                var newEl = new Element(
                        'div',
                        {
                            'html'    : req.fields[i],
                            'class'   : 'drag',
                            'position': 'relative',
                            'rel'     : i
                        }
                    )

                $('exclude-founded-fields').grab(newEl);
                Migur.dnd.makeDND(newEl, $$('#exclude-file .drop'));
                newEl.setStyle('position', 'relative');
            }
        }
    }


    Uploader.getSettings = function(type) {

        var res = {
            fields: {},
            delimiter: null,
            enclosure: null
        };

        if (type == 'import') {
            if ( !$('import-delimiter').hasClass('hide') ) {
                res.delimiter = $('import-delimiter').get('value');
            } else {
                res.delimiter = $('import-delimiter-custom').get('value');
            }

            if ( !$('import-enclosure').hasClass('hide') ) {
                res.enclosure = $('import-enclosure').get('value');
            } else {
                res.enclosure = $('import-enclosure-custom').get('value');
            }

            res.overwrite = $('import-overwrite').getProperty('checked');
        }

        if (type == 'exclude') {

            if ( !$('exclude-delimiter').hasClass('hide') ) {
                res.delimiter = $('exclude-delimiter').get('value');
            } else {
                res.delimiter = $('exclude-delimiter-custom').get('value');
            }

            if ( !$('exclude-enclosure').hasClass('hide') ) {
                res.enclosure = $('exclude-enclosure').get('value');
            } else {
                res.enclosure = $('exclude-enclosure-custom').get('value');
            }
        }

        if (!res.delimiter) {
            alert('The delimiter is not set');
            return false;
        }

        return res;
    }


    /**
     * Create wigets for each template control
     **/
    $('unsubscribed_filter_search').addEvent('keyup', function() {

        var filter = $('unsubscribed_filter_search').get('value');
        var count = 0;
        $$('#tab-container-unsubscribed tbody tr').each(function(tr){
            var matchedRow = true;
            if (filter != '') {
                matchedRow = tr.getChildren('td').some(function(td, idx){
                    if (idx > 2) return false;
                    var cell = $(td).get('text').trim();
                    return (cell.indexOf(filter) != -1);
                });
            }
            
            if(matchedRow) {
                $(tr).removeClass('row0');
                $(tr).removeClass('row1');
                $(tr).addClass('row' + (count%2));
                $(tr).removeClass('invisible');
            } else {
                $(tr).addClass('invisible');
            }

            count++;
        });
        
    });

    $('unsubscribed_filter_search').fireEvent('keyup');


    Migur.lists.sortable.setup($('table-subs'));
    Migur.lists.sortable.setup($('table-unsubscribed'));
    Migur.lists.sortable.setup($('table-exclude'));


    $('jform_description').addEvent('keydown', function(){
        if ( $(this).get('value').length > 255) {
            $(this).set('value', $(this).get('value').substr(0,255));
        }


    });


    $('exclude-tab-button').addEvent('click', function(){

        var data = [];
        $$('#exclude-tab-scroller [name=cid[]]').each(function(el){
            if (el.get('checked')) {
                data.push(el.get('value'));
            }
        });

        data = {'lists': data};
        var id = $$('[name=list_id]').get('value');
        new Request.JSON({
            url: '?option=com_newsletter&task=list.exclude&subtask=lists&format=json',
            onComplete: function(res){
                if (!res) {
                    alert('An unknown error occured');
                    return;
                }

                alert(res.error + "\n\nTotal processed: " + res.total);
            }
        }).send('&list_id=' + id + '&jsondata='+JSON.encode(data));
    });


    $('import-upload-submit').addEvent('click', function(){
        if ($('import-upload-file').get('value')) {
            $$('[name=task]')[0].set('value', 'list.upload');
            $$('[name=subtask]')[0].set('value', 'import');
            //$('listForm').submit();
        } else {
            return false;
        }
    });



    $('exclude-upload-submit').addEvent('click', function(){
        if ($('exclude-upload-file').get('value')) {
            $$('[name=task]')[0].set('value', 'list.upload');
            $$('[name=subtask]')[0].set('value', 'exclude');
            //$('listForm').submit();
        } else {
            return false;
        }
    });


    $('import-file-refresh').addEvent('click', function(){
        Uploader.getHead( $('import-file'), 'import' );
    });

    $('exclude-file-refresh').addEvent('click', function(){
        Uploader.getHead( $('exclude-file'), 'exclude' );
    });


    $('import-file-apply').addEvent('click', function(){

        var res = Uploader.getSettings('import');

        var notEnough = false;

        $$('#import-fields .drop').each(function(el){

            var field = el.getProperty('rel');
            var drag = el.getChildren('.drag')[0];
            var def = null;
            var mapped = null;

            if (field == 'html') {
                def = $('import-file-html-default').get('value');
            }

            if (!drag) {
                if (field != 'html') {
                    notEnough = true;
                }
            } else {
               mapped = drag.getProperty('rel');
            }

            res.fields[field] = {
                'mapped' : mapped,
                'default': def
            };

        });

        if (notEnough == true) {
            alert('Please fill all required fields');
        } else {
            $$('[name=subtask]').set('value', 'import-file-apply');
            var id = $$('[name=list_id]').get('value');

            //$$('#import-del-cont .active')

            new Request.JSON({
                url: '?option=com_newsletter&task=list.import&subtask=parse&format=json',
                onComplete: function(res){
                    if (!res) {
                        alert('An unknown error occured');
                        return;
                    }

                    alert(res.error + "\n\nProcessed: " + res.processed + "\nAbsent: " + res.absent + "\nSkipped: " + res.skipped + "\nTotal: " + res.total);
                    document.location.reload();
                }
            }).send( '&list_id=' + id + '&jsondata=' + JSON.encode(res) );
        }
    });


    $('exclude-file-apply').addEvent('click', function(){

        var res = Uploader.getSettings('exclude');

        var notEnough = false;

        $$('#exclude-fields .drop').each(function(el){

            var field = el.getProperty('rel');
            var drag = el.getChildren('.drag')[0];
            var def = null;
            var mapped = null;

            if (field == 'html') {
                def = $('exclude-file-html-default').get('value');
            }

            if (!drag) {
                if (field != 'html') {
                    notEnough = true;
                }
            } else {
               mapped = drag.getProperty('rel');
            }

            res.fields[field] = {
                'mapped' : mapped,
                'default': def
            };

        });

        if (notEnough == true) {
            alert('Please fill all required fields');
        } else {
            $$('[name=subtask]').set('value', 'exclude-file-apply');
            var id = $$('[name=list_id]').get('value');

            //$$('#exclude-del-cont .active')

            new Request.JSON({
                url: '?option=com_newsletter&task=list.exclude&subtask=parse&format=json',
                onComplete: function(res){
                    if (!res) {
                        alert('An unknown error occured');
                        return;
                    }

                    alert(res.error + "\n\nProcessed: " + res.processed + "\nAbsent: " + res.absent + "\nTotal: " + res.total);
                    document.location.reload();
                }
            }).send( '&list_id=' + id + '&jsondata=' + JSON.encode(res) );
        }
    });


    if ( ! $$('[name=list_id]')[0].get('value') ) {
        $$('#import-toolbar span').addClass('toolbar-inactive');
        $$('#exclude-toolbar span').addClass('toolbar-inactive');

    } else {
    
        $('import-toolbar-export').addEvent('click', function(){
            $('import-file').toggleClass('hide');

        });

        $('exclude-toolbar-lists').addEvent('click', function(){
            $('exclude-lists').toggleClass('hide');
            $('exclude-file').addClass('hide');
        });

        $('exclude-toolbar-file').addEvent('click', function(){
            $('exclude-file').toggleClass('hide');
            $('exclude-lists').addClass('hide');
        });
    }

    $$('.tab-import a').addEvent('click', function(){
        $('import-uploadform').grab('flash-form');
    });

    $$('.tab-exclude a').addEvent('click', function(){
        $('exclude-uploadform').grab('flash-form');
    });

    $$('#import-fields .drop, #export-fields .drop').each(function(el){
        el.store('maxElsCount', 1);
    });


    $('import-del-toggle-button').addEvent('click', function(){
        $('import-delimiter').toggleClass('hide');
        $('import-delimiter-custom').toggleClass('hide');
        var rel = $(this).getProperty('rel');
        var val = $(this).get('value');
        $(this).setProperty('rel',   val);
        $(this).setProperty('value', rel);
    });

    $('import-enc-toggle-button').addEvent('click', function(){
        $('import-enclosure').toggleClass('hide');
        $('import-enclosure-custom').toggleClass('hide');
        var rel = $(this).getProperty('rel');
        var val = $(this).get('value');
        $(this).setProperty('rel',   val);
        $(this).setProperty('value', rel);
    });

	$$('#import-enclosure-custom, #import-delimiter-custom')
        .addEvent('keypress', function(event){
            if (event.code >= 32) {
                $(this).set('value', '');
            }
        });



    if ( typeof(uploadData) != 'undefined' ) {

        var color, msg;
        // The IMPORT tab
        if (subtask == 1) {
            $('import-toolbar-export').fireEvent('click');

            if (uploadData.status == 1) {
                color = '#00AA00';
                Uploader.getHead( $('import-file'), 'import' );
            } else {
                color = '#AA0000';
            }
            
            msg = '<span style="color:' + color + ';"><h3>' + uploadData.error + '<h3></span>';
            $$('#import-uploadform .upload-queue li')[0].set('html', msg);
        } else {

            // The EXCLUDE tab
            if (subtask == 2) {
                $('exclude-toolbar-file').fireEvent('click');

                if (uploadData.status == 1) {
                    color = '#00AA00';
                    Uploader.getHead( $('exclude-file'), 'exclude' );
                } else {
                    color = '#AA0000';
                }

                msg = '<span style="color:' + color + ';"><h3>' + uploadData.error + '<h3></span>';
                $$('#exclude-uploadform .upload-queue li')[0].set('html', msg);
            }
        }
    }

    $$('#multitab-toolbar-cancel a')
        .removeProperty('onclick')
        .addEvent('click', function(){
            if (window && window.parent && window.parent.SqueezeBox) {
                window.parent.SqueezeBox.close();
            }
            return false;
        });
		
		
    $$('input, select, textarea').addEvent('blur', function(){
		Migur.validator.tabIndicator(
			'#listForm',
			'span h3 a',
			'tab-invalid',
			'.invalid'
		);
	});
		

} catch(e){
    if (console && console.log) console.log(e);
}
});