let globalStyles
const openStylableElements = new Set()
const elementsToAnchors = new WeakMap()
const delayedConnectedCallbackElements = new WeakSet()
const mode = document.documentElement.getAttribute("shadow-style-mode")
const filter = (mode == 'component-pull' || mode == "page-push" || mode == "page-push-select") ? '' : '[shadow-import]' 
const isValidPushMode = (mode == 'page-push-marked' || mode == 'page-push' || mode == 'page-push-select' || mode == 'page-push-select-marked')
const isValidComponentPullMode = (mode == 'component-pull' || mode == 'component-pull-marked')

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

function maybeSetStyles (element) {
  if(mode == 'page-push-select' || mode == 'page-push-select-marked') {
    if (element.hasAttribute('shadow-style-select')) {
      setStyles(element)
    } 
  } else {
    setStyles(element)
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
    
    maybeSetStyles(element)
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
      if (isValidComponentPullMode) {
        openStylableElements.add(this)
        if (this.shadowRoot) {
          maybeSetStyles(this)
        } else { // if shadowRoot doesn't exist yet, wait to see if it gets added in connectedCallback
          delayedConnectedCallbackElements.add(this) // keep track of which elements needed a delay
          Promise.resolve().then(() => maybeSetStyles(this))
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
      if (isValidComponentPullMode) {
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

if (isValidPushMode) {
  let old = Element.prototype.attachShadow
  Element.prototype.attachShadow = function () {
    let r = old.call(this, ...arguments)
    openStylableElements.add(this)
    Promise.resolve().then(() => maybeSetStyles(this))
    return r
  }
}
