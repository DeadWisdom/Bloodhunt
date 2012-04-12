AutoResizeTextInput = Tea.TextAreaInput.extend('t-textarea-input', {
    render : function(src) {
        src = this.__super__(src);
        src.addClass('autoresize');
        src.autoResize({
            animateDuration : 300,
            extraSpace : 30
        });
        return src;
    }, 
    remove : function() {
        this.source.data('AutoResizer').destroy();
        return this.__super__();
    },
    setValue : function(v) {
        this.__super__(v);
        if (this.isRendered()) {
            var resizer = this.source.data('AutoResizer');
            if (resizer)
                resizer.check();
        }
        return v;
    }
});