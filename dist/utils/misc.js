"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addNumbers = addNumbers;
exports.multiplyNumbers = multiplyNumbers;

var _decimal = _interopRequireDefault(require("decimal.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function addNumbers(val, val2) {
  var one = new _decimal.default(val ? val : 0);
  var two = new _decimal.default(val2 ? val2 : 0);
  return one.add(two).toNumber();
}

function multiplyNumbers(val, val2) {
  var one = new _decimal.default(val ? val : 1);
  var two = new _decimal.default(val2 ? val2 : 1);
  return one.mul(two).toNumber();
}