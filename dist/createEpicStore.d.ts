import { Action, Store, Reducer, ReducersMapObject } from 'redux';
import { Epic } from 'redux-observable';
import 'rxjs/add/operator/mergeMap';
export declare type RegisterReducer = {
    name: string;
    fn: Reducer<any>;
    initPayload?: any;
};
export declare type RegisterObject = {
    reducers?: RegisterReducer[];
    epics?: Epic<Action, any>[];
    initEpic?: Epic<Action, any>;
};
export declare type EpicStoreProps = {
    register(props: RegisterObject): void;
};
export declare type EpicStore<T> = Store<T> & EpicStoreProps;
export declare function createEpicStore(initialReducerTree?: ReducersMapObject, initialEpics?: Epic<Action, any>[], dependencies?: {}): Store<any>;
export default createEpicStore;
