Tea.require(
    "js/background.js",
    "js/widgets.js",
    "js/stack.js",
    "js/node.js",
    "js/editor.js",
    "js/console.js",
    "js/nav.js",
    "js/search.js"
);

app = Tea.Application({
    init : function() {
        $(document).ajaxSend(function(e, xhr, ajaxOptions) {
            xhr.setRequestHeader("X-CSRFToken", $.cookie('csrftoken'));
        });
        
        $.extend(this, this.options);
    },
    ready : function() {
        this.nav = Nav();
        this.session = Session();
        this.console = Console();
        
        this.workspace = Tea.Container({
            id: 'workspace'
        });
        this.workspace.render().appendTo(document.body);
        
        this.results = SearchResults({});
        this.results.render().appendTo(document.body);
        
        this.background = this.workspace.append({
            type: 'Background',
            value: this.background
        });
        
        this.stack = this.workspace.append({
            type: 'Stack',
            margin: 16
        });
        
        this.workspace.append({type: 't-element', cls: 'clear'});
        
        this.scrim = Tea.Scrim();
        
        var path = [];
        for(var i = 0; i < this.nodes.length; i++) {
            this.stack.push({
                type: 'Node',
                value: this.session.resource(this.nodes[i])
            });
            if (this.nodes[i].slug == 'index')
                continue;
            path.push(this.nodes[i].slug);
        }
        this.nav.replace(path);
    },
    ajaxError : function(jqXHR) {
        var win = window.open();
        win.document.write(jqXHR.responseText);
    },
    open : function(path, replace) {
        var i = 1;
        var bread = [];
        var panel;
        this.stack.pause();
        this.results.close();
        
        if (path[0] != '')
            path.unshift('');
        
        for(var i = 0; i < path.length; i++) {
            if (i == 0) {
                var slug = 'index';
            } else {
                var slug = path[i];
                if (slug.length < 1) continue;
                bread.push(slug);
            }
            
            if (this.stack.items.length > i) {
                if (this.stack.items[i].value.slug != slug) {
                    this.stack.pop(this.stack.items[i]);
                } else {
                    continue;
                }
            }
            
            panel = this.stack.push({
                type: 'Node',
                path: bread,
                value: this.session.resource({slug: slug})
            });
            panel.load();
        }
        
        this.stack.play();
        if (panel)
            this.stack.refresh(panel);
        
        if (replace)
            this.nav.replace(bread);
        else
            this.nav.push(bread);
    }
});

Tea.Panel = Tea.Panel.extend('t-panel', {
    options: {
        hideTop: true
    },
    render : function(source) {
        source = this.__super__(source);
        
        if (!this.top) return source;
        
        if (this.hideTop) {
            this.skin.title
                .hover(Tea.method(this.top.show, this.top), Tea.method(this.top.hide, this.top));
        
            this.top.source
                .hover(Tea.method(this.top.show, this.top), Tea.method(this.top.hide, this.top));
        } else {
            this.top.source.show();
        }
        
        return source;
    }
});
