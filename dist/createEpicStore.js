"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var redux_1 = require("redux");
var redux_observable_1 = require("redux-observable");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
require("rxjs/add/operator/mergeMap");
var empty_1 = require("rxjs/observable/empty");
function createEpicStore(initialReducerTree, initialEpics, dependencies) {
    if (initialReducerTree === void 0) { initialReducerTree = {}; }
    if (initialEpics === void 0) { initialEpics = []; }
    if (dependencies === void 0) { dependencies = {}; }
    var epic$ = new BehaviorSubject_1.BehaviorSubject(redux_observable_1.combineEpics.apply(void 0, initialEpics));
    function rootEpic(action$, store, deps) {
        return epic$.flatMap(function (epic) {
            return epic(action$, store, deps);
        })
            .catch(function (e) {
            console.log('create-epic-store: Uncaught Error', e);
            return empty_1.empty();
        });
    }
    var epicMiddleware = redux_observable_1.createEpicMiddleware(rootEpic, {
        dependencies: dependencies,
    });
    var composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || redux_1.compose;
    var store = redux_1.createStore(createReducer(), composeEnhancers(redux_1.applyMiddleware(epicMiddleware)));
    store.asyncReducers = {};
    store.register = function (incoming, cb) {
        if (cb === void 0) { cb = function () { }; }
        var reducers = incoming.reducers, epics = incoming.epics, initEpic = incoming.initEpic;
        if (epics) {
            if (Array.isArray(epics)) {
                epics.forEach(function (epicFn) { return epic$.next(epicFn); });
            }
            else {
                console.error("epics: must be an array of functions");
            }
        }
        if (reducers) {
            if (Array.isArray(reducers)) {
                reducers.forEach(function (reducerItem) {
                    injectAsyncReducer(store, reducerItem.name, reducerItem.fn);
                    store.dispatch({
                        type: "@@@AsyncModuleInit:" + reducerItem.name,
                        payload: reducerItem.initPayload,
                    });
                });
            }
            else {
                console.error("reducers: must be an array of reducer objects containing 'name', 'fn' and optionally 'initPayload'");
            }
        }
        if (initEpic && typeof initEpic === 'function') {
            setTimeout(function () {
                epic$.next(initEpic);
                setTimeout(function () { return cb(); }, 0);
            }, 0);
        }
        else {
            setTimeout(function () { return cb(); }, 0);
        }
    };
    return store;
    function createReducer(asyncReducers) {
        return redux_1.combineReducers(__assign({}, initialReducerTree, asyncReducers));
    }
    function injectAsyncReducer(store, name, asyncReducer) {
        store.asyncReducers[name] = asyncReducer;
        store.replaceReducer(createReducer(store.asyncReducers));
    }
}
exports.createEpicStore = createEpicStore;
exports.default = createEpicStore;
//# sourceMappingURL=createEpicStore.js.map