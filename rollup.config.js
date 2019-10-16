/*
 * @Date: 2019-10-16 11:47:00
 * @Author: Vesper
 * @LastEditTime: 2019-10-16 14:43:21
 * @LastEditors: Vesper
 */
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/request.umd.min.js',
    format: 'umd',
    name: 'request'
  },
  plugins: [
    resolve({ mainFields: ['jsnext', 'preferBuiltins', 'browser'] }),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
    }),
    uglify()
  ]
};
