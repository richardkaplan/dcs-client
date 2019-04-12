// Allow finding Bellhop import from npm package
import resolve from 'rollup-plugin-node-resolve'
import strip from 'rollup-plugin-strip'
// Allows sourcemaps from external libs to be included in output sourcemaps
import sourcemaps from 'rollup-plugin-sourcemaps'
import { terser } from 'rollup-plugin-terser'

const prod = true //process.env.NODE_ENV === 'production'

const plugins = minify => [
  resolve(),
  sourcemaps(),
  prod && strip({ functions: ['u.dev.*'] }),
  prod && terser({ toplevel: true })
]

export default [
  {
    input: 'src/comToPlugin.js',
    output: {
      file: 'dist/comToPlugin.js',
      format: 'es',
      sourcemap: false
    },
    plugins: plugins(false)
  },
  {
    input: 'src/htmlBased.js',
    output: {
      file: 'dist/htmlBased.js',
      format: 'es',
      sourcemap: false
    },
    plugins: plugins(false)
  },
  {
    input: 'src/dcs-html-based.js',
    output: {
      file: 'dist/dcs-html-based.js',
      format: 'iife',
      name: 'DcsUnused',
      sourcemap: prod ? true : 'inline'
    },
    plugins: plugins(true)
  },
  {
    input: 'src/dcs-decorator.js',
    output: {
      file: 'dist/dcs-decorator.js',
      format: 'iife',
      name: 'DcsUnused',
      sourcemap: prod ? true : 'inline'
    },
    plugins: plugins(true)
  }
]
