(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.vdom = {}));
}(this, function (exports) { 'use strict';

  const EMPTY_OBJECT = {};
  const EMPTY_ARRAY = [];
  const TEXT_NODE = 3; 
  const DEFAULT = 0;

  const isArray = Array.isArray;

  const createVNode = (name, props, children, element, key, type) => {
    const pureVNode = Object.create(null);

    return Object.assign(pureVNode, {
      name,
      props,
      children,
      element,
      key,
      type
    })
  };

  const createTextVNode = (text, element) => {
    return createVNode(text, EMPTY_OBJECT, EMPTY_ARRAY, element, null, TEXT_NODE)
  };

  const setProperty = (element, name, value) => {
    if(name === 'key');
    else if(name === 'style') {
      if(typeof value === 'string') element.style.cssText = value;
      else {
        for(let i in value) {
          const style = value == null || value[i] == null ? '' : value[i];
          if(i[0] === '-') {
            element[name].setProperty(name, style);
          }else {
            element[name][i] = style;
          }
        }
      }
    }
    else {
      const nullOrFalse = value == null || value == false;
      if(
        name in element &&
        name !== "list" &&
        name !== "draggable" &&
        name !== "spellcheck" &&
        name !== "translate"
      ) {
        element[name] = value == null ? '' : value;
      }else {
        element.setAttribute(name, value);
      }

      if(nullOrFalse) {
        element.removeAttribute(name);
      }
    }
  };

  // create virtual DOM
  const element = (name, props, ...args) => {
    let node, length = args.length;
    const rest = [], children = [];

    while(length-- > 0) rest.push(args[length]);

    if(isArray(props)){
      if(rest.length <= 0) rest.push(props);
      props = {};
    }

    if((props = props == null ? {} : props).children != null) {
      if(rest.length <= 0) rest.push(props.children);
      delete props.children;
    }

    while(rest.length) {
      if(isArray((node = rest.pop()))) {
        for(length = node.length; length--;) {
          rest.push(node[length]);
        }
      } else if (node === false || node ===null || node === true) ; else {
        children.push(typeof node === 'object' ? node : createTextVNode(node));
      }
    }

    return createVNode(name, props, children, null, props.key, DEFAULT)
  };

  // translate our virtual DOM to real DOM
  const render = vNode => {
    const element = vNode.type === TEXT_NODE ? document.createTextNode(vNode.name) : document.createElement(vNode.name);
    const props = vNode.props;

    for(let i = 0, len = vNode.children.length; i < len; i++) {
      element.appendChild(
        render(vNode.children[i])
      );
    }

    for(let p in props) {
      setProperty(element, p, props[p]);
    }

    return (vNode.element = element)
  };

  // mount the real DOM to the target node
  const mount = (node, target) => {
    // https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/replaceWith
    // ignore IE and safari
    target.replaceWith(node);
    return node
  };

  const noop = node => node;
  const TEXT_NODE$1 = 3;

  const zip = (x, y) => {
    const zipped = [];
    for(let i = 0, len = Math.min(x.length, y.length); i < len; i++){
      zipped.push([x[i], y[i]]);
    }
    return zipped
  };

  const diffProps = (oldProps, newProps) => {
    const patches = [];

    // set all the new attrs
    for(const [k ,v] of Object.entries(newProps)) {
      patches.push(
        node => {
          setProperty(node, k, v);
        }
      );
    }

    // remove the no-use attr
    for(const k in oldProps) {
      if(!(k in newProps)) {
        patches.push(
          node => {
            node.removeAttribute(k);
          }
        );
      }
    }

    return node => {
      for(const patch of patches) {
        patch(node);
      }

      return node
    }
  };

  const diffChildren = (oldChildren, newChildren) => {

    // newChildren.length <= oldChildren.length
    const childPatches = [];
    oldChildren.forEach((oldChild, i) => {
      childPatches.push(diff(oldChild, newChildren[i]));
    });

    // newChildren.length > oldChildren.length
    const additionalPatches = [];
    for(const additonalChild of newChildren.slice(oldChildren.length)) {
      additionalPatches.push(
        node => {
          node.appendChild(render(additonalChild));
          return node
        }
      );
    }

    return parent => {
      for(const [patch, child] of zip(childPatches, parent.childNodes)) {
        patch(child);
      }

      for(const patch of additionalPatches) {
        patch(parent);
      }

      return parent
    }
  };

  // the diff will return a patch function
  const diff = (oldVTree, newVTree) => {
    // 1. newVTree is undefined
    if(newVTree == undefined) {
      return node => {
        node.remove();
        return undefined
      }
    }

    // 2. oldVTree equals with the newVTree
    if(oldVTree === newVTree) {
      return noop
    }

    // 3. TEXT_NODE
    if(oldVTree != null && oldVTree.type === TEXT_NODE$1 && newVTree.type === TEXT_NODE$1) {
      if(oldVTree.name !== newVTree.name) {
        return node => {
          const newNode = render(newVTree);
          node.replaceWith(newNode);
          return newNode
        }
      }else {
        return noop
      }
    }

    // 4. Nodes are the same, diff node's props and children, otherwise, we just replace it with newVTree
    if(oldVTree.name === newVTree.name && oldVTree.key === newVTree.key && oldVTree.type === newVTree.type) {
      const patchProps = diffProps(oldVTree.props, newVTree.props);
      const patchChildren = diffChildren(oldVTree.children, newVTree.children);

      return node => {
        patchProps(node);
        patchChildren(node);
        return node
      }
    } else {
      return node => {
        const newNode = render(newVTree);
        node.replaceWith(newNode);
        return newNode
      }
    }
  };

  exports.element = element;
  exports.render = render;
  exports.mount = mount;
  exports.diff = diff;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
