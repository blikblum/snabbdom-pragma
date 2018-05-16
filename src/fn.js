// TODO: stop using extend here
import _extend from 'extend'

import * as is from './is'

export const extend = (...objs) => _extend(true, ...objs)

export const assign = (...objs) => _extend(false, ...objs)

export const reduceDeep = (arr, fn, initial) => {
  let result = initial
  for (let i = 0; i < arr.length; i++) {
    let value = arr[i]
    if (is.array(value)) {
      result = reduceDeep(value, fn, result)
    } else {
      result = fn(result, value)
    }    
  }
  return result
}

export const omit = (omitKey, obj) => {
  return Object.keys(obj).reduce((acc, key) => {
    if (key !== omitKey) acc[key] = obj[key]
    return acc
  }, {})
}