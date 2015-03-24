"use strict";

var LocationActions = require("../actions/LocationActions");
var History = require("../History");

var _listeners = [];
var _isListening = false;

function notifyChange(type, payload) {
  var change = {
    path: HistoryLocation.getCurrentPath(),
    type: type,
    payload: payload
  };

  _listeners.forEach(function (listener) {
    listener.call(HistoryLocation, change);
  });
}

function onPopState(event) {
  if (event.state === undefined) {
    return;
  } // Ignore extraneous popstate events in WebKit.

  notifyChange(LocationActions.POP);
}

/**
 * A Location that uses HTML5 history.
 */
var HistoryLocation = {

  addChangeListener: function addChangeListener(listener) {
    _listeners.push(listener);

    if (!_isListening) {
      if (window.addEventListener) {
        window.addEventListener("popstate", onPopState, false);
      } else {
        window.attachEvent("onpopstate", onPopState);
      }

      _isListening = true;
    }
  },

  removeChangeListener: function removeChangeListener(listener) {
    _listeners = _listeners.filter(function (l) {
      return l !== listener;
    });

    if (_listeners.length === 0) {
      if (window.addEventListener) {
        window.removeEventListener("popstate", onPopState, false);
      } else {
        window.removeEvent("onpopstate", onPopState);
      }

      _isListening = false;
    }
  },

  push: function push(path, payload) {
    window.history.pushState({ path: path }, "", path);
    History.length += 1;
    notifyChange(LocationActions.PUSH, payload);
  },

  replace: function replace(path, payload) {
    window.history.replaceState({ path: path }, "", path);
    notifyChange(LocationActions.REPLACE, payload);
  },

  pop: History.back,

  getCurrentPath: function getCurrentPath() {
    return decodeURI(window.location.pathname + window.location.search);
  },

  toString: function toString() {
    return "<HistoryLocation>";
  }

};

module.exports = HistoryLocation;