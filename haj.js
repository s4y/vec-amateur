(function(){
	var selectorChars = { '%': true, '#': true, '.': true },
		selectorRegExp = /([%#.])([^%#.]+)/g,
		toString = Object.prototype.toString;
	function later(f, thisObj, arguments){
		setTimeout(function(){
			f.apply(thisObj, arguments);
		}, 0);
	}
	function isPlainObject(object){
		return object && toString.call(object) === '[object Object]';
	}
	var isArray = Array.isArray || function(array){
		return array && (array instanceof Array) || toString.call(array) === '[object Array]';
	}
	function haj(template, exports){
		var i = 0, selector = template[0];
		if (i === 0 && typeof selector === 'string' && selector.charAt(0) in selectorChars && selector.length > 1) {
			var tagName = 'div', attributes = {}, match;
			i++;
			if (template[1] && isPlainObject(template[1])) {
				var inAttributes = template[1];
				for (var key in inAttributes) {
					attributes[key] = inAttributes[key];
				}
				i++;
			}
			while ((match = selectorRegExp.exec(selector))) {
				switch(match[1]){
				case '%':
					tagName = match[2];
					break;
				case '#':
					attributes.id = match[2];
					break;
				case '.':
					if (attributes['class']) {
						attributes['class'] += ' ' + match[2];
					} else {
						attributes['class'] = match[2];
					}
					break;
				}
			}
			var node = document.createElement(tagName);
			if ('$export' in attributes) {
				if (exports) {
					exports[attributes.$export] = node;
				}
				delete attributes.$export;
			}
			if ('$' in attributes) {
				attributes.$.call(node);
				delete attributes.$;
			}
			if ('$async' in attributes) {
				later(attributes.$async, node);
				delete attributes.$async;
			}
			for (var key in attributes) {
				if (key === 'class') {
					node.className = attributes[key];
				} else {
					node.setAttribute(key, attributes[key]);
				}
			}
		} else {
			node = document.createDocumentFragment();
		}
		var element, length = template.length;
		while(i < length){
			element = template[i++];
			if (element !== null && element !== 'undefined') {
				node.appendChild(isArray(element) ? haj(element, exports) : document.createTextNode(element));
			}
		}
		return node;
	}
	window.haj = haj;
	if (typeof jQuery !== 'undefined') {
		jQuery.fn.haj = function(template){
			this.append(haj(template));
		}
	}
})();
