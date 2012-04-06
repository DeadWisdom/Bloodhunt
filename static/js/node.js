Node = Tea.Panel.extend('Node', {
    options: {
        value: null,
        path: null,
        closable: true
    },
    init : function() {
        this.top = [
            {type: 't-button', text: 'edit', click: this.edit, context: this}
        ]
        
        if (this.closable && this.value.slug != 'index') {
            this.top.splice(0, 0, {type: 't-button', text: 'close', click: this.close, context: this});
        }
        
        if (this.value)
            this.setValue(this.value);
    },
    edit : function() {
        this.top.source.hide();  // Cause it sticks around for some reason.
        //Editor({value: this.value, target: this.source});
        app.console.edit(this.value);
    },
    refresh : function() {
        var cls = (this.value.type ? 'node-' + this.value.type : 'node-document');
        var html = $(this.value._html);
        var path = this.path || [];
        
        if (this.value.type == 'menu') {
            html.find('a').not('a.external').each(function() {
                var href = $(this).attr('href');
                $(this).attr('href', "/" + path.concat([href]).join("/"));
                $(this).attr('slug', href);
            })
        }
        
        this.setHTML(html);
        this.setTitle(this.value.name);
        
        if (this.isRendered())
            this.source.attr('class', 't-panel ' + cls);
        else
            this.cls = cls;
    },
    setValue : function(v) {
        this.unhookAll();
        this.value = v;
        if (this.value)
            this.hook(this.value, 'update', this.refresh);
        
        this.refresh();
    },
    load : function() {
        $.ajax({
            url: '/' + this.value.slug + '/',
            success: this.loadSuccess,
            context: this
        });
    },
    loadSuccess : function(data) {
        this.unhookAll();
        this.setValue( app.session.resource(data) );
        
        if (this.parent)
            this.parent.skin.refreshHeights();
    },
    close : function() {
        this.parent.pop(this);
    }
});

Session = Tea.Class('Session', {
    options: {
        key: 'slug',
    },
    __init__ : function(opts) {
        this.cache = {};
        this.__super__(opts);
    },
    resource : function(obj)
    {
        if (obj instanceof Tea.Object)
            return obj;
        
        var key = obj[this.key];
        
        if (key == undefined || key == null) {
            return obj;
        } else {
            var existing = this.cache[key];
            if (typeof existing != 'object') {
                obj = this.cache[key] = this.build(obj);
            } else {
                $.extend(existing, obj);
                obj = existing;
                obj.trigger('update');
            }
        }
        
        return obj;
    },
    build : function(obj) {
        if (obj instanceof Tea.Object) return obj;
        return Tea.Object(obj);
    }
});