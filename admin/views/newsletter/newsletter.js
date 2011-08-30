/**
 * The javascript file for newsletter view.
 *
 * @version	   $Id:  $
 * @copyright  Copyright (C) 2011 Migur Ltd. All rights reserved.
 * @license	   GNU General Public License version 2 or later; see LICENSE.txt
 */

// Hack. Set the first tab active
Cookie.write('jpanetabs_tabs-newsletter', 0);

//TODO: Tottaly refacktoring. Create and use widgets!

//TODO: Create the setup method that doing the page setup emmidiately after loading (not events)!
Migur.moodialogs = [];

function jInsertFieldValue(value, id) {

    if (typeof Migur.moodialogs[0] != 'undefined') {
        Migur.moodialogs[0].data.params.img = siteRoot + '/' + value;
        Migur.moodialogs[0].task = 'apply';
        Migur.moodialogs[0].close();
    }

    if ($('element-box') != null) {
        $('element-box').fireEvent(
            'mediaselected',
            {id: id, value: value}
        );
    }
}

/* Create the dnd interaction in "copy" mode. */


//TODO: BAAAD!!! Ned to insert into module widget
Migur.dnd.makeAvatar = function(el, droppables){

    var avatar = el.clone();
    avatar.cloneEvents(el);
        
    /* Set draggable behaviour to avatar */
    avatar.makeDraggable({

        droppables: droppables,

        onBeforeStart: function(draggable, droppable){

            var coords = draggable.getCoordinates($$('body')[0]);
            $(draggable).store('source', draggable.getParent('div'));
            $$('body').grab(draggable);
            draggable.setStyles({
                left: coords.left + 'px',
                top:  coords.top  + 'px',
                position: 'absolute',
                zIndex: 1000
            });
        },

        onEnter: function(draggable, droppable){
            droppable.addClass('overdropp');
        },

        onCancel: function(draggable, droppable){
            return $(draggable).retrieve('dragger').$events.drop[0](draggable, droppable);
        },

        onLeave: function(draggable, droppable){
            droppable.removeClass('overdropp');
        },

        onDrop: function(draggable, droppable){
                
            if (!draggable) return false;
            var source = $(draggable).retrieve('source');
            if (!droppable) {
                // no droopable area

                if (!source) {
                    return draggable.destroy();
                }
                    
                source.grab(draggable);
                draggable.setStyles({
                    left: 0,
                    top:  0,
                    position: 'relative',
                    zIndex: 1000
                });

            } else {
                // hit in dropable
                var trashcan = $(droppable).hasClass('trashcan');
                if (trashcan) {
                    draggable.destroy();

                } else {
                    droppable.grab(draggable);
                    draggable.setStyles({
                        left: 0,
                        top:  0,
                        position: 'relative',
                        zIndex: 'auto'
                    });

                    var widget = Migur.getWidget(draggable);
                    widget.load(
                        siteRoot + 'index.php?option=com_newsletter&task=newsletter.rendermodule',
                        widget.get(),
                        '.widget-content'
                        );

                    if (widget.get().notConfigured) {
                        setTimeout(function(){
                            avatar.getElements('a.settings')[0].fireEvent('click');
                        }, 500);
                    }
                }

                droppable.removeClass('overdropp');

                $('html-area').fireEvent('drop');
            }

            Migur.getWidget('autosaver-switch').update(
                (autosaver.isChanged(autosaver.getter()))? 'unsaved' : 'saved');
        }
    });
    return avatar;
}

