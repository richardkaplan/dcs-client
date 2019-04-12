import * as comTypes from './com-types'
import { Bellhop } from 'bellhop-iframe'
//import { Bellhop } from '../../Bellhop/src/Bellhop'
import { u } from '../../dcs-shared/src/utils'
import { DcsTag } from '../../dcs-shared/src/DcsTag.js'

export { u, DcsTag }

class ComToPlugin {
  //----------------------------------------------------------------------------

  constructor() {
    this._bellhop = new Bellhop()
    this._timer = null
    this._onConnected = null

    // This is called avery time the iframe reloads
    this._bellhop.on('connected', () => {
      if (this._timer) {
        clearTimeout(this._timer)
        this._timer = null
      }
      this._onConnected && this._onConnected()
    })
  }

  //----------------------------------------------------------------------------

  /**
   * @param {Object} arg
   * @param {string} arg.discourseOrigin
   * @param {OnConnectedCallback} arg.onConnected
   * @param {number} arg.timeout
   * @param {OnTimeoutCallback} arg.onTimeout
   */

  connect({ discourseOrigin, onConnected, timeout, onTimeout }) {
    u.throwIf(!u.inIFrame())
    this._onConnected = onConnected
    this._timer = timeout
      ? setTimeout(() => {
          onTimeout && onTimeout()
        }, timeout)
      : null
    this._bellhop.connect(undefined, discourseOrigin)
  }

  //----------------------------------------------------------------------------

  /**
   * @callback OnDiscourseRoutePushedCallback
   * @param {RouteAndDescrAndCountsAndContext}
   */
  /**
   *  @param {OnDiscourseRoutePushedCallback} cb
   */
  onDiscourseRoutePushed(cb) {
    this._bellhop.on('m2', e => cb(e.data))
  }

  /**
   * @callback OnCountsChangedCallback
   * @param {Counts}
   */
  /**
   *  @param {OnCountsChangedCallback} cb
   */
  onCountsChanged(cb) {
    this._bellhop.on('m3', e => cb(e.data))
  }

  //----------------------------------------------------------------------------

  /**
   * @param {RouteAndModeAndContext}
   */
  postSetDiscourseRoute({ route, mode, clientContext }) {
    this._bellhop.send('m4', arguments[0])
  }

  /**
   * @param {HashAndMode}
   */
  postSetHash({ hash, mode }) {
    this._bellhop.send('m5', arguments[0])
  }

  /**
   * @param {RouteProps} props
   */
  postSetRouteProps({ category, discourseTitle, error }) {
    this._bellhop.send('m6', arguments[0])
  }

  /**
   * @param {[Redirect]} redirects
   */
  postSetRedirects(redirects) {
    this._bellhop.send('m7', redirects)
  }

  //----------------------------------------------------------------------------
}

export const comToPlugin = new ComToPlugin()
