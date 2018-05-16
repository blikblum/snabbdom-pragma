
export default (createElement) => {
  return createElement('svg', null, [
    createElement('g', { className: 'highlight' }, [
      createElement('circle', { cx: 43.5, cy: 23, r: 5 , attrs: {cx: 103.5}})
    ])
  ])
}
