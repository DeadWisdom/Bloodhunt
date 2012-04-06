Stack = Tea.Stack.extend("Stack", {
    options: {
        cls: 'stack',
        skin: 'Stack.Skin',
        shift: .5
    }
});

Stack.Skin = Tea.Stack.Skin.extend('Stack.Skin', {
    refresh : function( new_item )
    {
        var element = this.element;
        var items = element.items;
        var gutter = element.margin;
        var max_width = element.source.width() - 44;
        var width = gutter;
        
        var show = 0;
        
        for(var i = items.length-1; i >= 0; i--) {
            var item = items[i];
            item.resize();
            var w = (item.width || item.source.width()) + gutter;
            if (width + w > max_width && show > 0)
                break;
            width += w;
            show += 1;
        }
        
        var start = items.length - show;
        if (start > 0)
            var left = 0;
        else
            var left = (max_width - width) * element.shift;
        
        element.each(function(index, item) {
            if (index < start) {
                if (item.collapsable) {
                    item.collapse();
                    left += item.source.width();
                } else {
                    item.source.hide().css('left', 0 - item.source.width() - gutter);
                }
                return;
            } else if (item.collapsable) {
                item.expand();
            }
            
            if (item == new_item)
                item.source.css({
                  left: left,
                  opacity: 0
                });
            
            item.source
                .stop(true, true)
                .show()
                .css('position', 'absolute')
                .css('width', item.width)
                .animate({
                    left: left,
                    opacity: 1
                });
            
            left += (item.source.width() + gutter);
            
        });
        
        this.refreshHeights();
        
    },
    refreshHeights : function() {
        var heighest = 0;
        this.element.each(function(index, item) {
            if (item.source.height() > heighest)
                heighest = item.source.height();
        });
        this.source.height(heighest);
    }
})