import {createStore, applyMiddleware, compose, combineReducers, Action, Store, Reducer, ReducersMapObject} from 'redux';
import {createEpicMiddleware, combineEpics, Epic, ActionsObservable} from 'redux-observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/mergeMap';

export type RegisterReducer = {
    name: string,
    fn: Reducer<any>,
    initPayload?: any
}

export type RegisterObject = {
    reducers?: RegisterReducer[];
    epics?: Epic<Action, any>[];
    initEpic?: Epic<Action, any>;
}

export type EpicStoreProps = {
    register(props: RegisterObject): void;
}

export type EpicStore<T> = Store<T> & EpicStoreProps;

export function createEpicStore(initialReducerTree: ReducersMapObject = {}, initialEpics: Epic<Action, any>[] = [], dependencies = {}) {

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
    (store as any).register = function (incoming: RegisterObject) {
        const {reducers, epics, initEpic} = incoming;
        if (epics) {
            if (Array.isArray(epics)) {
                epics.forEach(epicFn => epic$.next(epicFn));
            } else {
                console.error(`epics: must be an array of functions`);
            }
        }
        if (reducers) {
            if (Array.isArray(reducers)) {
                reducers.forEach(reducerItem => {
                    injectAsyncReducer(store, reducerItem.name, reducerItem.fn);
                    store.dispatch({
                        type: `@@@AsyncModuleInit:${reducerItem.name}`,
                        payload: reducerItem.initPayload,
                    });
                });
            } else {
                console.error(`reducers: must be an array of reducer objects containing 'name', 'fn' and optionally 'initPayload'`);
            }
        }
        if (initEpic && typeof initEpic === 'function') {
            epic$.next(initEpic);
        }
    };

    return store;

    function createReducer(asyncReducers?: any) {
        return combineReducers({
            ...initialReducerTree,
            ...asyncReducers
        });
    }

    function injectAsyncReducer(store: Store<any>, name: string, asyncReducer: Reducer<any>) {
        (store as any).asyncReducers[name] = asyncReducer;
        store.replaceReducer(createReducer((store as any).asyncReducers));
    }
}

export default createEpicStore;
