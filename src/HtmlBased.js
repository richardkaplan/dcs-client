import { u } from '../../dcs-shared/src/utils'
import { DcsTag } from '../../dcs-shared/src/DcsTag.js'
import { comToPlugin } from './comToPlugin'

//------------------------------------------------------------------------------

export { u, DcsTag, comToPlugin }

//------------------------------------------------------------------------------

class HtmlBasedClass {
  constructor() {
    this.selTriggerNode = null
    this.resizeTimer = null
    comToPlugin.onDiscourseRoutePushed(this._onDiscourseRoutePushed.bind(this))
    comToPlugin.onCountsChanged(({ counts }) => console.log('counts: ', counts))
  }

  connect({ discourseOrigin, timeout }) {
    return new Promise((resolve, reject) => {
      // Establish communication with the Discourse plugin
      this.resolveInit = resolve
      comToPlugin.connect({
        discourseOrigin,
        timeout,
        onTimeout: () => reject('timeout')
      })
    })
  }

  parseDom({ descr, pageName, counts }) {
    // Convert page relative url to absolute url, for comparison with <a> href.
    const pages = descr.staticPages || []
    pages.forEach(page => {
      let parsedUrl = new URL(page['url'], location.href)
      page.url = parsedUrl.href
    })

    return u.dom.onDOMReady().then(() => {
      // Modify the document links so that they open the correct url in the
      // correct place
      u.dom.forEach(document.getElementsByTagName('a'), a => {
        if (a.dataset.dcsDiscourseLink) {
          a.onclick = e => {
            e.preventDefault()
            e.stopPropagation()
            comToPlugin.postSetDiscourseRoute({
              route: { layout: 'FULL_DISCOURSE', path: a.pathname },
              mode: 'PUSH',
              clientContext: true
            })
          }
        } else if (a.href.split('#')[0] === location.href.split('#')[0]) {
          // In case it is an anchor (internal link), we need to notify
          // the parent window AND keep the default anchor behavior)
          a.onclick = () => {
            comToPlugin.postSetHash({ hash: a.hash, mode: 'REPLACE' })
          }
        } else {
          // In case it is an external link
          const url = a.href.split('#')[0]
          const page = descr.staticPages.find(p => p.url === url)
          if (page) {
            // Case the external link points to another page of the website

            // Change the href so that cmd+click or right click+... will open
            // the Discourse instance in another tab
            a.href = document.referrer + 'docuss/' + page.name

            // Regarding the simple click, cancel the default behavior and
            // let Discourse load the target page
            if (!a.target || a.target === '_self') {
              a.onclick = e => {
                e.preventDefault()
                e.stopPropagation()
                comToPlugin.postSetDiscourseRoute({
                  route: { layout: 'FULL_CLIENT', pageName: page.name },
                  mode: 'PUSH',
                  clientContext: true
                })
              }
            }
          } else {
            // Case the external link points to another website
            if (!a.target || a.target === '_self') {
              a.target = '_parent'
            }
          }
        }
      })

      // Set the additional redirects
      // Remember that a same triggerId can have several node with different
      // dcsHighlightable property value. So we consider a trigger as
      // highligthable if any of its nodes is highligthable
      const nodes = document.getElementsByClassName('dcs-trigger')
      const ids = {}
      u.dom.forEach(nodes, node => {
        const triggerId = node.dataset.dcsTriggerId
        const highlightable = ids[triggerId] || !!node.dataset.dcsHighlightable
        ids[triggerId] = highlightable
      })
      const nonHighlitghables = Object.keys(ids).filter(id => !ids[id])
      // Here you might be tempted, if there are only nonHighlitghables
      // triggers in the page, to set a single generic redirect instead of one
      // redirect per trigger. Don't do that. Imagine the consequence if the
      // page already contains a static redirect for full page commenting
      // (WITH_SPLIT_BAR => FULL_CLIENT). Yep, infinite loop.
      const redirects = nonHighlitghables.map(triggerId => ({
        src: { layout: 'WITH_SPLIT_BAR', triggerId, showRight: false },
        dest: { layout: 'FULL_CLIENT' }
      }))
      comToPlugin.postSetRedirects(redirects)

      // Add click events on triggers
      const clickTargets =
        '.dcs-icons, .dcs-trigger.dcs-no-balloon .dcs-trigger-span, .dcs-trigger.dcs-no-balloon.dcs-no-span'
      u.dom.forEach(document.querySelectorAll(clickTargets), node => {
        node.onclick = e => {
          // Don't do anything if user is selecting text
          if (window.getSelection().toString()) {
            return
          }

          const triggerNode = e.target.closest('.dcs-trigger')
          const triggerId = triggerNode.dataset.dcsTriggerId

          this._selectTriggers(triggerId)

          comToPlugin.postSetDiscourseRoute({
            route: {
              layout: 'WITH_SPLIT_BAR',
              pageName: triggerNode.dataset.dcsPageName || pageName,
              triggerId,
              interactMode: triggerNode.dataset.dcsInteractMode,
              showRight: true
            },
            mode: 'PUSH',
            clientContext: true
          })

          // Mandatory because we want our global click event to fire only
          // when user clicks on an empty space
          e.stopPropagation()
        }
      })

      this.runReady = true

      // Case click nowhere special (all Docuss specific events ar handles
      // elsewhere with preventDefault)

      window.addEventListener('click', () => {
        if (
          this.selTriggerNode &&
          this.selTriggerNode.dataset.dcsHighlightable
        ) {
          this._selectTriggers(null)
          comToPlugin.postSetDiscourseRoute({
            route: { layout: 'FULL_CLIENT', pageName },
            mode: 'PUSH',
            clientContext: true
          })
        }
      })

      // Resize event with debounce
      // https://developer.mozilla.org/en-US/docs/Web/Events/resize#setTimeout
      window.addEventListener('resize', evt => {
        if (this.resizeTimer !== null) {
          clearTimeout(this.resizeTimer)
        }
        this.resizeTimer = setTimeout(() => {
          this.resizeTimer = null
          if (this.selTriggerNode) {
            _scrollIntoViewIfNeeded(this.selTriggerNode)
          }
        }, 100)
      })

      if (this.delayedRoute) {
        this._onDiscourseRoutePushed({ route: this.delayedRoute })
      }
    })
  }

