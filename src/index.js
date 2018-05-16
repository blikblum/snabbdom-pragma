
import * as is from './is'
import * as fn from './fn'

// Const fnName = (...params) => guard ? default : ...

const createTextElement = (text) => !is.text(text) ? undefined : {
  text,
  sel: undefined,
  data: undefined,
  children: undefined,
  elm: undefined,
  key: undefined
}

const considerSvg = (vnode) => !is.svg(vnode) ? vnode :
  fn.assign(vnode,
    { data: fn.omit('props', fn.extend(vnode.data,
      { ns: 'http://www.w3.org/2000/svg', attrs: fn.omit('className', fn.extend(vnode.data.props,
        { class: vnode.data.props ? vnode.data.props.className : undefined }
      )) }
    )) },
    { children: is.undefinedv(vnode.children) ? undefined :
      vnode.children.map((child) => considerSvg(child))
    }
  )


const getText = (children) => children.length > 1 || !is.text(children[0]) ? undefined : children[0]

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
    is.object(value) && (key in modulesMap) ? fn.assign(moduleData, value) : moduleData[moduleKey] = value
  }
  return data
}

const sanitizeChildren = (children) => fn.reduceDeep(children, (acc, child) => {
      const vnode = is.vnode(child) ? child : createTextElement(child)
      acc.push(vnode)
      return acc
    }
  , [])

export const createElement = (sel, props, ...children) => {  
  if (is.fun(sel)) {
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
