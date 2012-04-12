Console = Tea.Container.extend('Console', {
    options: {
        id: 'console'
    },
    init : function() {
        this._open = false;
        this.render().appendTo(document.body);
        this._height = this.source.height();
        
        this.closeBox = this.append({type: 't-button', text: 'close', cls: 'closer', click: this.close, context: this});
        this.editor = this.append({type: 'Editor2'});
        
        this.hook($(window), 'resize', this.onResize);
    },
    open : function() {
        this.source.stop().animate({
            height: $(window).height()
        }, 'fast', 'swing', Tea.method(this.openComplete, this));
        this._open = null;
    },
    openComplete : function() {
        this.source.addClass('open');
        this.source.stop().css({
            height: 'auto'
        })
        app.stack.hide();
        this._open = true;
    },
    close : function() {
        this._open = null;
        this.source.removeClass('open');
        app.stack.show();
        app.stack.refresh();
        this.source.stop().animate({
            height: this._height,
        }, 100, null, Tea.method(this.closeComplete, this));
    },
    closeComplete : function() {
        this._open = false;
    },
    edit : function(node) {
        this.open();
        this.editor.setValue(node);
    },
    onResize : function() {
        if (this._open == true) {
            this.source.css({
                bottom: 0,
                height: 'auto'
            })
        }
    }
});

Editor2 = Tea.Container.extend('Editor2', {
    options: {
        cls: 'editor',
        value: null
    },
    init : function() {
        this.buttons = this.append({
            type: 't-container',
            cls: 'right',
            items: [{ type: 't-button',
                      text: 'cancel',
                      click: 'close',
                      context: this },
                    { type: 't-button',
                      text: 'save',
                      click: 'save',
                      context: this }]
        })
        
        this.form = this.append({
            type: 't-container',
            cls: 'properties',
            items: [
                {type: 't-text', name: 'name', label: 'Name'},
                {type: 't-select', name: 'type', label: 'Type', choices: [
                    'menu',
                    'document',
                    'character'
                ]},
                {type: 't-textarea', name: 'content', cls: 'content', label: 'Content'}
            ]
        });
    },
    setValue : function(node) {
        this.value = node;
        this.form.setValue(node);
    },
    close : function() {
        this.parent.close();
    },
    save : function() {
        $.ajax({
            type: 'post',
            url: '/' + this.value.slug + '/',
            data: {value: Tea.toJSON( this.form.getValue() )},
            success: this.saveSuccess,
            context: this
        })
    },
    saveSuccess : function(data) {
        app.session.resource(data);
        $('a.missing[slug=' + data.slug + ']').removeClass('missing');
        this.close();
    }
})