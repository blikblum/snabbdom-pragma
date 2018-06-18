/* eslint one-var: 0 */

import { isFunction, isObject, isText, isVnode, isString } from './is'
import { reduceDeep, assign } from './fn'

const createTextElement = (text) => !isText(text) ? undefined : {
  text,
  sel: undefined,
  data: undefined,
  children: undefined,
  elm: undefined,
  key: undefined
}

const transformSvg = (vnode) => {
  const data = vnode.data
  const props = data.props
  if (!data.attrs) {
    data.attrs = {}
  }
  if (props) {
    if (props.className) {
      props.class = props.className
      delete props.className
    }
    // ensure props do not override predefined attrs
    assign(props, data.attrs)
    assign(data.attrs, props)
    delete data.props
  }
  data.ns = 'http://www.w3.org/2000/svg'
  if (vnode.children) {
    vnode.children.forEach(transformSvg)
  }
  return vnode
}

const getText = (children) => children.length > 1 || !isText(children[0]) ? undefined : children[0]

const modulesMap = {
  data: 'dataset',
  props: 'props',
  attrs: 'attrs',
  style: 'style',
  class: 'class',
  hook: 'hook',
  on: 'on'
}

const forcedAttrsMap = {
  for: 'attrs',
  role: 'attrs',
  tabindex: 'attrs',
  colspan: 'attrs',
  rowspan: 'attrs'
}

const mapPropsToData = (props) => {
  let module, moduleKey, moduleData, value, objectValue, dashIndex, prefix
  const data = {}
  for (const key in props) {
    // skip key. Already set
    if (key === 'key') {
      continue
    }

    value = props[key]
    objectValue = isObject(value)
    dashIndex = key.indexOf('-')
    if (dashIndex > -1) {
      prefix = key.slice(0, dashIndex)
      if (module = modulesMap[prefix]) { // eslint-disable-line no-cond-assign
        moduleKey = key.slice(dashIndex + 1)
      } else {
        // map aria to attrs module
        module = prefix === 'aria' ? 'attrs' : 'props'
        moduleKey = key
      }
    } else if (key === 'class' && !objectValue) {
      // treat class specially
      module = 'props'
      moduleKey = 'className'
    } else {
      // resolve module: mapped > forced attr > props
      module = modulesMap[key] || forcedAttrsMap[key] || 'props'
      moduleKey = key
    }
    moduleData = data[module] || (data[module] = {})
    objectValue && (key in modulesMap) ? assign(moduleData, value) : moduleData[moduleKey] = value // eslint-disable-line no-unused-expressions
  }
  return data
}

const sanitizeChildren = (children) => reduceDeep(children, (acc, child) => {
  const vnode = isVnode(child) ? child : createTextElement(child)
  acc.push(vnode)
  return acc
}
  , [])

export const createElement = (sel, props, ...children) => {
  if (isFunction(sel)) {
    return sel(props || {}, children)
  }
  const text = getText(children)
  const vnode = {
    sel,
    data: props ? mapPropsToData(props) : {},
    children: text ? undefined : sanitizeChildren(children),
    text,
    elm: undefined,
    key: props ? props.key : undefined
  }
  if (sel === 'svg') {
    transformSvg(vnode)
  }
  return vnode
}

export const addModules = (modules) => {
  modules.forEach((module) => {
    if (isString(module)) {
      modulesMap[module] = module
    } else {
      // assume array
      modulesMap[module[0]] = module[1]
    }
  })
}

export const removeModules = (modules) => {
  modules.forEach((module) => {
    delete modulesMap[module]
  })
}

export default {
  createElement
}
