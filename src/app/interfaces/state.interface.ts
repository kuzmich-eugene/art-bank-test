import { IUser } from './user.interface';

export interface IState {
  metaData: string[];
  users: IUser[];
}
