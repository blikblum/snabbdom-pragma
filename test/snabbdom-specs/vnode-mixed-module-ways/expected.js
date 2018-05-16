
export default (h) => {
  return h('div', {
    style: { color: 'red', background: 'blue' },
    props: { type: 'text', value: 1 }
  }, [])
}
