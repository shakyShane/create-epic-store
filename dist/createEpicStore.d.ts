import { Store, Reducer, ReducersMapObject, Middleware } from 'redux';
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
    epics?: any;
    initEpic?: any;
};
export declare type EpicStoreProps = {
    register(props: RegisterObject): void;
};
export declare type EpicStore<T> = Store<T> & EpicStoreProps;
export declare function createEpicStore(initialReducerTree?: ReducersMapObject, initialEpics?: any[], dependencies?: {}, middlewares?: Middleware[]): Store<{}>;
export default createEpicStore;
