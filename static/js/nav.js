Nav = Tea.Class('Nav', {
    init : function() {
        History.Adapter.bind(window, 'statechange', Tea.method(this.onStateChange, this));
        
        var self = this;
        $(document).on('click', "a", function() {
            if ($(this).hasClass('external')) return;
            return self.intercept( $(this).attr('href') );
        });
        
    },
    onStateChange : function() {
        if (this._paused) {
            this._paused = false;
            return false;
        }
        var state = History.getState();
        return this.open(state.hash.split('/'));
    },
    intercept : function(href) {
        if (href) {
            try {
                return this.open(href.split('/'));
            } catch(e) {
                console.exception(e);
            }
            return false;
        }
    },
    open : function(what) {
        app.open(what);
        return false;
    },
    redirect : function(path) {
        this._paused = true;
        this.open(path);
        this._paused = false;
    },
    replace : function(path) {
        this._paused = true;
        History.replaceState(null, null, "/" + path.join("/") + "/");
        this._paused = false;
    },
    push : function(path) {
        this._paused = true;
        History.pushState(null, null, "/" + path.join("/") + "/");
        this._paused = false;
    }
});

Path = Tea.Class('Path', {
    __init__ : function(value) {
        this.__super__();
        this.value = [];
        this.extend(value);
    },
    _filter : function(item) {
        if (item) return true;
        return false;
    },
    extend : function(lst) {
        this.value = this.value.concat( $.grep(lst, this._filter) );
        this.length = this.value.length;
    },
    getValue : function() {
        return this.value;
    },
    head : function() {
        return this.value[0] || null;
    },
    tail : function() {
        return Path(this.value.slice(1));
    },
    add : function() {
        this.extend(arguments);
    }
});

