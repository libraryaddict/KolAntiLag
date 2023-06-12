/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  main: () => (/* binding */ main)
});

;// CONCATENATED MODULE: external "kolmafia"
const external_kolmafia_namespaceObject = require("kolmafia");
;// CONCATENATED MODULE: ./src/AntiLag.ts
function _toConsumableArray(arr) {return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();}function _nonIterableSpread() {throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _iterableToArray(iter) {if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);}function _arrayWithoutHoles(arr) {if (Array.isArray(arr)) return _arrayLikeToArray(arr);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];return arr2;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);Object.defineProperty(Constructor, "prototype", { writable: false });return Constructor;}function _defineProperty(obj, key, value) {key = _toPropertyKey(key);if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _toPropertyKey(arg) {var key = _toPrimitive(arg, "string");return typeof key === "symbol" ? key : String(key);}function _toPrimitive(input, hint) {if (typeof input !== "object" || input === null) return input;var prim = input[Symbol.toPrimitive];if (prim !== undefined) {var res = prim.call(input, hint || "default");if (typeof res !== "object") return res;throw new TypeError("@@toPrimitive must return a primitive value.");}return (hint === "string" ? String : Number)(input);}var

AntiLag = /*#__PURE__*/function () {









  function AntiLag() {_classCallCheck(this, AntiLag);_defineProperty(this, "lastLagTests", "lastLagRecords");_defineProperty(this, "lastLagTested", "_lastLagTested");_defineProperty(this, "thisSessionLag", "_thisSessionLag");_defineProperty(this, "testsBeforeFailing", void 0);_defineProperty(this, "maxToStore", void 0);_defineProperty(this, "testsToStartWith", void 0);_defineProperty(this, "cacheMinuteExpires", void 0);_defineProperty(this, "warnCantFind", void 0);
    this.updateNumbers();
  }_createClass(AntiLag, [{ key: "updateNumbers", value:

    function updateNumbers() {
      var getProp = (s, def) => {
        if (typeof def == "number") {
          if (!(0,external_kolmafia_namespaceObject.getProperty)(s).match(/^\d+$/)) {
            (0,external_kolmafia_namespaceObject.setProperty)(s, def.toString());
          }

          return (0,external_kolmafia_namespaceObject.toInt)((0,external_kolmafia_namespaceObject.getProperty)(s));
        } else if (typeof def == "boolean") {
          if (!(0,external_kolmafia_namespaceObject.getProperty)(s).match(/^true|false$/)) {
            (0,external_kolmafia_namespaceObject.setProperty)(s, def.toString());
          }

          return (0,external_kolmafia_namespaceObject.toBoolean)((0,external_kolmafia_namespaceObject.getProperty)(s));
        } else {
          throw "Unknown type";
        }
      };

      this.testsToStartWith = getProp("antilag_min_dataset", 5);
      this.testsBeforeFailing = getProp("antilag_max_attempts", 5);
      this.cacheMinuteExpires = getProp("antilag_cache_minutes", 15);
      this.maxToStore = Math.max(
        this.testsToStartWith,
        getProp("antilag_max_stored", 15)
      );
      this.warnCantFind = getProp("antilag_attempts_failed", true);
    } }, { key: "getCurrentLag", value:

    function getCurrentLag() {
      var getParkaNext = () => {
        return (0,external_kolmafia_namespaceObject.getProperty)("parkaMode") == "spikolodon" ?
        "kachungasaur" :
        "spikolodon";
      };

      var started = Date.now();

      for (var i = 0; i < 2; i++) {
        (0,external_kolmafia_namespaceObject.cliExecute)("parka " + getParkaNext());
      }

      return Date.now() - started;
    } }, { key: "getLastTests", value:

    function getLastTests() {
      return (0,external_kolmafia_namespaceObject.getProperty)(this.lastLagTests).
      split(",").
      filter((s) => s.length > 0).
      map((s) => (0,external_kolmafia_namespaceObject.toInt)(s));
    } }, { key: "saveLastTests", value:

    function saveLastTests(test) {
      (0,external_kolmafia_namespaceObject.setProperty)(this.lastLagTests, test.join(","));
    } }, { key: "relog", value:

    function relog() {
      var hash = (0,external_kolmafia_namespaceObject.myHash)();

      try {
        (0,external_kolmafia_namespaceObject.visitUrl)("logout.php");
      } catch (ignored) {

        // Ignored
      }
      var i = 0;

      while (true) {
        try {
          if ((0,external_kolmafia_namespaceObject.myHash)().length > 0 && hash != (0,external_kolmafia_namespaceObject.myHash)()) {
            break;
          }

          if (i++ > 0) {
            (0,external_kolmafia_namespaceObject.wait)(30);
          }

          (0,external_kolmafia_namespaceObject.print)("Trying to log in..", "gray");
          (0,external_kolmafia_namespaceObject.visitUrl)("main.php");
        } catch (e) {
          if (!("" + e).includes("Too many server redirects")) {
            throw e;
          }
        }
      }
    } }, { key: "isSafeToRun", value:

    function isSafeToRun() {
      if ((0,external_kolmafia_namespaceObject.currentRound)() != 0) {
        return false;
      }

      if ((0,external_kolmafia_namespaceObject.handlingChoice)() || (0,external_kolmafia_namespaceObject.choiceFollowsFight)() || (0,external_kolmafia_namespaceObject.fightFollowsChoice)()) {
        return false;
      }

      if ((0,external_kolmafia_namespaceObject.inMultiFight)()) {
        return false;
      }

      return true;
    } }, { key: "hasTestedThisSession", value:

    function hasTestedThisSession() {
      var setting = (0,external_kolmafia_namespaceObject.getProperty)(this.lastLagTested).split("|");

      if (setting.length != 2) {
        return false;
      }

      if (setting[0] != (0,external_kolmafia_namespaceObject.myHash)()) {
        return false;
      }

      var diff = Date.now() - (0,external_kolmafia_namespaceObject.toInt)(setting[1]);
      var expiresAfter = 1000 * 60 * this.cacheMinuteExpires;

      if (diff > expiresAfter) {
        return false;
      }

      return true;
    } }, { key: "getSessionLag", value:

    function getSessionLag() {
      if (!this.hasTestedThisSession()) {
        var current = this.getCurrentLag();
        (0,external_kolmafia_namespaceObject.setProperty)(this.thisSessionLag, current.toString());
        (0,external_kolmafia_namespaceObject.setProperty)(this.lastLagTested, (0,external_kolmafia_namespaceObject.myHash)() + "|" + Date.now());

        var tests = [current].concat(_toConsumableArray(this.getLastTests()));

        if (tests.length > this.maxToStore) {
          tests.pop();
        }

        this.saveLastTests(tests);
      }

      return (0,external_kolmafia_namespaceObject.toInt)((0,external_kolmafia_namespaceObject.getProperty)(this.thisSessionLag));
    } }, { key: "getBestLatency", value:

    function getBestLatency() {
      var lastTests = this.getLastTests();

      if (lastTests.length == 0) {
        return 10000;
      }

      return lastTests.reduce((l, r) => Math.min(l, r));
    } }, { key: "getIdealLatency", value:

    function getIdealLatency() {
      return this.getBestLatency() * 1.1;
    } }, { key: "isGoodSession", value:

    function isGoodSession() {
      var current = this.getSessionLag();

      return this.getIdealLatency() > current;
    } }, { key: "ensureLowLag", value:

    function ensureLowLag() {
      var attempts = [];
      var fillingData = () =>
      this.getLastTests().length < this.testsToStartWith;

      while (fillingData() || !this.isGoodSession()) {
        attempts.push(this.getSessionLag());

        (0,external_kolmafia_namespaceObject.print)("Current latency of ".concat(
          this.getNumber(
            this.getSessionLag()
          ), "ms, minimum is ").concat(this.getNumber(
          Math.round(this.getIdealLatency())
        ), "ms"),
        "blue"
        );

        if (fillingData()) {
          (0,external_kolmafia_namespaceObject.print)(
            "Currently filling data, need " + (
            this.testsToStartWith - this.getLastTests().length) +
            " more data points..",
            "gray"
          );
        }

        if (
        attempts.length >= this.testsBeforeFailing &&
        this.getLastTests().length >= this.testsToStartWith)
        {
          var msg =
          "Done " + attempts.length + " attempts, but it isn't getting better.";

          if (!this.warnCantFind) {
            (0,external_kolmafia_namespaceObject.print)(msg + " Won't make anymore attempts.", "red");
            break;
          }

          if ((0,external_kolmafia_namespaceObject.userConfirm)(msg + " Abort?\n" + attempts.join(" > "))) {
            throw "Abort requested";
          }
        }

        this.relog();
      }

      (0,external_kolmafia_namespaceObject.print)("Currently ".concat(
        this.getNumber(this.getSessionLag()), "ms, ").concat(
        this.getSessionLag() <= this.getBestLatency() ? "reached" : "failed", " goal of under ").concat(
        this.getNumber(
          this.getIdealLatency()
        ), "ms. Ideal is ").concat(this.getNumber(this.getBestLatency()), "ms"),
      "blue"
      );
    } }, { key: "getNumber", value:

    function getNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } }]);return AntiLag;}();


function main() {
  new AntiLag().ensureLowLag();
}
var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;