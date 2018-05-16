
export default (createElement) => {
  return createElement('div', { 'style-color': 'red', style: { background: 'blue' }, type: 'text', props: {value: 1} })
}
