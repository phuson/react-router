"use strict";

var LocationActions = require("../actions/LocationActions");
var History = require("../History");

var _listeners = [];
var _isListening = false;
var _actionType;
var _payload = [];

function notifyChange(type, payload) {
  if (type === LocationActions.PUSH) History.length += 1;

  var change = {
    path: HashLocation.getCurrentPath(),
    type: type,
    payload: payload
  };

  _listeners.forEach(function (listener) {
    listener.call(HashLocation, change);
  });
}

function ensureSlash() {
  var path = HashLocation.getCurrentPath();

  if (path.charAt(0) === "/") {
    return true;
  }HashLocation.replace("/" + path);

  return false;
}

function onHashChange() {
  if (ensureSlash()) {
    // If we don't have an _actionType then all we know is the hash
    // changed. It was probably caused by the user clicking the Back
    // button, but may have also been the Forward button or manual
    // manipulation. So just guess 'pop'.
    notifyChange(_actionType || LocationActions.POP, _payload.pop());
    _actionType = null;
  }
}

/**
 * A Location that uses `window.location.hash`.
 */
var HashLocation = {

  addChangeListener: function addChangeListener(listener) {
    _listeners.push(listener);

    // Do this BEFORE listening for hashchange.
    ensureSlash();

    if (!_isListening) {
      if (window.addEventListener) {
        window.addEventListener("hashchange", onHashChange, false);
      } else {
        window.attachEvent("onhashchange", onHashChange);
      }

      _isListening = true;
    }
  },

  removeChangeListener: function removeChangeListener(listener) {
    _listeners = _listeners.filter(function (l) {
      return l !== listener;
    });

    if (_listeners.length === 0) {
      if (window.removeEventListener) {
        window.removeEventListener("hashchange", onHashChange, false);
      } else {
        window.removeEvent("onhashchange", onHashChange);
      }

      _isListening = false;
    }
  },

  push: function push(path, payload) {
    _actionType = LocationActions.PUSH;
    _payload.push(payload);
    window.location.hash = path;
  },

  replace: function replace(path, payload) {
    _actionType = LocationActions.REPLACE;
    _payload.push(payload);
    window.location.replace(window.location.pathname + window.location.search + "#" + path);
  },

  pop: function pop() {
    _actionType = LocationActions.POP;
    History.back();
  },

  getCurrentPath: function getCurrentPath() {
    return decodeURI(
    // We can't use window.location.hash here because it's not
    // consistent across browsers - Firefox will pre-decode it!
    window.location.href.split("#")[1] || "");
  },

  toString: function toString() {
    return "<HashLocation>";
  }

};

module.exports = HashLocation;