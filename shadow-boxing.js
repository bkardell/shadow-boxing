let globalStyles
const openStylableElements = new Set()
const elementsToAnchors = new WeakMap()
const delayedConnectedCallbackElements = new WeakSet()
const mode = document.documentElement.getAttribute("shadow-style-mode")
const filter = (mode == 'component-pull' || mode == "page-push") ? '' : '[shadow-import]' 

// Use empty text nodes to know the start and end anchors of where we should insert cloned styles
function getAnchors (element) {
  let anchors = elementsToAnchors.get(element)
  if (!anchors) {
    anchors = [document.createTextNode(''), document.createTextNode('')]
    elementsToAnchors.set(element, anchors)
    element.shadowRoot.prepend(...anchors)
  }
  return anchors
}

function clearStyles (element) {
  const [startAnchor, endAnchor] = getAnchors(element)
  let nextSibling
  while ((nextSibling = startAnchor.nextSibling) !== endAnchor) {
    nextSibling.remove()
  }
}

function setStyles (element) {
  const [, endAnchor] = getAnchors(element)
  for (const node of globalStyles) {
    element.shadowRoot.insertBefore(node.cloneNode(true), endAnchor)
  }
}

function updateGlobalStyles () {
  globalStyles = document.head.querySelectorAll(`style${filter},link[rel="stylesheet"]${filter}`)
}

const observer = new MutationObserver(() => {
  updateGlobalStyles()
  for (const element of openStylableElements) {
    clearStyles(element)
    setStyles(element)
  }
})
observer.observe(document.head, {
  childList: true,
  subtree: true, 
  characterData: true,
  attributes: true
})

updateGlobalStyles()

export const OpenStylable = superclass => (class extends superclass {
  connectedCallback () {
    try {
      if (super.connectedCallback) {
        super.connectedCallback()
      }
    } finally {
      if (mode == 'component-pull' || mode == 'component-pull-marked') {
        openStylableElements.add(this)
        if (this.shadowRoot) {
          setStyles(this)
        } else { // if shadowRoot doesn't exist yet, wait to see if it gets added in connectedCallback
          delayedConnectedCallbackElements.add(this) // keep track of which elements needed a delay
          Promise.resolve().then(() => setStyles(this))
        }
      }
    }
  }

  disconnectedCallback () {
    try {
      if (super.disconnectedCallback) {
        super.disconnectedCallback()
      }
    } finally {
      if (mode == 'component-pull' || mode == 'component-pull-marked') {
        openStylableElements.delete(this)
        if (delayedConnectedCallbackElements.has(this)) { // ensure our disconnected logic runs after our connected logic
          Promise.resolve().then(() => clearStyles(this))
        } else { // run immediately, no need to delay
          clearStyles(this)
        }
      }
    }
  }
})

if (mode == 'page-push-marked' || mode == 'page-push') {
  let old = Element.prototype.attachShadow
  Element.prototype.attachShadow = function () {
    let r = old.call(this, ...arguments)
    openStylableElements.add(this)
    Promise.resolve().then(() => setStyles(this))
    return r
  }
}
