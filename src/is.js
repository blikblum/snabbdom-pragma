
export const isNull = (v) => v === null

export const isUndefined = (v) => v === undefined

export const isNumber = (v) => typeof v === 'number'

export const isString = (v) => typeof v === 'string'

export const isText = (v) => isString(v) || isNumber(v)

export const isArray = Array.isArray

export const isObject = (v) => typeof v === 'object' && v !== null

export const isFunction = (v) => typeof v === 'function'

export const isVnode = (v) => isObject(v) && 'sel' in v && 'data' in v && 'children' in v && 'text' in v
