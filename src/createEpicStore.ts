import {createStore, applyMiddleware, compose, combineReducers, Store, Reducer, ReducersMapObject, Middleware} from 'redux';
import {createEpicMiddleware, combineEpics} from 'redux-observable';
import { BehaviorSubject } from 'rxjs';
import {mergeMap} from "rxjs/operators";

export type RegisterReducer = {
    name: string,
    fn: Reducer<any>,
    initPayload?: any
}

export type EpicAction = {
    type: string;
    payload?: any;
    meta?: any
}

export type RegisterObject = {
    reducers?: RegisterReducer[];
    epics?: any;
    initEpic?: any;
}

export type EpicStoreProps = {
    register(props: RegisterObject): void;
}

export type EpicStore<T> = Store<T> & EpicStoreProps;

export function createEpicStore(
    initialReducerTree: ReducersMapObject = {},
    initialEpics: any[] = [],
    dependencies = {},
    middlewares: Middleware[] = []
    ) {

    const epic$ = new BehaviorSubject(combineEpics(...initialEpics) as any);

    function rootEpic (action$: any, store: Store<any>, deps: {[index: string]: any}): any {
        return epic$.pipe(mergeMap((epic) => {
            return epic(action$, store, deps)
        }));
    }

    const epicMiddleware = createEpicMiddleware(rootEpic as any, {
        dependencies,
    } as any);

    const composeEnhancers = (() => {
        if (typeof window !== 'undefined') {
            return (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
        }
        return compose;
    })();

    const store = createStore(
        createReducer(),
        composeEnhancers(
            applyMiddleware(epicMiddleware, ...middlewares)
        )
    );

    (store as any).asyncReducers = {};
    (store as any).register = function (incoming: RegisterObject, cb: Function = () => {/**/}) {
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
            setTimeout(() => {
                epic$.next(initEpic);
                setTimeout(() => cb(), 0);
            }, 0);
        } else {
            setTimeout(() => cb(), 0);
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