// BAAAD!!! Ned to insert into module widget
avatarSetSettings = function(avatar) {
    
    avatar.getElements('a.settings')[0]
    .addEvent('mousedown', function(event){
        event.stop();
    })
    .addEvent('click', function(event){
            
        var widgetEl = $(this).getParent('.widget');
        widget = Migur.getWidget(widgetEl);
        var conf = widget.get().notConfigured;
        widget.set({'notConfigured': false});

        if (event) event.stop();
        var href = 0;//$(this).getProperty('href');
        if ( Migur.moodialogs[href] ) {
            Migur.moodialogs[href].destroy();
        }
        Migur.moodialogs[href] = {};
        Migur.moodialogs[href] = new MooDialog.Iframe(
            $(this).getProperty('href'),
            {
                'title': 'Module / Plugin',
                'class': 'MooDialog myDialog',
                autoOpen: false,
                closeButton: !conf,
                onClose: function() {
                    if ( this.task == 'apply' ) {
                        var widget = Migur.getWidget(this.targetObj);

                        widget.set( {
                            'params'    : this.data.params,
                            'title'     : this.data.title,
                            'showtitle' : this.data.showtitle
                        });

                        // TODO: The widget should decide it (update or not its content) itself
                        if (this.data.type == 1) {
                            widget.load(
                                siteRoot + 'index.php?option=com_newsletter&task=newsletter.rendermodule',
                                widget.get(),
                                '.widget-content'
                            );
                        }
                        Migur.getWidget('autosaver-switch').update(
                            (autosaver.isChanged(autosaver.getter()))? 'unsaved' : 'saved');
                    }
                }
            }
        );
        Migur.moodialogs[href].targetObj = avatar;
        Migur.moodialogs[href].data =
            Migur.getWidget( $(this).getParent('.widget') ).get();
                
        Migur.moodialogs[href].open();

        var box = document.getSize();
        var scroll = document.getScroll();
        var size = {
            x: $(Migur.moodialogs[href].wrapper).getWidth(),
            y: $(Migur.moodialogs[href].wrapper).getHeight()
        };

        var left = (scroll.x + (box.x - size.x) / 2).toInt();
        var top = (scroll.y + (box.y - size.y) / 2).toInt();


        Migur.moodialogs[href].wrapper.setPosition({
            x: left,
            y: top
        });

        Migur.moodialogs[href].wrapper.grab(new Element('div', {
            'styles': {
                'position': 'absolute',
                'bottom': '0px',
                'right' : '0px',
                'width': '10px',
                'height': '10px'
            },
            'class':'resizer'
        }));
        Migur.moodialogs[href].wrapper.makeResizable({
            handle: Migur.moodialogs[href].wrapper.getElements('.resizer')[0]
        });

        $$('div.title').addEvent('mousedown', function(){
            Migur.moodialogs[href].mover = new Drag.Move(Migur.moodialogs[href].wrapper);
        });

        $$('div.title').addEvent('mouseup', function(){
            Migur.moodialogs[href].mover.detach();
        });
    })
    .removeClass('icon-16-gear-disabled')
    .addClass('icon-16-gear');
}



