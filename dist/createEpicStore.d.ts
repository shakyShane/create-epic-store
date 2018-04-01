import { Store, Reducer, ReducersMapObject, Middleware } from 'redux';
import { Epic } from 'redux-observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';
export declare type RegisterReducer = {
    name: string;
    fn: Reducer<any>;
    initPayload?: any;
};
export declare type EpicAction = {
    type: string;
    payload?: any;
    meta?: any;
};
export declare type RegisterObject = {
    reducers?: RegisterReducer[];
    epics?: Epic<EpicAction, any>[];
    initEpic?: Epic<EpicAction, any>;
};
export declare type EpicStoreProps = {
    register(props: RegisterObject): void;
};
export declare type EpicStore<T> = Store<T> & EpicStoreProps;
export declare function createEpicStore(initialReducerTree?: ReducersMapObject, initialEpics?: Epic<EpicAction, any>[], dependencies?: {}, middlewares?: Middleware[]): Store<any>;
export default createEpicStore;
