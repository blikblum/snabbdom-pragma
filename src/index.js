
import {isFunction, isObject, isSvg, isText, isVnode} from './is'
import {reduceDeep, assign} from './fn'

const createTextElement = (text) => !isText(text) ? undefined : {
  text,
  sel: undefined,
  data: undefined,
  children: undefined,
  elm: undefined,
  key: undefined
}

const considerSvg = (vnode) => {
  if (isSvg(vnode)) {    
    const data = vnode.data
    const props = data.props    
    data.attrs || (data.attrs = {})    
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
    vnode.children && vnode.children.forEach(considerSvg)
  }
  return vnode
}

const getText = (children) => children.length > 1 || !isText(children[0]) ? undefined : children[0]

const modulesMap = {
  data: 'dataset',
  on: 'on',
  attrs: 'attrs',
  style: 'style',
  class: 'class',
  hook: 'hook'
}

const forcedAttrsMap = {
  for: 'attrs', 
  role: 'attrs', 
  tabindex: 'attrs'
}

const mapPropsToData = (props) => {
  let module, moduleKey, moduleData, value, dashIndex, prefix  
  const data = {}  
  for (let key in props) {
    // skip key. Already set
    if (key === 'key') continue

    value = props[key]
    dashIndex = key.indexOf('-')
    if (dashIndex > -1) {
      prefix = key.slice(0, dashIndex)      
      if (module = modulesMap[prefix]) {
        moduleKey = key.slice(dashIndex + 1)        
      } else {
        // map aria to attrs module
        module = prefix === 'aria' ? 'attrs' : 'props'
        moduleKey = key        
      }
    } else {
      // resolve module: mapped > forced attr > props
      module = modulesMap[key] || forcedAttrsMap[key] || 'props'
      moduleKey = key
    }
    moduleData = data[module] || (data[module] = {})
    isObject(value) && (key in modulesMap) ? assign(moduleData, value) : moduleData[moduleKey] = value
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
  } else {
    const text = getText(children) 
    return considerSvg({
      sel,
      data: props ? mapPropsToData(props) : {},
      children: text ? undefined : sanitizeChildren(children),
      text: text,
      elm: undefined,
      key: props ? props.key : undefined
    })
  }  
}

export default {
  createElement
}
