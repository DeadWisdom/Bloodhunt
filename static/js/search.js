SearchBox = Tea.TextInput.extend('search-box', {
    options: {
        cls: 'search-box',
        placeholder: 'search'
    },
    onRender : function() {
        var source = this.source;
        
        source.keydown(Tea.latent(300, this.trigger, this));
        source.focus(function() {
            $(this).select();
            app.results.open();
        });
    },
    trigger : function(e) {
        var q = this.getValue();
        if (q.length <= 2) return;
        app.results.search(q);
    }
});

SearchResults = Tea.Panel.extend('search-results', {
    options: {
        cls: 'search-results',
        title: 'Search Results',
        closable: true
    },
    init : function() {
        var self = this;
        $(document.body).on('click', function(e) {
            if ($(e.target).closest('.search-results').length == 0 &&
                $(e.target).closest('.search-box').length == 0)
                self.close()
        });
    },
    search : function(query) {
        this.open();
        this.setLoading(true);
        this._query = query;
        $.ajax({
            url: '/:search/',
            data: {q: query},
            success: this.searchSuccess,
            context: this
        });
    },
    searchSuccess : function(nodes) {
        this.empty();
        this.setLoading(false);
        var exact = false;
        for(var i = 0; i < nodes.length; i++) {
            this.append({
                type: 't-button',
                text: nodes[i].name || nodes[i].slug,
                href: '/' + nodes[i].slug + '/'
            });
            if (nodes[i].slug == this._query)
                exact = true;
        }
        if (!exact) {
            this.append({
                type: 't-button',
                text: "Create '" + this._query + "'",
                href: '/' + this._query + '/'
            });
        }
    },
    close : function() {
        this.source.hide();
    },
    open : function() {
        this.source.fadeIn();
    },
    setLoading : function(bool) {
        if (bool) {
            this.source.addClass('loading');
        } else {
            this.source.removeClass('loading');
        }
    }
});
