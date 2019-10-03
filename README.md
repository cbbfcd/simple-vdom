# vdom

[![Greenkeeper badge](https://badges.greenkeeper.io/cbbfcd/simple-vdom.svg)](https://greenkeeper.io/)

⚠️ This library is just a simple case of learning virtual dom technology and does not have the ability to practice in a production environment.

There are a lot of articles and code implementations for virtual doms. 

This library mainly refers to the implementation in [hyperapp](https://github.com/jorgebucaran/hyperapp/blob/V2/README.md)

There are a lot of excellent practices on how to implement virtual DOM, and after reviewing many different ideas, record the implementation process.

Just for learning, I have to emphasize it again.

so, just fork or clone this repo and build it better via a PR. thanks! happy new year!

# useage

The virtual DOM mainly consists of three parts:

1. element: Represents a node with a pure object (this repo only processes text nodes or element nodes). In addition, there should be a render method that translates the virtual DOM into a real DOM, plus a mount to the target node. named mount!

2. diff: Comparing the old and new trees, comparing only the same layer will reduce the complexity to O(N). Collect the changes and hand them to the patch function.

3. patch: Map the changed part to the real DOM to complete the update of the view.

```js
// copy from https://codesandbox.io/s/mpmo2yy69
const el = vdom.element
const render = vdom.render
const mount = vdom.mount
const diff = vdom.diff

const createVApp = count => 
  el(
    'div',
    {
      id: 'app',
      dataCount: count
    },
    [
      `the current count is ${count}`,
      ...Array.from({length: count}, () => el('img', {src: 'https://media.giphy.com/media/cuPm4p4pClZVC/giphy.gif'}))
    ]
  )

let appTree = createVApp(0)
const $app = render(appTree)
let $root = mount($app, document.querySelector('#root'))

setInterval(() => {
  const n = Math.floor(Math.random() * 10)
  const newAppTree = createVApp(n)
  const patch = diff(appTree, newAppTree)

  $root = patch($root)

  appTree = newAppTree
}
```

# reference

[Building a Simple Virtual DOM from Scratch](https://dev.to/ycmjason/building-a-simple-virtual-dom-from-scratch-3d05)</br>
[深度剖析：如何实现一个 Virtual DOM 算法](https://github.com/livoras/blog/issues/13)