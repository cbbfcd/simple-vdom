import { render, setProperty } from './element'

const noop = node => node
const TEXT_NODE = 3

const zip = (x, y) => {
  const zipped = []
  for(let i = 0, len = Math.min(x.length, y.length); i < len; i++){
    zipped.push([x[i], y[i]])
  }
  return zipped
}

const diffProps = (oldProps, newProps) => {
  const patches = []

  // set all the new attrs
  for(const [k ,v] of Object.entries(newProps)) {
    patches.push(
      node => {
        setProperty(node, k, v)
      }
    )
  }

  // remove the no-use attr
  for(const k in oldProps) {
    if(!(k in newProps)) {
      patches.push(
        node => {
          node.removeAttribute(k)
        }
      )
    }
  }

  return node => {
    for(const patch of patches) {
      patch(node)
    }

    return node
  }
}

const diffChildren = (oldChildren, newChildren) => {

  // newChildren.length <= oldChildren.length
  const childPatches = []
  oldChildren.forEach((oldChild, i) => {
    childPatches.push(diff(oldChild, newChildren[i]))
  })

  // newChildren.length > oldChildren.length
  const additionalPatches = []
  for(const additonalChild of newChildren.slice(oldChildren.length)) {
    additionalPatches.push(
      node => {
        node.appendChild(render(additonalChild))
        return node
      }
    )
  }

  return parent => {
    for(const [patch, child] of zip(childPatches, parent.childNodes)) {
      patch(child)
    }

    for(const patch of additionalPatches) {
      patch(parent)
    }

    return parent
  }
}

// the diff will return a patch function
export const diff = (oldVTree, newVTree) => {
  // 1. newVTree is undefined
  if(newVTree == undefined) {
    return node => {
      node.remove()
      return undefined
    }
  }

  // 2. oldVTree equals with the newVTree
  if(oldVTree === newVTree) {
    return noop
  }

  // 3. TEXT_NODE
  if(oldVTree != null && oldVTree.type === TEXT_NODE && newVTree.type === TEXT_NODE) {
    if(oldVTree.name !== newVTree.name) {
      return node => {
        const newNode = render(newVTree)
        node.replaceWith(newNode)
        return newNode
      }
    }else {
      return noop
    }
  }

  // 4. Nodes are the same, diff node's props and children, otherwise, we just replace it with newVTree
  if(oldVTree.name === newVTree.name && oldVTree.key === newVTree.key && oldVTree.type === newVTree.type) {
    const patchProps = diffProps(oldVTree.props, newVTree.props)
    const patchChildren = diffChildren(oldVTree.children, newVTree.children)

    return node => {
      patchProps(node)
      patchChildren(node)
      return node
    }
  } else {
    return node => {
      const newNode = render(newVTree)
      node.replaceWith(newNode)
      return newNode
    }
  }
}