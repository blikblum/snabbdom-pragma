
export default (createElement) => {
  const Component = ({ name }) =>
    createElement('div', null, 'Hello ', name)

  return createElement(Component, { name: 'world' })
}
