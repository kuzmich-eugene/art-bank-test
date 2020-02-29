import * as R from 'ramda';
import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { IUser } from '../interfaces/user.interface.js';
import { IState } from '../interfaces/state.interface.js';

@Injectable()
export class UsersService {
  public state: IState = {
    metaData: [],
    users: []
  };

  private _subj = new BehaviorSubject<IState>(this.state);
  get subj$() {
    return this._subj.asObservable();
  }

  public async loadUsers() {
    const data = await new Promise(resolve => resolve(import('./person.json')));
    const {metaData, rows} = R.path(['default', 'data'], data);
    const keys = R.map(R.path(['name']), metaData);
    const makeUserFromKeys = R.zipObj(keys);
    const users = R.map(makeUserFromKeys, rows);
    this._subj.next({metaData: keys, users});
  }

  public addUser(user: IUser) {
    const currState = this._subj.getValue();
    const usersWithAddUser = R.concat(currState.users, [user]);
    this._subj.next({metaData: currState.metaData, users: usersWithAddUser});
  }

  public editUser(userEdit: IUser) {
    const currState = this._subj.getValue();
    const usersWithEditUser = R.map(user => {
      if (user.BIRTHDATE === userEdit.BIRTHDATE) {
        return {...userEdit};
      }
      return user;
    }, currState.users);
    this._subj.next({metaData: currState.metaData, users: usersWithEditUser});
  }

  public deleteUser(userDelete: IUser) {
    const currState = this._subj.getValue();
    const usersWithoutDeleteUser = R.filter(user => user.CARD !== userDelete.CARD, currState.users);
    this._subj.next({metaData: currState.metaData, users: usersWithoutDeleteUser});
  }
}
