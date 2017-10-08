import { Action, Store, Reducer } from 'redux';
import 'rxjs/add/operator/mergeMap';
import { Observable } from "rxjs/Observable";
export declare type ReducerTree = {
    [index: string]: Reducer<any>;
};
export declare type EpicFn = (action$?: Observable<Action>, store?: Store<any>, dependencies?: {
    [index: string]: any;
}) => Observable<Action>;
export declare function createEpicStore(initialReducerTree?: ReducerTree, initialEpics?: EpicFn[], dependencies?: {}): Store<any>;
export default createEpicStore;
