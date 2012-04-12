Editor = Tea.Panel.extend('Editor', {
    options: {
        title: 'Editor',
        cls: 'editor',
        value: null,
        target: null,
        hideTop: false,
        width: 350
    },
    init : function() {
        this.top = [
            {type: 't-button', text: 'Cancel', click: this.remove},
            {type: 't-button', text: 'Save', click: this.save}
        ]
        
        this.form = this.append({
            type: 't-container',
            cls: 'properties',
            items: [
                {type: 't-text', name: 'name', label: 'Name'},
                {type: 't-select', name: 'type', label: 'Type', choices: [
                    'menu',
                    'document',
                    'character'
                ]}
            ]
        });
        
        this.content = this.append({
            type: 't-textarea-input',
            name: 'content',
            cls: 'content'
        });
        
        this.render().appendTo(document.body).stop(true, true).hide().fadeIn();
        
        this.resize();
    },
    setValue : function(value) {
        this.value = value;
        this.form.setValue(value);
        this.content.setValue(value);
        this.setTitle(this.value.slug);
    },
    resize : function() {
        if (this.target == null) return;
        
        var height = $(window).height() - 80 - this.target.offset().top;
        if (height < 100) height = height;
        
        this.source.css({
            left: this.target.offset().left,
            top: this.target.offset().top,
            width: this.target.width(),
            height: height
        });
        
        this.content.source.css({
            height: height - this.form.source.height() - 8,
            top: this.form.source.height(),
            bottom: 0
        });
        
        this.target.fadeOut();
    },
    remove : function() {
        if (this.target) {
            this.target.stop(true, true).show();
        }
        return this.__super__();
    },
    save : function() {
        $.ajax({
            type: 'post',
            url: '/' + this.value.slug + '/',
            data: {value: Tea.toJSON( this.getValue() )},
            success: this.saveSuccess,
            context: this
        })
    },
    saveSuccess : function(data) {
        app.session.resource(data);
        $('a.missing[slug=' + data.slug + ']').removeClass('missing');
        this.remove();
    }
});
