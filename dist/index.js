"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _fire = _interopRequireDefault(require("./mage/fire"));

var _combat = _interopRequireDefault(require("./rogue/combat"));

var _assassination = _interopRequireDefault(require("./rogue/assassination"));

var _fury = _interopRequireDefault(require("./warrior/fury"));

var _arms = _interopRequireDefault(require("./warrior/arms"));

var _shadow = _interopRequireDefault(require("./priest/shadow"));

var _elemental = _interopRequireDefault(require("./shaman/elemental"));

var _enhancement = _interopRequireDefault(require("./shaman/enhancement"));

var _destruction = _interopRequireDefault(require("./warlock/destruction"));

var _retribution = _interopRequireDefault(require("./paladin/retribution"));

var _balance = _interopRequireDefault(require("./druid/balance"));

var _feral = _interopRequireDefault(require("./druid/feral"));

var _beastmastery = _interopRequireDefault(require("./hunter/beastmastery"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var damageModel = function damageModel(props) {
  var spec = props.spec,
      className = props.character.data.class;
  var specName = ((spec && spec.name || '') + className).toLowerCase();

  switch (specName) {
    case 'firemage':
      return (0, _fire.default)(props);

    case 'combatrogue':
      return (0, _combat.default)(props);

    case 'assassinationrogue':
      return (0, _assassination.default)(props);

    case 'furywarrior':
      return (0, _fury.default)(props);

    case 'armswarrior':
      return (0, _arms.default)(props);

    case 'shadowpriest':
      return (0, _shadow.default)(props);

    case 'elementalshaman':
      return (0, _elemental.default)(props);

    case 'enhancementshaman':
      return (0, _enhancement.default)(props);

    case 'destructionwarlock':
      return (0, _destruction.default)(props);

    case 'retributionpaladin':
      return (0, _retribution.default)(props);

    case 'balancedruid':
      return (0, _balance.default)(props);

    case 'feraldruid':
      return (0, _feral.default)(props);

    case 'beastmasteryhunter':
      return (0, _beastmastery.default)(props);

    default:
      return [];
  }
};

var _default = damageModel;
exports.default = _default;
