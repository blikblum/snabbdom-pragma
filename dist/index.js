'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var isNumber = function (v) { return typeof v === 'number'; };

var isString = function (v) { return typeof v === 'string'; };

var isText = function (v) { return isString(v) || isNumber(v); };

var isArray = Array.isArray;

var isObject = function (v) { return typeof v === 'object' && v !== null; };

var isFunction = function (v) { return typeof v === 'function'; };

var isVnode = function (v) { return isObject(v) && 'sel' in v && 'data' in v && 'children' in v && 'text' in v; };

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

/* eslint one-var: 0 */

var createTextElement = function (text) { return !isText(text) ? undefined : {
  text: text,
  sel: undefined,
  data: undefined,
  children: undefined,
  elm: undefined,
  key: undefined
}; };

var transformSvg = function (vnode) {
  var data = vnode.data;
  var props = data.props;
  if (!data.attrs) {
    data.attrs = {};
  }
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
  if (vnode.children) {
    vnode.children.forEach(transformSvg);
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
  var module, moduleKey, moduleData, value, objectValue, dashIndex, prefix;
  var data = {};
  for (var key in props) {
    // skip key. Already set
    if (key === 'key') {
      continue
    }

    value = props[key];
    objectValue = isObject(value);
    dashIndex = key.indexOf('-');
    if (dashIndex > -1) {
      prefix = key.slice(0, dashIndex);
      if (module = modulesMap[prefix]) { // eslint-disable-line no-cond-assign
        moduleKey = key.slice(dashIndex + 1);
      } else {
        // map aria to attrs module
        module = prefix === 'aria' ? 'attrs' : 'props';
        moduleKey = key;
      }
    } else if (key === 'class' && !objectValue) {
      // treat class specially
      module = 'props';
      moduleKey = 'className';
    } else {
      // resolve module: mapped > forced attr > props
      module = modulesMap[key] || forcedAttrsMap[key] || 'props';
      moduleKey = key;
    }
    moduleData = data[module] || (data[module] = {});
    objectValue && (key in modulesMap) ? assign(moduleData, value) : moduleData[moduleKey] = value; // eslint-disable-line no-unused-expressions
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
  }
  var text = getText(children);
  var vnode = {
    sel: sel,
    data: props ? mapPropsToData(props) : {},
    children: text ? undefined : sanitizeChildren(children),
    text: text,
    elm: undefined,
    key: props ? props.key : undefined
  };
  if (sel === 'svg') {
    transformSvg(vnode);
  }
  return vnode
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
exports.default = index;
