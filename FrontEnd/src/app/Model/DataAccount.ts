import {ModelAccount} from "./ModelAccount";
import {ModelInfoAccount} from "./ModelInfoAccoutn";


export interface ModelDataAccount {
  Account: ModelAccount;
  InfoAccount?: ModelInfoAccount | null;

}
