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
function createEpicStore(initialReducerTree, initialEpics, dependencies) {
    if (initialReducerTree === void 0) { initialReducerTree = {}; }
    if (initialEpics === void 0) { initialEpics = []; }
    if (dependencies === void 0) { dependencies = {}; }
    var epic$ = new BehaviorSubject_1.BehaviorSubject(redux_observable_1.combineEpics.apply(void 0, initialEpics));
    function rootEpic(action$, store, deps) {
        return epic$.flatMap(function (epic) {
            return epic(action$, store, deps);
        });
    }
    var epicMiddleware = redux_observable_1.createEpicMiddleware(rootEpic, {
        dependencies: dependencies,
    });
    var composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || redux_1.compose;
    var store = redux_1.createStore(createReducer(), composeEnhancers(redux_1.applyMiddleware(epicMiddleware)));
    store.asyncReducers = {};
    store.register = function (incoming) {
        var reducers = incoming.reducers, epics = incoming.epics, middleware = incoming.middleware, initEpic = incoming.initEpic;
        if (epics.length) {
            epics.forEach(function (epicFn) { return epic$.next(epicFn); });
        }
        if (reducers.length > 0) {
            reducers.forEach(function (reducerItem) {
                injectAsyncReducer(store, reducerItem.name, reducerItem.fn);
                store.dispatch({
                    type: "@@@AsyncModuleInit:" + reducerItem.name,
                    payload: reducerItem.initPayload,
                });
            });
        }
        if (initEpic && typeof initEpic === 'function') {
            epic$.next(initEpic);
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