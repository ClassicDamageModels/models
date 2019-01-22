import Decimal from 'decimal.js'

export function addNumbers(val, val2) {
  const one = new Decimal(val ? val : 0)
  const two = new Decimal(val2 ? val2 : 0)
  return one.add(two).toNumber()
}

export function multiplyNumbers(val, val2) {
  const one = new Decimal(val ? val : 1)
  const two = new Decimal(val2 ? val2 : 1)
  return one.mul(two).toNumber()
}
