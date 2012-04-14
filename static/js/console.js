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
        this.editor._formType = null;
        this.editor.setValue(node);
        console.log(node);
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
        });
        
        this.form = this.append({
            type: 't-container',
            cls: 'properties'
        });
        
        this._formType = null;
    },
    buildForm : function(typeSlug) {
        var type = app.types[typeSlug] || app.types['document'];
        var types = [];
        
        $.each(app.types, function(k, v) { if (k != 'type') types.push(k) });    
        this.form.empty();
        if (type.slug != 'type') {
            this._typeField = this.form.append(
                {type: 't-select', name: 'type', label: 'Type', choices: types}
            );
            
            this.unhookAll();
            this.hook(this._typeField.input.source, 'change', this.changeType);
        }
        
        for(var i = 0; i < type.fields.length; i++) {
            this.form.append( type.fields[i] );
        }
    },
    changeType : function(e) {
        var val = $.extend({}, this.value, this.getValue(), {type: this._typeField.getValue()});
        this.setValue(val);
    },
    setValue : function(node) {
        this.value = node;
        if (node == null) return;
        
        if (this._formType != node.type) {
            this._formType = node.type;
            this.buildForm(node.type);
        }
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
        if (data.__error__) {
            console.log("Form save error.")
            console.log(data.__error__);
            return;
        } else {
            app.session.resource(data);
        }
        $('a.missing[slug=' + data.slug + ']').removeClass('missing');
        this.close();
    }
});