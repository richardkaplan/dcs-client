!function(){"use strict";const e={windowName:()=>{let e="Docuss";return(e="undefined"!=typeof window?window.name.trim()||document.title.trim()||e:require(__dirname+"/package.json").name||e).substring(0,12)},log:(...t)=>{t=[`%c${e.windowName()} -`,"color:grey",...t],console.log(...t)},logError:(...t)=>{t=[`%c${e.windowName()} %c- Docuss Error -`,"color:grey","color:red",...t],console.log(...t)},logWarning:(...t)=>{t=[`%c${e.windowName()} %c- Docuss Warning -`,"color:grey","color:orange",...t],console.log(...t)}};class t extends Error{constructor(e){super(e),this.name="DocussError"}}e.throw=(e=>{throw new t(e)}),e.throwIf=((t,o)=>t&&e.throw(o)),e.throwIfNot=((t,o)=>!t&&e.throw(o)),e.dev={assert:(t,o)=>e.throwIf(!t,`Assertion Failed${o?" - "+o:""}`),log:e.log,logWarning:e.logWarning,logError:e.logError},e.inIFrame=(()=>{try{return window.self!==window.top}catch(e){return!0}}),e.async={promiseState(e){const t={};return Promise.race([e,t]).then(e=>e===t?"pending":"fulfilled",()=>"rejected")},delay:e=>new Promise(t=>setTimeout(t,e)),retry:(t,o,n)=>0===o?Promise.reject(n):Promise.resolve(t(n,o)).then(n=>n||e.async.retry(t,o-1,n)),retryDelay(t,o,n,i){const s=o=>e.async.delay(n).then(()=>t(o));try{return 0===o?Promise.reject(i):Promise.resolve(t(o)).then(t=>t||e.async.retryDelay(s,o-1))}catch(e){return Promise.reject(e)}},find:(t,o,n=null)=>t&&0!==t.length?Promise.resolve(o(t[0])).then(i=>i?t[0]:e.async.find(t.slice(1),o,n)):Promise.resolve(void 0)},e.dom={onDOMReady:()=>new Promise(e=>{"loading"!==document.readyState?e():document.addEventListener("DOMContentLoaded",e)}),forEach(e,t,o){const n=[...e];for(let e=0;e<n.length;e++)t.call(o||window,n[e],e)},wrap:(e,t)=>(e.parentNode.insertBefore(t,e),t.appendChild(e),t),wrapAll(e,t){if(e&&e.length){const o=Array.prototype.slice.call(e);o[0].parentNode.insertBefore(t,o[0]),o.forEach(e=>t.appendChild(e))}return t},createElement(e){const t=document.createElement("div");return t.innerHTML=e.trim(),t.firstChild}},e.dot={set(t,o,n){const i=o.split(".");e.throwIf(!i.length);const s=i.pop();i.reduce((e,t)=>e[t]={},t)[s]=n},get:(e,t)=>t.split(".").reduce((e,t)=>void 0!==e?e[t]:void 0,e)};const o={_PREFIX:"dcs",_TAG_PART_REGEX:/[^0-9A-Za-z_]+/g,_settings:null,init(t){e.dev.assert("number"==typeof t.maxPageNameLength&&t.maxPageNameLength>=1),e.dev.assert("number"==typeof t.maxTriggerIdLength&&t.maxTriggerIdLength>=1),e.dev.assert("boolean"==typeof t.forceLowercase),o._settings=t},_checkInit(){e.dev.assert(o._settings,"DcsTag not initialized")},getSettings:()=>(o._checkInit(),o._settings),build:({pageName:e,triggerId:t})=>(o.checkPartThrow(e,"pageName",o._settings.maxPageNameLength),t&&o.checkPartThrow(t,"triggerId",o._settings.maxTriggerIdLength),t?`${o._PREFIX}-${e}-${t}`:`${o._PREFIX}-${e}`),parse(e){o._checkInit();const t=e.split("-");if(t.shift()!==o._PREFIX)return null;const n=t.shift();if(!o.checkPart(n,o._settings.maxPageNameLength))return null;const i=t.shift();return i&&!o.checkPart(i,o._settings.maxTriggerIdLength)?null:{pageName:n,triggerId:i}},maxTagLength:()=>(o._checkInit(),o._PREFIX.length+o._settings.maxPageNameLength+o._settings.maxTriggerIdLength+2),checkPart:(e,t)=>(o._checkInit(),e&&e.length<=t&&!e.match(o._TAG_PART_REGEX)&&(!o.forceLowercaseTags||e===e.toLowerCase())),checkPartThrow(t,n,i){o.checkPart(t,i)||e.throw(`Invalid dcsTag part ${n}="${t}"`)},cleanPart:(e,t)=>e.substring(0,t).replace(o._TAG_PART_REGEX,"_")};var n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},i=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")},s=function(){function e(e,t){for(var o=0;o<t.length;o++){var n=t[o];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,o,n){return o&&e(t.prototype,o),n&&e(t,n),t}}(),r=function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t},c=function(){function e(){i(this,e),this._listeners={}}return s(e,[{key:"on",value:function(e,t){var o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0;this._listeners[e]||(this._listeners[e]=[]),t._priority=parseInt(o)||0,-1===this._listeners[e].indexOf(t)&&(this._listeners[e].push(t),this._listeners[e].length>1&&this._listeners[e].sort(this.listenerSorter))}},{key:"listenerSorter",value:function(e,t){return e._priority-t._priority}},{key:"off",value:function(e,t){if(void 0!==this._listeners[e])if(void 0!==t){var o=this._listeners[e].indexOf(t);-1<o&&this._listeners[e].splice(o,1)}else delete this._listeners[e]}},{key:"trigger",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if("string"==typeof e&&(e={type:e,data:"object"===(void 0===t?"undefined":n(t))&&null!==t?t:{}}),void 0!==this._listeners[e.type])for(var o=this._listeners[e.type].length-1;o>=0;o--)this._listeners[e.type][o](e)}},{key:"destroy",value:function(){this._listeners={}}}]),e}(),a=function(e){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:100*Math.random()|0;i(this,t);var o=r(this,(t.__proto__||Object.getPrototypeOf(t)).call(this));return o.id="BELLHOP:"+e,o.connected=!1,o.isChild=!0,o.connecting=!1,o.origin="*",o._sendLater=[],o.iframe=null,o}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}(t,c),s(t,[{key:"receive",value:function(e){if(this.target===e.source)if("connected"===e.data)this.onConnectionReceived(e.data);else{var t=e.data;if("string"==typeof t)try{t=JSON.parse(t)}catch(e){console.error("Bellhop error: ",e)}this.connected&&"object"===(void 0===t?"undefined":n(t))&&t.type&&this.trigger(t)}}},{key:"onConnectionReceived",value:function(e){this.connecting=!1,this.connected=!0,this.isChild||this.target.postMessage(e,this.origin);for(var t=0;t<this._sendLater.length;t++){var o=this._sendLater[t],n=o.type,i=o.data;this.send(n,i)}this._sendLater.length=0,this.trigger("connected")}},{key:"connect",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"*";this.connecting||(this.disconnect(),this.connecting=!0,e instanceof HTMLIFrameElement&&(this.iframe=e),this.isChild=void 0===e,this.supported=!0,this.isChild&&(this.supported=window!=e),this.origin=t,window.addEventListener("message",this.receive.bind(this)),this.isChild&&(window===this.target?this.trigger("failed"):this.target.postMessage("connected",this.origin)))}},{key:"disconnect",value:function(){this.connected=!1,this.connecting=!1,this.origin=null,this.iframe=null,this.isChild=!0,this._sendLater.length=0,window.removeEventListener("message",this.receive)}},{key:"send",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if("string"!=typeof e)throw"The event type must be a string";var o={type:e,data:t};this.connecting?this._sendLater.push(o):this.target.postMessage(JSON.stringify(o),this.origin)}},{key:"fetch",value:function(e,t){var o=this,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},i=arguments.length>3&&void 0!==arguments[3]&&arguments[3];if(!this.connecting&&!this.connected)throw"No connection, please call connect() first";this.on(e,function e(n){i&&o.off(n.type,e),t(n)}),this.send(e,n)}},{key:"respond",value:function(e){var t=this,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=arguments.length>2&&void 0!==arguments[2]&&arguments[2];this.on(e,function i(s){n&&t.off(s.type,i),t.send(e,"function"==typeof o?o():o)})}},{key:"destroy",value:function(){(function e(t,o,n){null===t&&(t=Function.prototype);var i=Object.getOwnPropertyDescriptor(t,o);if(void 0===i){var s=Object.getPrototypeOf(t);return null===s?void 0:e(s,o,n)}if("value"in i)return i.value;var r=i.get;return void 0!==r?r.call(n):void 0})(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"destroy",this).call(this),this.disconnect(),this._sendLater.length=0}},{key:"target",get:function(){return this.isChild?window.parent:this.iframe.contentWindow}}]),t}();const l=new class{constructor(){this._bellhop=new a,this._timer=null,this._onConnected=null,this._bellhop.on("connected",()=>{this._timer&&(clearTimeout(this._timer),this._timer=null),this._onConnected&&this._onConnected()})}connect({discourseOrigin:t,onConnected:o,timeout:n,onTimeout:i}){e.throwIf(!e.inIFrame()),this._onConnected=o,this._timer=n?setTimeout(()=>{i&&i()},n):null,this._bellhop.connect(void 0,t)}onDiscourseRoutePushed(e){this._bellhop.on("m2",t=>e(t.data))}onCountsChanged(e){this._bellhop.on("m3",t=>e(t.data))}postSetDiscourseRoute({route:e,mode:t,clientContext:o}){this._bellhop.send("m4",arguments[0])}postSetHash({hash:e,mode:t}){this._bellhop.send("m5",arguments[0])}postSetRouteProps({category:e,discourseTitle:t,error:o}){this._bellhop.send("m6",arguments[0])}postSetRedirects(e){this._bellhop.send("m7",e)}};function d(e){const t=e.getBoundingClientRect();t.top<window.innerHeight&&t.bottom>=0||(e.scrollIntoView(),window.scrollBy(0,-50))}const h=new class{constructor(){this.selTriggerNode=null,this.resizeTimer=null,l.onDiscourseRoutePushed(this._onDiscourseRoutePushed.bind(this)),l.onCountsChanged(({counts:e})=>console.log("counts: ",e))}connect({discourseOrigin:e,timeout:t}){return new Promise((o,n)=>{this.resolveInit=o,l.connect({discourseOrigin:e,timeout:t,onTimeout:()=>n("timeout")})})}parseDom({descr:t,pageName:o,counts:n}){return(t.staticPages||[]).forEach(e=>{let t=new URL(e.url,location.href);e.url=t.href}),e.dom.onDOMReady().then(()=>{e.dom.forEach(document.getElementsByTagName("a"),e=>{if(e.dataset.dcsDiscourseLink)e.onclick=(t=>{t.preventDefault(),t.stopPropagation(),l.postSetDiscourseRoute({route:{layout:"FULL_DISCOURSE",path:e.pathname},mode:"PUSH",clientContext:!0})});else if(e.href.split("#")[0]===location.href.split("#")[0])e.onclick=(()=>{l.postSetHash({hash:e.hash,mode:"REPLACE"})});else{const o=e.href.split("#")[0],n=t.staticPages.find(e=>e.url===o);n?(e.href=document.referrer+"docuss/"+n.name,e.target&&"_self"!==e.target||(e.onclick=(e=>{e.preventDefault(),e.stopPropagation(),l.postSetDiscourseRoute({route:{layout:"FULL_CLIENT",pageName:n.name},mode:"PUSH",clientContext:!0})}))):e.target&&"_self"!==e.target||(e.target="_parent")}});const n=document.getElementsByClassName("dcs-trigger"),i={};e.dom.forEach(n,e=>{const t=e.dataset.dcsTriggerId,o=i[t]||!!e.dataset.dcsHighlightable;i[t]=o});const s=Object.keys(i).filter(e=>!i[e]).map(e=>({src:{layout:"WITH_SPLIT_BAR",triggerId:e,showRight:!1},dest:{layout:"FULL_CLIENT"}}));l.postSetRedirects(s),e.dom.forEach(document.querySelectorAll(".dcs-icons, .dcs-trigger.dcs-no-balloon .dcs-trigger-span, .dcs-trigger.dcs-no-balloon.dcs-no-span"),e=>{e.onclick=(e=>{if(window.getSelection().toString())return;const t=e.target.closest(".dcs-trigger"),n=t.dataset.dcsTriggerId;this._selectTriggers(n),l.postSetDiscourseRoute({route:{layout:"WITH_SPLIT_BAR",pageName:t.dataset.dcsPageName||o,triggerId:n,interactMode:t.dataset.dcsInteractMode,showRight:!0},mode:"PUSH",clientContext:!0}),e.stopPropagation()})}),this.runReady=!0,window.addEventListener("click",()=>{this.selTriggerNode&&this.selTriggerNode.dataset.dcsHighlightable&&(this._selectTriggers(null),l.postSetDiscourseRoute({route:{layout:"FULL_CLIENT",pageName:o},mode:"PUSH",clientContext:!0}))}),window.addEventListener("resize",e=>{null!==this.resizeTimer&&clearTimeout(this.resizeTimer),this.resizeTimer=setTimeout(()=>{this.resizeTimer=null,this.selTriggerNode&&d(this.selTriggerNode)},100)}),this.delayedRoute&&this._onDiscourseRoutePushed({route:this.delayedRoute})})}_onDiscourseRoutePushed({route:e,descr:t,counts:n,clientContext:i}){if(this.resolveInit)return this.resolveInit({descr:t,pageName:e.pageName,counts:n}),delete this.resolveInit,o.init(t.dcsTag),this.runReady=!1,void(this.delayedRoute=e);if(this.runReady){if("WITH_SPLIT_BAR"===e.layout){const t=e.triggerId&&document.querySelector(`.dcs-trigger[data-dcs-trigger-id="${e.triggerId}"]`),o=t&&t.dataset.dcsCategory||document.documentElement.dataset.dcsCategory,n=t&&t.dataset.dcsDiscourseTitle||document.documentElement.dataset.dcsDiscourseTitle;l.postSetRouteProps({category:o,discourseTitle:n})}i||this._selectTriggers(e.triggerId)}else this.delayedRoute=e}_selectTriggers(t){if(this.selTriggerNode=null,e.dom.forEach(document.getElementsByClassName("dcs-highlighted"),e=>e.classList.remove("dcs-highlighted")),!t)return;const o=document.querySelectorAll(`.dcs-trigger[data-dcs-trigger-id="${t}"]`);o.length?(e.dom.forEach(o,e=>{if(e.dataset.dcsHighlightable){e.classList.add("dcs-highlighted");const t=e.closest(".dcs-subsec");t&&t.classList.add("dcs-highlighted")}}),this.selTriggerNode=o[0],setTimeout(()=>d(this.selTriggerNode),700)):l.postSetRouteProps({error:error})}};h.connect({discourseOrigin:"*",timeout:1e4}).then(e=>{h.parseDom(e)},e=>logError("Unable to connect to dcs-discourse-plugin2",e))}();
//# sourceMappingURL=dcs-html-based.js.map
