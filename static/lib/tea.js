
var Tea={root:''};Tea.require=function()
{for(var i=0;i<arguments.length;i++)
{var src=Tea.root+arguments[i];if(Tea.require.map[src])
return;Tea.require.map[src]=true;try{extension=src.match(/.*?\.(js|css)/i)[1];}catch(e){throw"Can only import .css or .js files, not whatever this is: "+src;}
if(extension=='js')
document.write('<script type="text/javascript" src="'+src+'"></script>\n');else if(extension=='css')
document.write('<link rel="stylesheet" href="'+src+'" type="text/css"/>\n');}}
Tea.require.map={}
jQuery.fn.be=function(type,options)
{var options=options||{};options.source=this;if(typeof type=='string')type=Tea.getClass(type);var obj=new type(options);obj.render();return obj;}
Tea.classes={};Tea.registerClass=function(name,type){Tea.classes[name]=type}
Tea.getClass=function(cls)
{if(jQuery.isFunction(cls))return cls;return Tea.classes[cls];}
Tea.isInstance=function(instance,cls)
{if(!cls.prototype)return false;for(var p=cls.prototype;p.supertype;p=p.supertype)
if(p.constructor==cls)
return true;return false;}
Tea.overrideMethod=function(super_func,func)
{return function()
{this.__super__=function(){return super_func.apply(this,arguments)};var r=func.apply(this,arguments);delete this.__super__;return r;}}
Tea.manifest=function(obj,spill_over)
{var className=null;if(spill_over){className=obj;obj=spill_over;}
if(obj instanceof Tea.Object)return obj;if(typeof obj=='string'){obj=className||obj;cls=Tea.getClass(obj);if(!cls){throw new Error("Unable to find class: "+obj);}
obj=cls;}
if(jQuery.isFunction(obj))return obj();if(obj.constructor!=Object)return obj;className=obj.type||className;if(typeof className=='string')
cls=Tea.classes[className];if(!cls)
{throw new Error("Unable to instantiate object: "+className);}
return new cls(obj);}
Tea.extend=function(receiver,donator){$.each(donator,function(k,d){var r=receiver[k];if(jQuery.isFunction(d)&&jQuery.isFunction(r)){receiver[k]=Tea.overrideMethod(r,d);}else if(r instanceof Tea.Options){receiver[k]=jQuery.extend(new Tea.Options(r),d);}else{receiver[k]=d;}});}
Tea.Options=function(options){jQuery.extend(this,options);}
var _prototype=false;var _creating=false;var createInstance=function(cls,args)
{_creating=true;var instance=new cls();_creating=false;instance.constructor=cls;if(_prototype)return instance;instance.__init__.apply(instance,args);instance.init.apply(instance,args);if(jQuery.isFunction(instance.__postinit__))
instance.__postinit__();return instance;}
var extendClass=function(base,name,properties)
{if(properties==undefined&&typeof name!='string'){properties=name;name=null;}
_prototype=true;var prototype=createInstance(base);_prototype=false;Tea.extend(prototype,properties);var cls=function(){if(_creating)return this;return createInstance(cls,arguments);}
if(name)
cls.toString=function(){return'Tea.Class("'+name+'", ...)'};else
cls.toString=function(){return"Tea.Class(...)"};cls.toSource=cls.toString;cls.prototype=null;cls.extend=function(name,properties){return extendClass(cls,name,properties);}
cls.implements=function(properties){Tea.extend(prototype,properties);}
cls.prototype=prototype;cls.__name__=name;cls.__super__=base;if(name)
Tea.registerClass(name,cls);return cls;}
Tea.Object=function(){if(_creating)return this;return createInstance(Tea.Object,arguments);}
Tea.Object.extend=function(name,properties){return extendClass(Tea.Object,name,properties);}
Tea.Object.toString=function(){return'Tea.Class("object")'};Tea.Object.toSource=Tea.Object.toString;Tea.Object.__name__='object';Tea.Object.prototype={options:new Tea.Options(),__init__:function(options)
{this.options=jQuery.extend({},this.constructor.prototype.options);if(options)
Tea.extend(this.options,options);jQuery.extend(this,this.options);},init:function(){},toString:function()
{return(this.constructor.__name__||"Tea.Object");},bind:function(event,handler,args)
{if(!this.__events)this.__events={};if(!this.__events[event])this.__events[event]=[];this.__events[event].push([handler,args]);},unbind:function(event,handler){if(!this.__events)return;var handlers=this.__events[event];if(!handlers)return;if(handler){jQuery.each(handlers,function(i,pair){if(pair&&pair[0]==handler){handlers.splice(i,1);}});}else{delete this.__events[event];}},hook:function(target,event,func,args){if(!this.__hooks)this.__hooks=[];var handler=Tea.method(func,this);if(target instanceof Tea.Object){target.bind(event,handler,args);}else{target.on(event,null,args,handler);}
this.__hooks.push([target,event,handler]);},unhook:function(target)
{if(!this.__hooks)return;for(var i=0;i<this.__hooks.length;i++){var hook=this.__hooks[i];if(target!=hook[0])continue;var event=hook[1];var handler=hook[2];if(target instanceof Tea.Object)
target.unbind(event,handler);else
target.off(event,null,handler);}},unhookAll:function()
{if(!this.__hooks)return;while(this.__hooks.length>0){var hook=this.__hooks.pop();var target=hook[0];var event=hook[1];var handler=hook[2];if(target instanceof Tea.Object)
target.unbind(event,handler);else
target.off(event,null,handler);}},trigger:function(event,args){if(!this.__events)return;var handlers=this.__events[event];if(!handlers)return;if(!args)args=[];for(var i=0;i<handlers.length;i++)
{handlers[i][0].apply(this,(handlers[i][1]||[]).concat(args));}}};Tea.Class=Tea.Object.extend;Tea.registerClass('t-object',Tea.Object);Tea.Class=function(){return Tea.Object.extend.apply(this,arguments);}
Tea.Application=Tea.Class('t-app',{__init__:function(properties){if(properties)
$.extend(this,properties);},setup:function(properties)
{if(properties)$.extend(this,properties);var self=this;$(function(){self.ready.call(self)});},ready:function(properties){}})
Tea.toJSON=function(o)
{try{return JSON.stringify(o);}catch(e){};var type=typeof(o);if(o===null)
return"null";if(type=="undefined")
return undefined;if(type=="number"||type=="boolean")
return o+"";if(type=="string")
return Tea.quoteString(o);if(type=='object')
{if(typeof o.toJSON=="function")
return Tea.toJSON(o.toJSON());if(o.constructor===Date)
{var month=o.getUTCMonth()+1;if(month<10)month='0'+month;var day=o.getUTCDate();if(day<10)day='0'+day;var year=o.getUTCFullYear();var hours=o.getUTCHours();if(hours<10)hours='0'+hours;var minutes=o.getUTCMinutes();if(minutes<10)minutes='0'+minutes;var seconds=o.getUTCSeconds();if(seconds<10)seconds='0'+seconds;var milli=o.getUTCMilliseconds();if(milli<100)milli='0'+milli;if(milli<10)milli='0'+milli;return'"'+year+'-'+month+'-'+day+'T'+
hours+':'+minutes+':'+seconds+'.'+milli+'Z"';}
if(o.constructor===Array)
{var ret=[];for(var i=0;i<o.length;i++)
ret.push(Tea.toJSON(o[i])||"null");return"["+ret.join(",")+"]";}
var pairs=[];for(var k in o){var name;var type=typeof k;if(type=="number")
name='"'+k+'"';else if(type=="string")
name=Tea.quoteString(k);else
continue;if(typeof o[k]=="function")
continue;var val=Tea.toJSON(o[k]);pairs.push(name+":"+val);}
return"{"+pairs.join(", ")+"}";}};Tea.evalJSON=function(src)
{if(JSON&&JSON.parse)
return JSON.parse(src);return eval("("+src+")");};Tea.secureEvalJSON=function(src)
{if(JSON&&JSON.parse)
return JSON.parse(src);var filtered=src;filtered=filtered.replace(/\\["\\\/bfnrtu]/g,'@');filtered=filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']');filtered=filtered.replace(/(?:^|:|,)(?:\s*\[)+/g,'');if(/^[\],:{}\s]*$/.test(filtered))
return eval("("+src+")");else
throw new SyntaxError("Error parsing JSON, source is not valid.");};Tea.quoteString=function(string)
{if(Tea.quoteString.escapeable.test(string))
{return'"'+string.replace(Tea.quoteString.escapeable,function(a)
{var c=Tea.quoteString.meta[a];if(typeof c==='string')return c;c=a.charCodeAt();return'\\u00'+Math.floor(c/16).toString(16)+(c%16).toString(16);})+'"';}
return'"'+string+'"';};Tea.quoteString.escapeable=/["\\\x00-\x1f\x7f-\x9f]/g;Tea.quoteString.meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'};Tea.ajax=function(options,overriding)
{var options=jQuery.extend({},Tea._ajax_default,options,overriding);var error=options.error;options.error=function(response,status,e)
{if(status=='error')
{console.group('Server Error');console.log(response.responseText);console.groupEnd();}
if(jQuery.isFunction(error))
return error.apply(options.context||window,context)}
return jQuery.ajax(options);}
Tea._ajax_default={url:null,method:'get',data:{},dataType:'json',context:null,};Tea.deselect=function()
{if(document.selection)
document.selection.empty();else if(window.getSelection)
window.getSelection().removeAllRanges();}
Tea.method=function(func,context)
{return function(){return func.apply(context,arguments);}}
Tea.latent=function(milliseconds,func,context)
{var timeout=null;var args=null;context=context||this;function call()
{clearTimeout(timeout);timeout=null;func.apply(context,args);}
function refresh(new_milliseconds)
{milliseconds=new_milliseconds||milliseconds;if(timeout)
clearTimeout(timeout);timeout=setTimeout(call,milliseconds)}
function trip()
{call();refresh();}
function cancel()
{if(timeout)
clearTimeout(timeout);timeout=null;}
var self=function()
{args=arguments;refresh();}
self.trip=trip;self.call=call;self.refresh=refresh;self.cancel=cancel;return self;}
Tea.Element=Tea.Class('t-element',{options:{source:'<div/>',skin:'t-skin',id:null,html:null,cls:null,hidden:false,appendTo:null,attrs:{},style:null,width:null,height:null,resizeMaster:false,anchor:null,behaviors:null},__postinit__:function()
{if(this.appendTo)
this.render().appendTo(this.appendTo);},__init__:function(options){this.__rendered=false;this.__super__(options);this.parent=null;this.source=$(this.source);},render:function(source){if(this.__rendered)return this.source;var skin=Tea.manifest(this.skin);skin.attach(this);if(source)
this.source=this.skin.render($(source));else
this.source=this.skin.render();this.__rendered=true;this.onRender();var behaviors=this.behaviors;var self=this;if(behaviors){this.behaviors=jQuery.map(behaviors,function(b){b=Tea.manifest(b);b.attach(self);return b;})}
if(this.source.closest('html').length>0)
this.resize();return this.source;},onRender:function()
{},isRendered:function()
{return this.__rendered;},remove:function()
{if(this.parent)
return this.parent.removeItem(this);if(this.isRendered())
this.skin.remove();this.trigger('remove',this,this.parent);this.__rendered=false;this.unhookAll();},hide:function()
{this.setHidden(true);},show:function()
{this.setHidden(false);},setHidden:function(flag)
{if(this.isRendered())
this.skin.setHidden(flag);this.hidden=flag;},setHTML:function(html)
{if(this.isRendered())
this.skin.setHTML(html);this.html=html;},getHTML:function()
{if(this.isRendered())
return this.skin.getHTML();return this.html;},findParent:function(type){var now=this.parent;while(now){if(now instanceof type){return now;}
now=now.parent;}
throw new Error("Cannot find owner of the requested type");},resize:function()
{if(this.isRendered())
return this.skin.resize();}});Tea.Skin=Tea.Class('t-skin',{options:{},__init__:function(options)
{this.element=null;this.source=null;this.__super__();},attach:function(element){this.element=element;element.skin=this;},render:function(source){var element=this.element;var source=this.source=element.source=$(source||element.source);if(element.id)source.attr('id',element.id);if(element.cls)source.addClass(element.cls);if(this.cls)source.addClass(this.cls);if(element.html)this.setHTML(element.html);if(element.style)source.css(element.style);if(element.width!=null)source.css('width',element.width);if(element.height!=null)source.css('height',element.height);if(element.attrs)
for(a in element.attrs)
source.attr(a,element.attrs[a]);if(element.hidden)
source.hide();if(element.resizeMaster){jQuery(window).resize(Tea.method(element.resize,element));element.resize();}
return source;},remove:function(){if(this.element.isRendered())
this.source.remove();this.element.__rendered=false;this.source=this.options.source;this.unhookAll();},setHTML:function(src)
{this.source.html(src);},getHTML:function()
{return this.source.html();},setHidden:function(flag)
{if(flag)
this.source.hide();else
this.source.show();},resize:function(){}})
Tea.Container=Tea.Element.extend('t-container',{options:{items:null,skin:'t-container-skin',layout:null},__init__:function(options)
{this.__super__(options);var items=jQuery.makeArray(this.items);this.items=[];var container=this;jQuery.each(items,function(index,item){container.append(item);})},own:function(item)
{item=Tea.manifest(item);if(item.parent)
item.remove();item.parent=this;return item;},setValue:function(value)
{if(value==null||value==undefined)return;for(var i=0;i<this.items.length;i++){var k=this.items[i].name;if(value[k]!=undefined){this.items[i].setValue(value[k]);}}},getValue:function()
{var gather={};for(var i=0;i<this.items.length;i++){var item=this.items[i];if(item.name&&jQuery.isFunction(item.getValue))
gather[item.name]=item.getValue();}
return gather;},append:function(item)
{if(item==null||item==undefined)return null;if(item.parent==this)
return item;item=this.own(item);item._index=this.items.length;this.items.push(item);if(this.isRendered()){this.skin.append(item.render());this.resize();}
return item;},insert:function(pos,item)
{if(typeof pos!='number')throw new Error("Recieved a non-number for the 'pos' argument in insert(pos, item).");if(pos>=this.items.length)
return this.append(item);if(item.parent==this)
return item;item=this.own(item);this.items.splice(pos,0,item);for(var i=0;i<this.items.length;i++)
this.items[i]._index=i;if(this.isRendered())
{if(item._index==0)
this.skin.prepend(item.render())
else
this.skin.after(this.items[item._index-1].source,item.render());this.resize();}
return item;},prepend:function(item)
{if(item.parent==this)
return item;return this.insert(0,item);},removeItem:function(item)
{if(item.parent!==this)return;this.items.splice(item._index,1);item.parent=null;item.remove();for(var i=0;i<this.items.length;i++)
this.items[i]._index=i;},remove:function(){this.__super__();this.empty();},empty:function()
{while(this.items.length>0){var item=this.items.pop();item.parent=null;item.remove();}
this.items=[];},clear:function()
{while(this.items.length>0){var item=this.items.pop();item.parent=null;item.remove();}
this.items=[];},each:function(func,context)
{context=context||this;jQuery.each(this.items,function(){func.apply(context,arguments)});},resize:function()
{this.__super__();this.each(function(i,item){item.resize();});}})
Tea.Container.Skin=Tea.Skin.extend('t-container-skin',{render:function(source)
{var source=this.__super__(source);var items=this.element.items;for(var i=0;i<items.length;i++)
this.append(items[i].render());if(this.element.layout)
this.element.layout=Tea.manifest(this.element.layout);return source;},append:function(src)
{this.source.append(src);},prepend:function(src)
{this.source.prepend(src);},after:function(pivot,src)
{pivot.after(src);},resize:function(){if(this.element.layout)return this.element.layout.resize(this.element);}});Tea.Layout=Tea.Class('t-layout',{resize:function(container)
{},getSize:function(size){if(size=='fill')return 0;if(!size)return 0;return size;}});Tea.Layout.VSplit=Tea.Layout.extend('t-vsplit',{resize:function(container){var heights=0;var fills=0;var sz=0;var getSize=this.getSize;var content=null;container.each(function(i,item){if(!item.isRendered())return;if(!content)content=item.source.offsetParent();heights+=getSize(item.height);if(item.height=='fill')fills+=1;sz+=1;});var wiggle=content.height()-heights-2;var fill=wiggle/fills;var last=0;container.each(function(i,item){if(!item.isRendered())return;var source=item.source;var height=(item.height=='fill'?fill:item.height);source.css({position:'absolute',top:last,height:height,left:0,right:0})
last=last+height+1;})}})
Tea.Panel=Tea.Container.extend('t-panel',{options:{title:'',closable:false,top:null,bottom:null,skin:'t-panel-skin'},setTop:function(bar){if(this.isRendered())
this.top=bar;else
this.skin.setBar('top',bar);},setBottom:function(bar){if(this.isRendered())
this.bottom=bar;else
this.skin.setBar('bottom',bar);},setTitle:function(title)
{this.title=title;if(this.isRendered())
this.skin.setTitle(title);else
this.title=title;},getTitle:function()
{return this.title;},close:function()
{this.trigger('close');},focus:function(){this.skin.focus();},blur:function(){this.skin.blur();},hasFocus:function(){return this.skin.hasFocus();}});Tea.Panel.focus=null;Tea.Panel.Skin=Tea.Container.Skin.extend('t-panel-skin',{options:{cls:'t-panel'},render:function(source){var element=this.element;this.content=$("<div class='t-content'/>");this.title=$("<div class='t-title'/>").append(element.title||'');var anchor=this.anchor=$("<a class='t-focuser' href='#'>&#160;</a>");anchor.has_focus=false;this.hook(this.anchor,'focus',function(){anchor.has_focus=true;element.source.addClass('t-focus');element.trigger('focus')
Tea.Panel.focus=element;});this.hook(this.anchor,'blur',function(){anchor.has_focus=false;element.source.removeClass('t-focus');element.trigger('blur')
Tea.Panel.focus=null;});var source=this.__super__(source);source.append(this.anchor);source.append(this.title);source.append(this.content);if(element.closable)
this.closer=$("<div class='t-close t-icon icon-close'></div>").appendTo(source).click(function(){element.close()});if(element.top)
this.setBar('top',element.top);if(element.bottom)
this.setBar('bottom',element.bottom);return source;},setBar:function(position,bar){var element=this.element;var existing=element[position];if(existing instanceof Tea.Object){if(existing.parent)
existing.remove();this.source.removeClass('t-has-'+position);}
element[position]=null;if(!bar)return;if(jQuery.isArray(bar))
bar={type:'t-container',items:bar,cls:'t-bar t-'+position};var bar=element[position]=Tea.manifest(bar);bar.each(function(i,item){item.context=item.context||element;});bar.panel=element;if(position=='top')
this.content.before(bar.render());else
this.content.after(bar.render());this.hook(this,'remove',function(){bar.remove()});this.source.addClass('t-has-'+position);},setTitle:function(title)
{this.title.empty().append(title);},append:function(src)
{this.content.append(src);},prepend:function(src)
{this.content.prepend(src);},setHTML:function(src)
{this.content.empty().append(src);},focus:function()
{if(!this.isRendered())
{var self=this;setTimeout(function(){self.anchor.focus();});}
this.anchor.focus();},blur:function()
{this.anchor.blur();},hasFocus:function(){return this.anchor.hasFocus;},remove:function(){if(this.element.top)
this.setBar('top',null);if(this.element.bottom)
this.setBar('bottom',null);this.__super__();}});Tea.Dialog=Tea.Panel.extend('t-dialog',{options:{placement:'top',opacity:1,easing:'swing',speed:'normal',appendTo:null,time:null,scrim:null,resizeMaster:true,skin:'t-dialog-skin'},__init__:function(options)
{this.__super__(options);if(this.scrim==true)
this.scrim=Tea.Scrim();},show:function()
{if(!this.isRendered())
this.render();if(this.scrim)
this.scrim.show();this.skin.show();return this.source;},hide:function()
{if(this.isRendered())
this.skin.hide();if(this.scrim)
this.scrim.hide();},onEscape:function(){this.hide();},onEnter:function(e)
{}})
Tea.Dialog.Skin=Tea.Panel.Skin.extend('t-dialog-skin',{options:{cls:'t-dialog t-panel'},resize:function(speed)
{var element=this.element;var source=this.source.stop();var height=source.height();if(height>$(document).height()-8)
source.height($(document).height()-8);if(element.placement=='top')
source.animate({top:20,opacity:element.opacity},speed||element.speed,element.easing);else if(element.placement=='center')
source.animate({top:$(document).height()/2.5-source.height()/2,opacity:element.opacity},speed||element.speed,element.easing);},show:function()
{var element=this.element;var source=this.source;source.appendTo(element.appendTo||document.body);source.show();source.css('opacity',0);source.css('position','fixed');source.css('top',-source.height());source.css('left',$(document).width()/2-source.width()/2);this.resize();if(element.time)
{var self=this;setTimeout(function(){self.hide()},element.time);}
$(document).keydown(function(e){if(e.keyCode==13)
element.onEnter(e);if(e.keyCode==27)
element.onEscape(e);})},hide:function()
{var self=this;var source=this.source;source.fadeOut(this.element.speed,function(){source.remove()});}})
Tea.Scrim=Tea.Element.extend('t-scrim',{options:{cls:'t-scrim'},show:function()
{if(!this.isRendered())
this.render().appendTo(this.frame||document.body);var source=this.source;source.hide().fadeTo('fast',.6);source.click(Tea.method(this.hide,this));},hide:function()
{this.remove();}})
Tea.Input=Tea.Element.extend('t-input',{options:{value:null,hasFocus:false,disabled:false,name:null},render:function(source)
{source=this.__super__(source);this.setValue(this.value);if(this.name)
source.attr('name',this.name);return source;},getValue:function()
{if(this.isRendered())
return this.skin.getValue();return this.value;},setValue:function(v)
{if(this.isRendered())
return this.skin.setValue(v);this.value=v;},isValid:function()
{return true;},focus:function()
{if(this.isRendered())
this.skin.setFocus(true);else
this.hasFocus=true;},blur:function()
{if(this.isRendered())
this.skin.setFocus(false);else
this.hasFocus=false;},disable:function()
{if(this.isRendered())
this.skin.setDisabled(true);else
this.disabled=true;},enable:function()
{if(this.isRendered())
this.skin.setDisabled(false);else
this.disabled=false;}});Tea.TextInput=Tea.Input.extend('t-text-input',{options:{source:'<input>',skin:'t-text-input-skin',blank:true,re:null,password:false,maxlength:null,emptyText:null,input_type:'text',placeholder:null},isValid:function()
{var value=this.getValue();if(!this.blank&&jQuery.trim(value)=="")
return false;if(this.re&&!(this.re instanceof RegExp))
this.re=new RegExp(this.re);if(this.re&&!this.re.test(value))
return false;if(this.maxlength&&value.length>this.maxlength)
return false;return true;}});Tea.PasswordInput=Tea.TextInput.extend('t-password-input',{options:{input_type:'password'}});Tea.TextInput.Skin=Tea.Skin.extend('t-text-input-skin',{render:function(source)
{this.empty=false;var element=this.element;source=this.__super__(source);source.attr('type',this.element.input_type);if(this.element.placeholder)
source.attr('placeholder',this.element.placeholder);if(element.maxlength)
source.attr('maxlength',this.element.maxlength);if(element.emptyText)
this.setupEmptyText(element.emptyText);if(element.name)
source.attr('name',element.name);if(element.hasFocus)
this.setFocus(true);if(element.disabled)
this.setDisabled(true);return source;},setFocus:function(flag)
{if(flag)
this.source.focus();else
this.source.blur();},setValue:function(val)
{this.source.val(val);if(this.emptyText)
this.refreshEmpty();},getValue:function()
{if(this.empty)return"";return this.source.val();},setupEmptyText:function(t)
{this.emptyText=t;this.source.blur(Tea.method(this.refreshEmpty,this));this.source.focus(Tea.method(this.clearEmpty,this));this.refreshEmpty();},refreshEmpty:function()
{var val=jQuery.trim(this.source.val());if(val=='')
{this.empty=true;this.source.val(this.emptyText);this.source.addClass('t-empty');}
else
{this.empty=false;this.source.removeClass('t-empty');}},clearEmpty:function()
{if(this.empty)
{this.source.val("");this.source.removeClass('t-empty');this.empty=false;}},setDisabled:function(flag){if(flag){this.source.addClass('t-disabled');this.source.attr('readonly','readonly');}else{this.source.removeClass('t-disabled');this.source.attr('readonly',null);}}});Tea.TextAreaInput=Tea.Input.extend('t-textarea-input',{options:{source:'<textarea>',skin:'t-textarea-input-skin',blank:true},isValid:function()
{var value=this.getValue();if(!this.blank&&jQuery.trim(value)=="")
return false;return true;}});Tea.TextAreaInput.Skin=Tea.Skin.extend('t-textarea-input-skin',{render:function(source){var element=this.element;source=this.__super__(source);if(element.hasFocus)
this.setFocus(true);return source;},setFocus:function(flag)
{if(flag)
this.source.focus();else
this.source.blur();},setValue:function(val)
{this.source.val(val);},getValue:function()
{return this.source.val();}});Tea.SelectInput=Tea.Input.extend('t-select-input',{options:{source:'<select/>',skin:'t-select-input-skin',choices:null}});Tea.SelectInput.Skin=Tea.Skin.extend('t-select-input-skin',{render:function(source)
{source=this.__super__(source);var index_to_value=this.index_to_value={};var value_to_index=this.value_to_index={};jQuery.each(this.element.choices,function(index,choice){var display,value;if(choice.constructor===Array)
{value=choice[0];display=choice[1];}
else
{display=value=choice;}
index_to_value[index]=value;value_to_index[value]=index;$('<option/>').html(display).appendTo(source);});return source;},getValue:function()
{return this.index_to_value[this.source[0].selectedIndex];},setValue:function(v)
{var index=this.value_to_index[v];if(index==undefined)return;this.source[0].selectedIndex=index;},setFocus:function(flag)
{if(flag)
this.source.focus();else
this.source.blur();}});Tea.CheckBoxInput=Tea.Input.extend('t-checkbox-input',{options:{source:'<input type="checkbox"/>',skin:'t-checkbox-input-skin',choices:null}});Tea.CheckBoxInput.Skin=Tea.Skin.extend('t-checkbox-input-skin',{getValue:function()
{return this.source.attr('checked')=='checked';},setValue:function(v)
{if(v)
this.source.attr('checked','checked');else
this.source.removeAttr('checked');},setFocus:function(flag)
{if(flag)
this.source.focus();else
this.source.blur();}});Tea.Field=Tea.Element.extend('t-field',{options:{label:null,input:null,erorr:null,value:null,name:null,skin:'t-field-skin'},__init__:function(options)
{this.__super__(options);var opts=this.getInputOptions();this.input=Tea.manifest(opts);},getInputOptions:function(){var options=this.input||{};options.name=this.name;options.value=this.value;return options;},setLabel:function(html)
{if(this.isRendered())
this.skin.setLabel(html);this.label=html;},getLabel:function()
{if(this.isRendered())
return this.skin.getLabel();return this.label;},setValue:function(v)
{if(this.input)
this.input.setValue(v);this.value=v;},getValue:function()
{if(this.input)
return this.input.getValue();return this.value;},setError:function(e)
{if(this.isRendered())
this.skin.setError(e);this.error=e;},getError:function()
{if(this.isRendered())
return this.skin.getError();return this.error;},clearError:function()
{if(this.isRendered())
return this.skin.clearError();this.error=null;},isValid:function()
{if(this.input)
return this.input.isValid();return true;},focus:function()
{if(this.input)
this.input.focus();},blur:function()
{if(this.input)
this.input.blur();},disable:function(){if(this.input)
this.input.disable();},enable:function(){if(this.input)
this.input.enable();}})
Tea.Field.Skin=Tea.Skin.extend('t-field-skin',{options:{cls:'t-field'},render:function(source)
{var element=this.element;source=this.__super__(source);if(element.label!=null)
this.setLabel(element.label);else
this.label=null;if(element.input!=null)
element.input.render().appendTo(source);if(this.label){this.label.click(function(){if(element.input&&element.input.focus)element.input.focus()});if(element.clickToggles)
this.label.click(function(){element.setValue(!element.getValue());});}
this.error=$('<div class="t-error">');return source;},setLabel:function(html)
{if(!this.label)
this.label=$('<label>').prependTo(this.source);this.label.html(html);},getLabel:function()
{if(this.label)
return this.label.html();return null;},setError:function(html)
{this.clearError();if(html!=null)
this.error.appendTo(this.source).html(html);},getError:function()
{return this.error.html();},clearError:function()
{this.error.html("").remove();}});Tea.TextField=Tea.Field.extend('t-text',{options:{input:{type:'t-text-input'},blank:true,re:null,password:false,maxlength:null,emptyText:null,autocompelte:true},getInputOptions:function(){var options=this.__super__();options.blank=this.blank;options.re=this.re;options.password=this.password;options.maxlength=this.maxlength;options.emptyText=this.emptyText;options.attrs=this.autocomplete?{}:{autocomplete:'off'};return options;}});Tea.PasswordField=Tea.TextField.extend('t-password',{options:{password:true}});Tea.TextAreaField=Tea.Field.extend('t-textarea',{options:{input:{type:'t-textarea-input'},blank:true,value:null},getInputOptions:function(){var options=this.__super__();options.blank=this.blank;return options;}});Tea.SelectField=Tea.Field.extend('t-select',{options:{input:{type:'t-select-input'},choices:[]},getInputOptions:function(){var options=this.__super__();options.choices=this.choices;return options;}});Tea.CheckBoxField=Tea.Field.extend('t-checkbox',{options:{input:{type:'t-checkbox-input'},clickToggles:true}})
Tea.List=Tea.Container.extend('t-list',{options:{item:null,cls:'t-list'},createItem:function(value){if(value instanceof Tea.Element)
return value;return this.item({value:value});},setValue:function(value){this.value=value;var self=this;this.empty();jQuery.each(value,function(index,value){self.add(value);});},getValue:function(){var value=[];this.each(function(index,item){value.push(item.getValue());})
return value;},add:function(value)
{this.append(this.createItem(value));}});Tea.Stack=Tea.Container.extend('t-stack',{options:{skin:'t-stack-skin',margin:0,},__init__:function(options)
{this.__super__(options);this.paused=1;},render:function(source)
{var self=this;setTimeout(function(){self.refresh()},100);this.paused=0;return this.__super__(source);},append:function(item)
{item=this.__super__(item);this.refresh(item);return item;},insert:function(pos,item)
{this.__super__(pos,item);this.refresh(item);},push:function(item,after)
{if(item.parent==this)
return item;if(after)
{this.pause();this.popAfter(after);this.play();}
return this.append(item);},pop:function(item)
{this.pause();if(item)
this.popAfter(item);else
item=this.items[this.items.length-1]
this.removeItem(item);this.play();this.refresh();return item;},own:function(item)
{var item=this.__super__(item);var self=this;this.hook(item,'close',function()
{self.pop(item);})
return item;},popAfter:function(item,norefresh)
{if(item.parent!==this)return;this.pause();while(this.items.length>item._index+1)
this.removeItem(this.items[item._index+1]);this.play();if(!norefresh)this.refresh();},refresh:function(panel)
{if(!this.isRendered()||this.paused>0)return;this.skin.refresh(panel);},remove:function(item)
{this.__super__(item);if(item)
this.refresh();},pause:function()
{this.paused+=1;},play:function()
{this.paused-=1;if(this.paused<0)this.paused=0;}})
Tea.Stack.Skin=Tea.Container.Skin.extend('t-stack-skin',{options:{cls:'t-stack',},render:function(source)
{source=this.__super__(source);$(window).resize(Tea.method(this.refresh,this));return source;},refresh:function(new_item)
{var element=this.element;var items=element.items;var gutter=element.margin;var max_width=element.source.width();var width=gutter;var show=0;for(var i=items.length-1;i>=0;i--){var item=items[i];var w=item.source.width()+gutter;if(width+w>max_width&&show>0)
break;width+=w;show+=1;}
var start=items.length-show;var left=gutter;element.each(function(index,item){if(index<start){item.source.hide().css('left',0-item.source.width()-gutter);return;}
if(item==new_item)
item.source.css({left:left,opacity:0});item.source.stop(true,true).show().css('position','absolute').animate({left:left,opacity:1});left+=(item.source.width()+gutter);});}});Tea.pushStack=function(element,requester)
{var now=requester.parent;var child=requester;while(now){if(now instanceof Tea.Stack){return now.push(element,child);}
child=now;now=now.parent;}
throw new Error("Cannot find the stack owner of the requester on Tea.pushStack.");}
Tea.Template=Tea.Class({options:{re:/{{\s*(.*?)\s*}}/g,html_encode:false,missing_throws:false},__init__:function(src,options)
{this.src=src;this.__super__(options);},apply:function(context)
{var self=this;return this.src.replace(this.re,function(match,group,index,full)
{return self.getVar(group,context);});},getVar:function(variable,context)
{if(!variable)
throw new Error("Empty group in template.");var path=variable.split('.');var value=context;var candidate=null;for(var i=0;i<path.length;i++)
{if(path[i]=='*')continue;candidate=value[parseInt(path[i])];if(candidate!=undefined)
value=candidate;else
value=value[path[i]];if(value==undefined)
if(this.missing_throws)
throw new Error("Unable to find variable in context: "+path.join("."));else
value='';}
if(this.html_encode)
value=value.replace(/&/g,'&amp;').replace(/\</g,'&lt;').replace(/\>/g,'&gt;');return value;}})
Tea.Testing={};Tea.Testing.suites=[];try
{console.log.prototype;}catch(e){fn=function(){};console={log:fn,group:fn,groupEnd:fn,error:fn,debug:fn}}
Tea.Testing.run=function(suite,test)
{Tea._testing=true;jQuery.ajaxSetup({async:false});var suites=Tea.Testing.suites;var count=0;var passed=0;for(var i=0;i<suites.length;i++)
{if(suite&&suites[i].name!=suite)continue;var results=suites[i].run(test);count+=results[0];passed+=results[1];}
if(count==passed)
console.log("Passed.");else
console.log("Failed. %s of %s passed.",passed,count);jQuery.ajaxSetup({async:true});Tea._testing=false;return{count:count,passed:passed};}
Tea.Testing.fail=function(msg)
{var e=new Error(msg);e.failure=true;throw e;}
function assertEqual(a,b,msg)
{if(a==b)return;if(a==undefined)a='undefined';if(b==undefined)b='undefined';Tea.Testing.fail(msg||("assertEqual failed: "+a.toString()+' != '+b.toString()));}
function assert(a,msg)
{if(a)return;Tea.Testing.fail(msg||'assertion failed.');}
Tea.Testing.Suite=Tea.Class('test-suite',{__init__:function(attrs)
{this._tests=[];for(var k in attrs)
{this[k]=attrs[k];if(k=='teardown')continue;if(k=='setup')continue;if(k[0]=='_')continue;if(typeof attrs[k]=='function')
this._tests.push(new Tea.Testing.Test(k,attrs[k]));}
if(!this.name)
throw new Error("Unable to build test suite, it was not given a name attribute.");Tea.Testing.suites.push(this);},run:function(test)
{this._passed=0;console.group(this.name);if(this.setup)
{try{this.setup.call(this);}
catch(e){console.error('Error setting up suite.');console.error(e);console.groupEnd();return[1,0];}}
for(var i=0;i<this._tests.length;i++)
{if(test&&this._tests[i].name!=test)continue;this._tests[i].run(this,test==this._tests[i].name);}
if(this.teardown)
{try{this.teardown.call(this);}
catch(e){console.error('Error tearing down suite.');}}
if(this._passed==this._tests.length)
console.log("All of %s passed.",this._tests.length);else
console.log("%s of %s passed.",this._passed,this._tests.length);console.groupEnd();return[this._tests.length,this._passed];}});Tea.Testing.Test=Tea.Class('test',{__init__:function(name,entry)
{this.name=name;this.entry=entry;this.status=null;this.comment=null;},run:function(suite,let)
{try
{this.entry.call(suite);this.status='.';suite._passed+=1;}
catch(e)
{pass=false;if(let)
throw e;if(e.failure)
{this.status='F';this.comment=e.message;console.error("%s Failed - %s: %s\n",this.name,e.name,e.message,Tea.Testing.trace(e));}
else
{this.status='E';this.comment=e.message;console.error("%s Threw - %s: %s\n",this.name,e.name,e.message,Tea.Testing.trace(e));}}}});Tea.Testing.trace=function(e)
{if(!e.stack)
return e.sourceURL+":"+e.line;var split=e.stack.split('\n');var frames=[];for(var i=0;i<split.length;i++)
{var frame=split[i];frames.push(frame.split('@').reverse().join(" - "));}
return frames.join("\n");}
Tea.Testing.setupAjax=function(responses)
{Tea.Testing.ajaxCalls=[];Tea.Testing._ajax=jQuery.ajax;jQuery.ajax=function(options)
{Tea.Testing.ajaxCalls.push(options);try{var response=responses[options.url](options);}catch(e){console.error("Unable to find url in the responses: %s",options.url);throw e;}
options.success.call(this,response);}}
Tea.Testing.teardownAjax=function()
{jQuery.ajax=Tea.Testing._ajax}
Tea.Widget={}
Tea.Button=Tea.Element.extend('t-button',{options:{source:'<a>',text:'',icon:'',disabled:false,context:null,hasFocus:null,skin:'t-button-skin',href:null},__init__:function(options)
{this.__super__(options);if(this.text)
this.setText(this.text);if(this.icon)
this.setIcon(this.icon);},render:function(source)
{source=this.__super__(source);this.setDisabled(this.disabled);if(this.text)
this.skin.setText(this.text);if(this.icon)
this.skin.setIcon(this.icon);return source;},focus:function()
{this.hasFocus=true;if(this.isRendered())
this.skin.setFocus(true);},blur:function(){this.hasFocus=false;if(this.isRendered())
this.skin.setFocus(false);},setText:function(text)
{this.text=text;if(this.isRendered())
this.skin.setText(text);},getText:function()
{return this.text;},setIcon:function(icon)
{this.icon=icon;if(this.isRendered())
this.skin.setIcon(icon);},getHref:function()
{return this.href;},setHref:function(href)
{this.href=href;if(this.isRendered())
this.skin.setHref(href);},getIcon:function()
{return this.icon;},disable:function()
{this.setDisabled(true);},enable:function()
{this.setDisabled(false);},setDisabled:function(bool)
{this.disabled=bool;if(this.isRendered())
this.skin.setDisabled(this.disabled=bool);else
this.disabled=bool;},performClick:function(e)
{this.trigger('click',[e]);if(!this.click&&this.href)return true;if(!this.click)return false;if(this.disabled)return false;var context=this.context||this;try{if(typeof(this.click)=='string')return context[this.click].apply(context);if(jQuery.isFunction(this.click))return this.click.apply(context);}catch(e){if(console&&console.error)
console.error(e);}
return false;}})
Tea.Button.Skin=Tea.Skin.extend('t-button-skin',{options:{cls:'t-button'},render:function(source){var element=this.element;this.icon=$("<div class='t-icon'/>").addClass(element.icon);this.text=$("<div class='t-text'/>").append(element.text||'');source=this.__super__(source);source.append(this.icon);source.append(this.text);source.mousedown(function(){if(!element.disabled)
source.addClass('t-active')});source.bind('mouseup mouseout',function(){source.removeClass('t-active');});source.focus(function(){element.hasFocus=true;source.addClass('t-focus');});source.blur(function(){element.hasFocus=false;source.removeClass('t-focus');});source.bind('click touch',Tea.method(element.performClick,element));if(element.href)
this.setHref(element.href);return source;},setFocus:function(flag){if(flag)
this.source.focus();else
this.source.blur();},setText:function(text)
{this.text.empty().append(text);},setHref:function(href){this.source.attr('href',href);},setIcon:function(icon)
{if(this.iconCls)
this.icon.removeClass(this.iconCls);this.icon.addClass(this.iconCls='icon-'+icon);},setDisabled:function(bool)
{if(bool)
this.source.addClass('t-disabled');else
this.source.removeClass('t-disabled');}});Tea.Tree=Tea.Container.extend('t-tree',{options:{expanded:false,icon:null,text:null,skin:'Tea.Tree.Skin',context:null},expand:function(){this.expanded=true;if(this.isRendered())
this.skin.setExpanded(true);},collapse:function(){this.expanded=false;if(this.isRendered())
this.skin.setExpanded(false);},setExpanded:function(flag){if(flag)return this.expand();return this.collapse();},clickAnchor:function(){this.setExpanded(!this.expanded);},setText:function(src){this.text=src;if(this.isRendered())
this.skin.setText(src);},setIcon:function(icon){this.icon=icon;if(this.isRendered())
this.skin.setIcon(icon);},remove:function(item)
{this.__super__(item);this.setExpanded(this.expanded);},empty:function()
{this.__super__();this.setExpanded(this.expanded);},walk:function(func)
{if(!this.items)return;for(var i=0;i<this.items.length;i++){var item=this.items[i];func.call(this,item);var next=item.walk;if($.isFunction(next))next.call(item,func);}}});Tea.Tree.Skin=Tea.Container.Skin.extend('Tea.Tree.Skin',{options:{cls:'t-tree'},render:function(source){this.head=$('<div class="t-head">');this.tail=$('<div class="t-tail">');source=this.__super__(source);source.append(this.head).append(this.tail);this.button=Tea.manifest({type:'t-button',text:this.element.text,icon:this.element.icon,click:this.element.click?Tea.method(this.element.click||jQuery.noop,this.element.context||this.element):null,href:this.element.href});this.button.render().appendTo(this.head);if(this.element.text==null)
this.button.hide();this.anchor=$('<div class="t-anchor t-icon">').prependTo(this.button.source).click(Tea.method(this.clickAnchor,this));this.setExpanded(this.element.expanded);return source;},append:function(src){this.tail.append(src);if(this.anchor)
this.setExpanded(this.element.expanded);},prepend:function(src){this.tail.prepend(src);if(this.anchor)
this.setExpanded(this.element.expanded);},setText:function(src){this.button.setText(src);if(src==null){this.button.hide();}else{this.button.show();}},setIcon:function(icon){this.button.setIcon(icon);},setExpanded:function(flag){if(this.element.items.length==0){this.setAnchor(null);this.tail.hide();return;}
if(flag==null)
this.setAnchor(null);else if(flag)
this.setAnchor('collapse');else
this.setAnchor('expand');if(flag)this.tail.slideDown('fast');else this.tail.hide();},clickAnchor:function(){this.element.clickAnchor();return false;},setAnchor:function(anchor){this.anchor[0].className='t-anchor t-icon';if(anchor){this.anchor.addClass(anchor);this.anchor.addClass('icon-'+anchor);}}})
Tea.Drag=Tea.Class('Tea.Drag',{__init__:function(options)
{this.__super__(options);this.active=null;var self=this;$(document.body).mousemove(function(e){if(self.active)
self.active.update(e);});$(document.body).mouseup(function(e){if(self.active)
self.active.end(e);});this.overlay=$('.t-overlay');if(this.overlay.length==0)
this.overlay=$('<div class="t-overlay t-medium"/>').appendTo(document.body).hide();Tea.Drag=this;},init:function(){}})
Tea.Drag.init=function()
{if(typeof Tea.Drag=='function')
new Tea.Drag();}
Tea.Draggable=Tea.Class('Tea.Draggable',{options:{cls:null,ghost:null,threshold:5,snapToCursor:true},attach:function(element)
{Tea.Drag.init();var self=this;this.hook(element.source,'mousedown',function(e){if(element.options.drag_locked)
return;Tea.Drag.active=self;self.origin={left:e.pageX,top:e.pageY};self.element=element;self.begun=false;if(e.stopPropagation)e.stopPropagation();if(e.preventDefault)e.preventDefault();});},createGhost:function(element)
{var source=element.source;return source.clone().css('opacity',.5).appendTo(document.body).css('position','absolute').width(source.width()).height(source.height()).addClass('t-drag').appendTo(Tea.Drag.overlay);},start:function(e)
{this.ghost=this.createGhost(this.element);this.target=null;this.overlay=Tea.Drag.overlay;var offset=this.element.source.offset();this.delta={top:this.origin.top-offset.top,left:this.origin.left-offset.left}
Tea.Drag.overlay.show();Tea.deselect();this.begun=true;},update:function(e)
{if(!this.begun)
{var d1=Math.abs(e.pageX-this.origin.left);var d2=Math.abs(e.pageY-this.origin.top);if(d1<this.options.threshold||d2<this.options.threshold)
return;this.start(e);}
if(this.options.snapToCursor)
{var left=e.pageX+1;var top=e.pageY+1;}
else
{var left=e.pageX-this.delta.left;var top=e.pageY-this.delta.top;}
Tea.Drag.overlay.css({left:left,top:top});},end:function(e)
{if(this.ghost)
this.ghost.remove();Tea.Drag.overlay.hide();Tea.Drag.active=null;if(this.target)
{this.target.trigger('drop',this.element);if(this.target.options.onDrop)
this.target.options.onDrop.call(this.target,this.element);}
else
this.element.trigger('drop-nowhere');}})
Tea.Droppable=Tea.Class('Tea.Droppable',{options:{accept:[]},attach:function(element,handle)
{if(!handle)handle=element.source;Tea.Drag.init();var onHoverIn=function(e)
{if(Tea.Drag.active)
{Tea.Drag.active.target=element;if(e.stopPropagation)e.stopPropagation();if(e.preventDefault)e.preventDefault();}};var onHoverOut=function(e)
{if(Tea.Drag.active){Tea.Drag.active.target=null;}}
handle.mouseenter(onHoverIn).mouseleave(onHoverOut);}})
Tea.Popup=Tea.Container.extend('t-popup',{options:{cls:'t-popup',pos:null},show:function(){if(!this.isRendered())
this.render().appendTo(document.body).hide();this.setPosition(this.pos);this.source.fadeIn();this.hook($(document),'click touch',Tea.latent(100,this.hide,this));this.open=true;},hide:function(){this.unhook(window);this.source.hide();this.open=false;},setPosition:function(top,left){this.pos={top:top,left:left};this.source.css({top:top,left:left});},centerOn:function(item){var delta=item.source.position().top;var top=this.pos.top-delta;if(top<0)
top=0;this.css('top',top);}})