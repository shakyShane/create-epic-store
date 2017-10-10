import {createStore, applyMiddleware, compose, combineReducers, Action, Store, Reducer} from 'redux';
import {createEpicMiddleware, combineEpics, Epic, ActionsObservable} from 'redux-observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/mergeMap';
import {Observable} from "rxjs/Observable";

export type ReducerTree = {[index: string]: Reducer<any>}
export type EpicFn = (action$?: Observable<Action>, store?: Store<any>, dependencies?: {[index: string]: any}) => Observable<Action>

export function createEpicStore(initialReducerTree: ReducerTree = {}, initialEpics: EpicFn[] = [], dependencies = {}) {

    const epic$ = new BehaviorSubject(combineEpics(...initialEpics));

    function rootEpic (action$: ActionsObservable<Action>, store: Store<any>, deps: {[index: string]: any}): any {
        return epic$.flatMap((epic) => {
            return epic(action$, store, deps)
        });
    }

    const epicMiddleware = createEpicMiddleware(rootEpic, {
        dependencies,
    });

    const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

    const store = createStore(
        createReducer(),
        composeEnhancers(
            applyMiddleware(epicMiddleware)
        )
    );

    (store as any).asyncReducers = {};
    (store as any).register = function (incoming) {
        const {reducers, epics, middleware} = incoming;
        if (epics.length) {
            epics.forEach(epicFn => epic$.next(epicFn));
        }
        if (reducers.length > 0) {
            reducers.forEach(reducerItem => {
                injectAsyncReducer(store, reducerItem.name, reducerItem.fn);
                store.dispatch({
                    type: `@@@AsyncModuleInit:${reducerItem.name}`,
                    payload: reducerItem.initPayload,
                });
            });
        }
    };

    return store;

    function createReducer(asyncReducers?) {
        return combineReducers({
            ...initialReducerTree,
            ...asyncReducers
        });
    }

    function injectAsyncReducer(store, name, asyncReducer) {
        store.asyncReducers[name] = asyncReducer;
        store.replaceReducer(createReducer(store.asyncReducers));
    }
}

export default createEpicStore;