window.addEvent('domready', function() {
    try {


        $('tabs-sub-container').getElements('input, textarea')
        .addEvent('focus', function(ev){
            this.addClass('focused');
        })
        .addEvent('blur',  function(ev){
            this.removeClass('focused');
        });


        acc1 = new Fx.Accordion($('acc-newsletter'), '#acc-newsletter h3', '#acc-newsletter .content', {
            fixedHeight: '220px'
        });

        acc2 = new Fx.Accordion($('acc2-newsletter'), '#acc2-newsletter h3', '#acc2-newsletter .content', {
            fixedHeight: '245px'
        });


        /**
     * Create wigets for each template control
     **/
        Migur.createWidget('templates-container', {

            data: null,

            render: function() {},
            events: {
                'change': function() {

                    var tpl = Migur.iterator.getItem(
                        dataStorage.templates,
                        't_style_id',
                        $(this).get('value')
                        );

                    if (typeof(tpl.t_style_id) == "undefined") {
                        tpl.t_style_id = null;
                        tpl.template = "";
                    }

                    var htmlWidget = Migur.getWidget('html-area');

                    var curId = htmlWidget.get().t_style_id;

                    if ($(this).get('value') == 0 && curId > 0) {
                        alert("You need to have an HTML template.");
                        $(this).set('value', curId);
                        return false;
                    }

                    if (tpl.t_style_id == curId && curId > 0) {
                        alert("This template style is active.");
                        return false;
                    }

                    if (!curId || confirm(
                        "Do you really want to change the template style? \n"+
                        "All changes in the current HTML Newsletter will be lost."
                        )) {

                        // Case if htmlWidget is rendered firstly
                        if ( !curId ) {
                            tpl.extensions = dataStorage.htmlTemplate.extensions;
                        }

                        htmlWidget.render(tpl);
                        Migur.getWidget('autosaver-switch').update('unsaved');

                        // change template
                        // set new droppables for drags
                        $$('.html-slider-modules .drag').each(function(el){
                            var dragger = el.retrieve('dragger');
                            if (dragger) {
                                dragger.droppables = $$('#html-area .modules');
                            }
                        });
                    }
                    return false;
                }
            }
        });

        /* Create MODULE widgets */
        $$('.html-slider-modules .drag').each(function(el) {

            var dataModule = Migur.iterator.getItem(
                dataStorage.modules,
                'extension',
                el.getProperty('id'));

            Migur.createWidget(el, {

                data: dataModule,

                type: dataModule.extension,

                mode: 'common',

                events: {
                    /* Initialize DND */
                    'mousedown': function(event){

                        event.stop();

                        var widget = Migur.getWidget(this);

                        if (widget.mode == 'common') {

                            /* If event happened onto setting icon */
                        
                            // IE Fix
                            var trgt = (typeof(event.event.target) == 'undefined')?
                            event.target : event.event.target;

                            if ( $(trgt).hasClass('settings') ) {
                                event.stop();
                                return;
                            }


                            var avatar = Migur.dnd.makeAvatar(this, $$('#html-area .modules, #trashcan-container'));

                            var w = Migur.createWidget(
                                avatar,
                                {
                                    data: [widget.get()].clone()[0],
                                    type: widget.type,
                                    mode: 'custom'
                                }
                                );

                            w.set({'notConfigured': true});
                            
                            avatarSetSettings(avatar);
                            avatar.inject($$('body')[0]);

                            // positionnig the Avatar in the same place where element is placed
                            var coords = this.getCoordinates($$('body')[0]);
                            avatar.setStyles({
                                left: coords.left-5 + 'px',
                                top:  coords.top-5  + 'px',
                                position: 'absolute',
                                zIndex: 1000
                            });

                            // Init dragging of an AVATAR
                            avatar.fireEvent('mouseover', event);
                            avatar.fireEvent('mousedown', event);

                        } else {
                            /* If event happened onto setting icon */
                            // IE Fix
                            var trgt = (typeof(event.event.target) == 'undefined')?
                            event.target : event.event.target;
                            if ( $(trgt).hasClass('settings') ) {
                        }
                        }
                    }
                }
            });

            $(el).getElements('.settings')[0]
            .addEvent('mousedown', function(event){
                event.stop();
            })
            .addEvent('click', function(event){
                event.stop();
            });

        });


        /* Create PLUGIN widgets */
        $$('.plugin').each(function(el) {

            Migur.createWidget(el, {
            
                setup: function(){
                    var id = $(this.domEl).getProperty('id');
                    var data = Migur.iterator.getItem(
                        dataStorage.htmlTemplate.extensions,
                        'extension',
                        id
                    );

                    // If this widget is not used yet then set default
                    if (data.length == 0) {
                        data = Migur.iterator.getItem(
                            dataStorage.plugins,
                            'extension',
                            id
                        );
                    }
                    
                    this.set(data);
                    // Update the turn on/off switcher
                    $(this.domEl).getElements('input')[0].setProperty(
                        'checked',
                        (data.params.active)? true : false
                    );
                },

                /* Uses parent getter and setter*/

                events: {
                    'click': function(event){
                        /* If event happened onto checkbox */
                        // IE Fix
                        var trgt = (typeof(event.event.target) == 'undefined')?
                            event.target : event.event.target;

                        if ( $(trgt).match('input') ) {
                            var widget = Migur.getWidget(this);
                            var data = widget.get();
                            data.params.active = $(trgt).getProperty('checked');
                            widget.set(data);
							
							Migur.getWidget('autosaver-switch').update(
								(autosaver.isChanged(autosaver.getter()))? 'unsaved' : 'saved');
							
                        }
                    }
                }
            });
            avatarSetSettings(el);
        });


        /**
     * Create widget for HTMLarea contol
     **/
        Migur.createWidget($('html-area'), {

            /*
         * Parses input data from data storage and get
         * the structure of template style and add all the extensions
         * used in the newsleter html templte
         *    */
            setup: function(){
                var htmlTemplate = dataStorage.htmlTemplate;
                if ($(htmlTemplate.template.id)) {
                    this.data =
                    [Migur.getWidget($(htmlTemplate.template.id)).get()].clone()[0]
                } else {
                    this.data = {};
                }
                this.data.extensions = htmlTemplate.extensions;
            },

            /* Update the dom of element and save the id of used tempate style */
            render: function(data) {
            
                if (!data || !data.t_style_id) {
                    return false;
                }

                this.data = data;

                var $this = this;
                new Request.JSON({
                    url: '?option=com_newsletter&task=template.getparsed&format=json',
                    data: {
                        t_style_id: data.t_style_id,
                        type: 'html'
                    },
                    onSuccess: function(res){
                        $this.data.template = res.data.content;
                        $this._render();
                    }
                }).send();

                return true;
            },

            /* Uses the this.data[t_style_id, template] */
            _render: function() {
                if (typeof (this.data.template) == 'string') {

                    var domEl = this.domEl;

                    /* Render the template HTML */
                    domEl.setStyle('border', (this.data.template == "")? '1px solid #ff0000' : '0');
                    domEl.set({
                        html: this.data.template
                        });
                    $$('form [name=jform[t_style_id]]').set('value', this.data.t_style_id);


                    /* Render the modules HTML */
                    if (this.data.extensions) {
                        Array.each(this.data.extensions, function(el) {
                            var position = $$(
                                '#' + domEl.getProperty('id') +
                                ' [name=' + el.position + ']'
                                )[0];

                            if (position) {
                                // Create the new Element
                                module = $$('#' + el.extension)[0];
                                if (module) {

                                    var avatar = Migur.dnd.makeAvatar(module, $$('#html-area .modules, #trashcan-container'));
                                    // Create the new Widget from element
                                    var widget = Migur.getWidget(module);
                                    var newW = Migur.createWidget(
                                        avatar,
                                        {
                                            data: el,
                                            type: widget.type
                                        }
                                        );

                                    newW.load(
                                        siteRoot + 'index.php?option=com_newsletter&task=newsletter.rendermodule',
                                        newW.get(),
                                        '.widget-content'
                                        );

                                    avatarSetSettings(avatar);
                                    avatar.inject(position);
                                }
                            }
                        });
                    }
                }
            },

            /**
         * Specific behavior. Parses dom of htmlTpl element, get all the extensions
         * its positions and id of used template style and
         * return this data in JSON format
         **/
            parse: function() {
                // all of dropable areas
                var dt = [this.data].clone()[0];
                if (!dt) dt = {};
                dt.template = null;
                dt.extensions = null;
                var res = {
                    template: dt,
                    extensions: []
                };

                var idx = 1;
                $$('#' + this.domEl.getProperty('id') + ' .modules').each(
                    function(droppable){
                        droppable.getChildren('.drag').each(function(draggable){
                            var module = Migur.getWidget(draggable);
                            var data = [module.get()].clone()[0];
                            data.position = droppable.get('name');
                            data.ordering = idx;
                            res.extensions.push(data);
                            idx++;
                        });
                    }
                    );
                return res;
            }
        });

        /*  Main tabs -> click-handlers  */
        $$('#tabs-newsletter > dt').addEvent('click', function (event) {

            $$('#trashcan-container ul').addClass('hide');
            if ( $(this).match('.tab-html') ) {
                $('acc-newsletter').set('styles', {
                    display:'block'
                } );
                $$('#trashcan-container ul').removeClass('hide');
            } else {
                $('acc-newsletter').set('styles', {
                    display:'none'
                } );
            }

            if ( $(this).match('.tab-plain') ) {
                $('acc2-newsletter').set('styles', {
                    display:'block'
                } );
            } else {
                $('acc2-newsletter').set('styles', {
                    display:'none'
                } );
            }
        });
    
        $$('#tabs-newsletter > dt')[0].fireEvent('click');

        /* Type of letter */
        if (!Migur.storage.newsletter.type_changeable && isNew != 1) {
            $$('[name=jform[type]]').each(function(el){
                el.setProperty('disabled', 'disabled');
            });
        }

        /* bind data to Smtp Profile select*/
        $('jform_smtp_profile_id').store('optionsData', smtpProfiles);

        /* "smtp" drop-down box -> change-handler */
        $('jform_smtp_profile_id').addEvent('change', function () {
            var inputs = $$('.smtp-dependency');

            if( $(this).get('value') != '0' ) {
                var id = $(this).get('value');
                var sets = this.retrieve('optionsData');
                var vals;
                for (var i=0; i < sets.length; i++) {
                    if (sets[i].smtp_profile_id == id) {
                        vals = sets[i];
                    }
                }
            
                $('jform_params_newsletter_from_name').set('value', vals.from_name);
                $('jform_params_newsletter_from_email').set('value', vals.from_email);
                $('jform_params_newsletter_to_name').set('value', vals.reply_to_name);
                $('jform_params_newsletter_to_email').set('value', vals.reply_to_email);
                inputs.addEvent('keydown', function(){
                    return false;
                });
                inputs.setProperty('readonly', true);
            } else {
                inputs.removeProperty('readonly');
                inputs.removeEvents('keydown');
                inputs.each(function(el){
                    el.set('value', el.retrieve('value'));
                });
            }
        });


        /* "smtp settings" inputs -> keyup-handler */
        $$('.smtp-dependency').addEvent('keyup', function () {
            $(this).store('value', $(this).get('value'));
        });


        /* "Clear Profile" button -> change-handler */
        $('button-newsletter-clear-profile').addEvent('click', function () {
            $('jform_smtp_profile_id').set('value', '0').fireEvent('change');
        });


        /* "Subject" input -> keyup-handler */
        $('jform_subject').addEvent('keyup', function (event) {
            var link = $('link-website')
            var value = $(this).get('value');
            var val = siteRoot + link.getProperty('rel').replace('%s', value.replace(/[^a-zA-Z-0-9_-]+/g, '').toLowerCase());
            if (val == '') {
                link.addClass('hide');
                $('link-website-prompt').removeClass('hide');
            } else {
                link.removeClass('hide');
                $('link-website-prompt').addClass('hide');
            }
            link.set('text', val);
            link.setProperty('href', val);
        });

        $('jform_subject').fireEvent('keyup');

        /* "Plain text" tab -> "Dynamic data" -> click-handlers */
        // add dynamic data
        $$('#dynamic-data-container a').each(function(el){
            el.setProperty('href', el.getProperty('rel'));
            el.addEvent('click', function(){
                $('jform_plain_area').insertAtCursor($(this).getProperty('href'), false);
                return false;
            });
        });


        /* Start the autosaver */
        autosaver = new Migur.ajax.autosaver({
            options: {
                repeat: true,
                timeout: 3000,
                observable: $('tabs-sub-container'),
                url: '?option=com_newsletter&format=json'
            },

            beforeSend: function(){
                if ( $$('[name=newsletter_id]').get('value') > 0) {
                    $$('form [name=task]').set('value','newsletter.apply');
                } else {
                    $$('form [name=task]').set('value','newsletter.save');
                }
            },

            getter: function(){
                var htmlTpl = Migur.getWidget('html-area').parse();
                var inputs  = $('tabs-sub-container').toQueryString();
                
                // Get the all data from all plugins!
                var plugins = [];
                $$('.plugin').each(function(el) {
                    plugins.push( Migur.getWidget(el).get() );
                });
                var obj = new Hash(inputs.parseQueryString());
                obj["jform[newsletter_preview_email]"] = "";
                obj["jform[htmlTpl]"] = JSON.encode(htmlTpl);
                obj["jform[plugins]"] = JSON.encode(plugins);
                return obj.toQueryString();
            },
        
            // On success
            onSuccess: function(res){
                if (res.state == 'ok') {
                    if (res.newsletter_id > 0) {
                        $$('[name=newsletter_id]').set('value', res.newsletter_id);
                        Migur.getWidget('autosaver-switch').render();
                        autosaver.options.observState = autosaver.getter();
                    }
                }
            },

            controller: function(data) {
                /*
            if (parseInt($$('[name=newsletter_id]').get('value')) < 1) {
                return false;
            }
*/
                var form = $$('form.form-validate')[0];
                var res = document.formvalidator.isValid(form);

                Migur.validator.tabIndicator(
                    '#tabs-sub-container',
                    'span h3 a',
                    'tab-invalid',
                    '.invalid'
                    );

                if (!res) {
                    return false;
                }

                return this.isChanged(data);
            }
        });

        $$('input, select, textarea').addEvent('blur', function(){
            Migur.validator.tabIndicator(
                '#tabs-sub-container',
                'span h3 a',
                'tab-invalid',
                '.invalid'
                );
        });


        /* Save handlers */
        $$('#toolbar-save a')[0].addEvent('click', function(ev){

            if (autosaver.send(false, 'use controller')) {
                return true; //$$('#toolbar-cancel a')[0].onclick();
            } else {
                alert('An error occured during save, please try turning on autosave instead.');
                ev.stop();
                return false;
            }
        });

        $$('#toolbar-apply a')[0].addEvent('click', function(ev){

            ev.stop();
        
            var res = autosaver.send(false, 'use controller');

            if (res) {
                // Hide the message (0008255: Ability to configure autosave)
                autosaver.prompt = 'already';
            
                if (typeof(autosaver.prompt) == 'undefined') {
                    autosaver.prompt = 'already';
                    var conf = confirm('Do you want to turn on "Auto save" instead?');
                    if (conf) {
                        Migur.getWidget('autosaver-switch').turnOn();
                    }
                }

            } else {
                alert('An error occured during save, please try turning on autosave instead.');
            }
        });


        /* Autosaver switch onclick-handler */
        $$('#toolbar-autosaver a')[0].setProperty('id', 'autosaver-switch');

        Migur.createWidget('autosaver-switch', {

            setup: function(){
                if (typeof (comParams.autosaver_enabled) != 'undefined' && comParams.autosaver_enabled == '1') {
                    this.data = 'on';
                } else {
                    this.data = 'off';
                }
            //this.data = null;
            },

            render: function() {
                $(this.domEl).set({
                    html:
                    '<span id="autosaver-icon"></span>'+
                '<span id="content-state"></span>'
                });
                this.update('saved');

                (this.data == 'on')? this.turnOn() : this.turnOff();
            },

            update: function(data) {
                var text, color;
                if (data == 'saved') {
                    text = 'Saved';
                    color = 'green';
                } else {
                    text = 'Not Saved';
                    color = 'red';
                }

                $('content-state').set('text', text).set('styles', {
                    color: color
                });

            },

            turnOn: function() {
                $(this.domEl).getElementById('autosaver-icon')
                .addClass('icon-32-autosave-on')
                .removeClass('icon-32-autosave-off');
                autosaver.start();
                this.data = 'on';
            },

            turnOff: function() {
                $(this.domEl).getElementById('autosaver-icon')
                .addClass('icon-32-autosave-off')
                .removeClass('icon-32-autosave-on');
                autosaver.stop();
                this.data = 'off';
            },
            change: function() {
                if (this.data == 'off') {
                    this.turnOn();
                }else {
                    this.turnOff();
                }

            },
            events: {
                'click': function(){
                    Migur.getWidget(this).change();
                    return false;
                }
            }
        });


        /* Unsaved data warning handler */
        $$('#html-area, form textarea, form input, form select').addEvent('keyup', function() {
            Migur.getWidget('autosaver-switch').update(
                (autosaver.isChanged(autosaver.getter()))? 'unsaved' : 'saved');
        });

        $$('form select').addEvent('change', function() {
            Migur.getWidget('autosaver-switch').update(
                (autosaver.isChanged(autosaver.getter()))? 'unsaved' : 'saved');
        });

        $('jform_newsletter_preview_email').addEvent('focus', function(){
            //TODO: Add to translations
            if (this.value == "Emails...") this.value = '';
            $(this).setStyle('color', 'black');
        })
        .addEvent('blur', function(){
            if (this.value == '') {
                this.value = "Emails...";
                $(this).setStyle('color', 'grey');
            }
        })
        $('jform_newsletter_preview_email').fireEvent('blur');


        // Test source, list of tags from http://del.icio.us/tag/
        var tokens = [['.net', 'net2', 0], ['2008', '20082', 1], ['3d', 'advertising', 2]];

        // Our instance for the element with id "demo-local"
        autocomp = new Autocompleter.Local('jform_newsletter_preview_email', tokens, {
            'minLength': 1, // We need at least 1 character
            'selectMode': 'type-ahead', // Instant completion
            'multiple': true // Tag support, by default comma separated
        });

        //previewTextBox.container.addClass('textboxlist-loading');
        new Request.JSON({
            url: '?option=com_newsletter&task=newsletter.autocomplete&format=json',
            onSuccess: function(r){
                autocomp.tokens = r;
            }
        }).send();


    autocomp.addEvent('boxSelect', function(bit){

        if ( !$$('[name=newsletter_id]')[0].get('value') ) {
            alert("Please save the newsletter first!");
            return;
        }

        var email = bit? bit[1] : null;
        /*
        var email = null;
        if (bit) {
            email = (bit.value[0])? bit.value[0] : bit.value[1];
        }
*/
//        new Request({
//            url: siteRoot + 'index.php?option=com_newsletter&task=newsletter.render',
//            data: {
//                newsletter_id: $$('[name=newsletter_id]')[0].get('value'),
//                email: email,
//                type: 'html'
//            },
//            onComplete: function(res){
//                if (res) {
//                    $$('#tab-preview-html-container body').set('html', res);
//                } else {
//                    alert("An unknown error occured");
//                }
//            }
//        }).send();

        var nsId = $$('[name=newsletter_id]')[0].get('value');
        $('tab-preview-html-container').setProperty(
            'src', 
            siteRoot + 'index.php?option=com_newsletter&task=newsletter.render&type=html&email='+escape(email)+'&newsletter_id='+nsId);
//            url:
//            data: {
//                newsletter_id: $$('[name=newsletter_id]')[0].get('value'),
//                email: email,
//                type: 'html'
//            },
//            onComplete: function(res){
//                if (res) {
//
//                } else {
//                    alert("An unknown error occured");
//                }
//            }
//        }).send();

        new Request({
            url: siteRoot + 'index.php?option=com_newsletter&task=newsletter.render',
            data: {
                newsletter_id: $$('[name=newsletter_id]')[0].get('value'),
                email: escape(email),
                type: 'plain'
            },
            onComplete: function(res){
                if (res) {
                    $('tab-preview-plain-container')
                    .set('value', res);
                } else {
                    alert("An unknown error occured");
                }
            }
        }).send();
    });

    //    previewTextBox.fireEvent('blur');
    //
    $$('.tab-preview').addEvent('click', function(){
        autocomp.fireEvent('boxSelect');
    });

    // sample data loading with json, but can be jsonp, local, etc.
    // the only requirement is that you call setValues with an array of this format:
    // [
    //	[id, bit_plaintext (on which search is performed), bit_html (optional, otherwise plain_text is used), autocomplete_html (html for the item displayed in the autocomplete suggestions dropdown)]
    // ]
    // read autocomplete.php for a JSON response exmaple


    $('button-newsletter-send-preview').addEvent('click', function(){

        var type = ($$('.tab-preview-html')[0].hasClass('open') == true)? 'html' : 'plain';
        new Request({
            url: siteRoot + 'index.php?option=com_newsletter&task=newsletter.sendpreview&tmpl=component',
            data: {
                newsletter_id: $$('[name=newsletter_id]')[0].get('value'),
                emails: autocomp.getBoxes(),
                type: type
            },
            onComplete: function(res){
                
                var text;
                if (res == '') {
                    text = "The previews were succesfully mailed";
                } else {
                    text = "An error occured";
                }
                alert(text);
            }
        }).send();
    });


    $('templates-container').set( 'value', $$('[name=jform[t_style_id]]')[0].get('value') );
    $('templates-container').fireEvent('change');

    // You want the request dialog instance to set the onRequest message,
    // so you have to do it in two steps.

    if (isNew == 1) {
    
        migurGuide = Migur.createWidget(
            new Element('div'),
            {
                body: '<div class="guide-stop"></div><div class="guide-tip"><div class="guide-content"></div></div><div class="guide-pointer"></div>',
                stopControl: true,
                steps:[
                {
                    target:  {
                        dom: function(){
                            return $$('#tabs-newsletter > .tabs')[1];
                        },
                        event: 'click'
                    },
                    needle:  {
                        dom: function(){
                            return $$('#tabs-newsletter > .tabs')[1];
                        }
                    },
                overlay: {
                    content: 'Click the HTML tab!'
                }
            }, {
                target:  {
                    dom: '#templates-container',
                    event: 'change'
                },
                needle:  {
                    dom: '#templates-container'
                },
                overlay: {
                    content: 'Choose a template first!'
                }
            }, {
                target:  {
                    dom: '#html-area',
                    event: 'drop'
                },
                needle:  {
                    dom: '#acc-modules-native'
                },
                overlay: {
                    content: 'Pick a module and drag it into the template!'
                }
            }, {
                target:  {
                    dom: function(){
                        return $$('#html-area .module .settings')[0];
                    },
                    event: 'click'
                },
                needle:  {
                    dom: function(){
                        return $$('#html-area .module .settings')[0];
                    },
                    xCorrection: -10,
                    yCorrection: 10
                },
                overlay: {
                    content: 'You can modify settings for this module by clicking here!'
                }
            }, {
                needle:  {
                    dom: function(){
                        return $$('#html-area .module .settings')[0];
                    }
                },
            overlay: {
                content: 'Well done! <br /> Now you know all you need!'
            }
        }
        ]
    },
    Migur.widgets.guide
    );

    setTimeout('migurGuide.start.apply(migurGuide)', '1000');
}


} catch(e){
    if (console && console.log) console.log(e);
}

});