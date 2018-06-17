import * as is from './is'

export const assign = Object.assign

export const reduceDeep = (arr, fn, initial) => {
  let result = initial
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i]
    if (is.isArray(value)) {
      result = reduceDeep(value, fn, result)
    } else {
      result = fn(result, value)
    }
  }
  return result
}
