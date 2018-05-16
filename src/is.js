
export const isNull = (v) => v === null

export const isUndefined = (v) => v === undefined

export const isNumber = (v) => typeof v === 'number'

export const isString = (v) => typeof v === 'string'

export const isText = (v) => isString(v) || isNumber(v)

export const isArray = (v) => Array.isArray(v)

export const isObject = (v) => typeof v === 'object' && !!v

export const isFunction = (v) => typeof v === 'function'

export const isVnode = (v) => isObject(v) && 'sel' in v && 'data' in v && 'children' in v && 'text' in v

const svgPropsMap = {svg: 1, circle: 1, ellipse: 1, line: 1, polygon: 1,
polyline: 1, rect: 1, g: 1, path: 1, text: 1}  

export const isSvg = (v) => v.sel in svgPropsMap
