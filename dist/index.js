'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var isNumber = function (v) { return typeof v === 'number'; };

var isString = function (v) { return typeof v === 'string'; };

var isText = function (v) { return isString(v) || isNumber(v); };

var isArray = function (v) { return Array.isArray(v); };

var isObject = function (v) { return typeof v === 'object' && !!v; };

var isFunction = function (v) { return typeof v === 'function'; };

var isVnode = function (v) { return isObject(v) && 'sel' in v && 'data' in v && 'children' in v && 'text' in v; };

var svgPropsMap = {svg: 1, circle: 1, ellipse: 1, line: 1, polygon: 1,
polyline: 1, rect: 1, g: 1, path: 1, text: 1};  

var isSvg = function (v) { return v.sel in svgPropsMap; };

var assign = Object.assign;

var reduceDeep = function (arr, fn, initial) {
  var result = initial;
  for (var i = 0; i < arr.length; i++) {
    var value = arr[i];
    if (isArray(value)) {
      result = reduceDeep(value, fn, result);
    } else {
      result = fn(result, value);
    }    
  }
  return result
};

var createTextElement = function (text) { return !isText(text) ? undefined : {
  text: text,
  sel: undefined,
  data: undefined,
  children: undefined,
  elm: undefined,
  key: undefined
}; };

var considerSvg = function (vnode) {
  if (isSvg(vnode)) {    
    var data = vnode.data;
    var props = data.props;    
    data.attrs || (data.attrs = {});    
    if (props) {
      if (props.className) {
        props.class = props.className;
        delete props.className;
      }
      // ensure props do not override predefined attrs
      assign(props, data.attrs);      
      assign(data.attrs, props);
      delete data.props;
    }
    data.ns = 'http://www.w3.org/2000/svg';
    vnode.children && vnode.children.forEach(considerSvg);
  }
  return vnode
};

var getText = function (children) { return children.length > 1 || !isText(children[0]) ? undefined : children[0]; };

var modulesMap = {
  data: 'dataset',
  props: 'props',
  attrs: 'attrs',
  style: 'style',
  class: 'class',
  hook: 'hook',
  on: 'on'
};

var forcedAttrsMap = {
  for: 'attrs', 
  role: 'attrs', 
  tabindex: 'attrs',
  colspan: 'attrs',
  rowspan: 'attrs'
};

var mapPropsToData = function (props) {
  var module, moduleKey, moduleData, value, dashIndex, prefix;  
  var data = {};  
  for (var key in props) {
    // skip key. Already set
    if (key === 'key') { continue }

    value = props[key];
    dashIndex = key.indexOf('-');
    if (dashIndex > -1) {
      prefix = key.slice(0, dashIndex);      
      if (module = modulesMap[prefix]) {
        moduleKey = key.slice(dashIndex + 1);        
      } else {
        // map aria to attrs module
        module = prefix === 'aria' ? 'attrs' : 'props';
        moduleKey = key;        
      }
    } else {
      // resolve module: mapped > forced attr > props
      module = modulesMap[key] || forcedAttrsMap[key] || 'props';
      moduleKey = key;
    }
    moduleData = data[module] || (data[module] = {});
    isObject(value) && (key in modulesMap) ? assign(moduleData, value) : moduleData[moduleKey] = value;
  }
  return data
};

var sanitizeChildren = function (children) { return reduceDeep(children, function (acc, child) {
      var vnode = isVnode(child) ? child : createTextElement(child);
      acc.push(vnode);
      return acc
    }
  , []); };

var createElement = function (sel, props) {
  var children = [], len = arguments.length - 2;
  while ( len-- > 0 ) children[ len ] = arguments[ len + 2 ];
  
  if (isFunction(sel)) {
    return sel(props || {}, children)
  } else {
    var text = getText(children); 
    return considerSvg({
      sel: sel,
      data: props ? mapPropsToData(props) : {},
      children: text ? undefined : sanitizeChildren(children),
      text: text,
      elm: undefined,
      key: props ? props.key : undefined
    })
  }  
};

var addModules = function (modules) {
  modules.forEach(function (module) {
    if (isString(module)) {
      modulesMap[module] = module;
    } else {
      // assume array
      modulesMap[module[0]] = module[1];
    }
  });
};

var removeModules = function (modules) {
  modules.forEach(function (module) {
    delete modulesMap[module];
  });
};

var index = {
  createElement: createElement
};

exports.createElement = createElement;
exports.addModules = addModules;
exports.removeModules = removeModules;
exports['default'] = index;
