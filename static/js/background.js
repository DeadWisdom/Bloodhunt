Background = Tea.Element.extend('Background', {
    options: {
        source: '<img>',
        cls: 'background',
        value: null,
        loaded: false
    },
    init : function() {
        this._height = 0;
        this._width = 0;
    },
    hide : function() {
        this.hidden = true;
        if (this.isRendered())
            this.source.hide();
    },
    fadeOut : function() {
        this.hidden = true;
        if (this.isRendered())
            this.source.fadeOut();
    },
    show : function() {
        this.hidden = false;
        if (this.loaded && this.isRendered())
            this.source.fadeIn();
    },
    onRender : function() {
        $(window).resize(Tea.method(this.resize, this));
        this.setValue(this.value);
        if (this.hidden)
            this.hide();
    },
    setValue : function(url) {
        this.value = url;
        if (!this.isRendered()) return;
        
        if (url) {
            this.source
                .hide()
                .attr('src', url)
                .css({'height': 'auto'})
                .removeAttr('width')
                .removeAttr('height')
                .load(Tea.method(this.onLoad, this));
        } else {
            this.source.hide();
        }
    },
    getValue : function() {
        return this.value;
    },
    onLoad : function() {
        this.loaded = true;
        this._height = this.source[0].clientHeight;
        this._width = this.source[0].clientWidth;
        
        this.resize();
        setTimeout(Tea.method(this.resize, this), 200);
    },
    resize : function() {
        var win_w = this.source.offsetParent().width();
        var win_h = this.source.offsetParent().height();
        
        var d = this._width / win_w;

        var top = 0;
        var left = 0;
        var w = win_w;
        var h = this._height / d;
        
        if (h < win_h) {
            d = h / win_h;
            h = win_h;
            w = w / d;
        }
        
        if (h > win_h)
            top = (win_h - h) / 3;
            
        if (w > win_w)
            left = (win_w - w) / 3;
        
        this.source
            .attr('width', w)
            .attr('height', h)
            .css({
                position: 'fixed',
                top: top,
                left: left,
                'z-index': 0
            });
        
        if (!this.hidden)
            this.source.fadeIn();
    }
});