  _onDiscourseRoutePushed({ route, descr, counts, clientContext }) {
    // Case init
    if (this.resolveInit) {
      this.resolveInit({ descr, pageName: route.pageName, counts })
      delete this.resolveInit
      DcsTag.init(descr.dcsTag)
      this.runReady = false
      this.delayedRoute = route
      return
    }

    // Case we're still not ready
    if (!this.runReady) {
      this.delayedRoute = route
      return
    }

    // Set the route category and title
    if (route.layout === 'WITH_SPLIT_BAR') {
      const triggerNode =
        route.triggerId &&
        document.querySelector(
          `.dcs-trigger[data-dcs-trigger-id="${route.triggerId}"]`
        )
      const category =
        (triggerNode && triggerNode.dataset.dcsCategory) ||
        document.documentElement.dataset.dcsCategory
      const discourseTitle =
        (triggerNode && triggerNode.dataset.dcsDiscourseTitle) ||
        document.documentElement.dataset.dcsDiscourseTitle
      comToPlugin.postSetRouteProps({ category, discourseTitle })
    }

    // clientContext === true means that this route changed has been
    // triggered by us, so there is nothing more we need to do (because the
    // trigger is already selected)
    if (!clientContext) {
      this._selectTriggers(route.triggerId)
    }
  }

  // Remember there can be more than one trigger per triggerId
  _selectTriggers(triggerId) {
    u.dev.assert(this.runReady)

    // Unselect everything
    this.selTriggerNode = null
    u.dom.forEach(document.getElementsByClassName('dcs-highlighted'), node =>
      node.classList.remove('dcs-highlighted')
    )

    // Case there is nothing to select
    if (!triggerId) {
      return
    }

    // Look for the trigger node in the DOM
    const triggerNodes = document.querySelectorAll(
      `.dcs-trigger[data-dcs-trigger-id="${triggerId}"]`
    )

    // Case tag not found
    if (!triggerNodes.length) {
      comToPlugin.postSetRouteProps({ error })
      return
    }

    // Highlight the trigger and subsec nodes
    u.dom.forEach(triggerNodes, node => {
      if (node.dataset.dcsHighlightable) {
        node.classList.add('dcs-highlighted')
        const subsec = node.closest('.dcs-subsec')
        subsec && subsec.classList.add('dcs-highlighted')
      }
    })

    // Bring the first trigger node into view
    // THIS IS REQUIRED WHEN LAYOUT HAS CHANGED, BUT ALSO WHEN USING THE BACK
    // BUTTON TO A PREVIOUSLY SELECTED HEADING FAR AWAY
    // Need a setTimeout, to ensure the layout change has occurred.
    // 200 is the iframes animation duration + 30 for security
    // +300 because some web sites (ex: VueJS API) have an animation when layout
    // changes from narrow to wide screen.
    this.selTriggerNode = triggerNodes[0]
    setTimeout(() => _scrollIntoViewIfNeeded(this.selTriggerNode), 700)
  }
}

//------------------------------------------------------------------------------

function _scrollIntoViewIfNeeded(target) {
  const rect = target.getBoundingClientRect()
  // https://stackoverflow.com/a/22480938/3567351
  const isPartiallyVisible = rect.top < window.innerHeight && rect.bottom >= 0
  if (!isPartiallyVisible) {
    target.scrollIntoView() // Set the element top to be at the top of the screen
    window.scrollBy(0, -50) // Lower it a little bit
  }
}

//------------------------------------------------------------------------------

export const htmlBased = new HtmlBasedClass()

//------------------------------------------------------------------------------
