import * as R from 'ramda';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { IUser } from '../interfaces/user.interface.js';

@Injectable()
export class UsersService {
  private state = new BehaviorSubject<IUser[]>([]);
  get state$() {
    return this.state.asObservable();
  }
  private userKeysNames: string[];
  get keysNamesOfUser() {
    return this.userKeysNames;
  }

  public async loadUsers(): Promise<IUser[]> {
    const data = await import('./person.json');
    const {metaData, rows} = R.path(['default', 'data'], data);
    const keys = R.map(R.path(['name']), metaData);
    const makeUserFromKeys = R.zipObj(keys);
    const users = R.map(makeUserFromKeys, rows);
    this.userKeysNames = keys;
    this.state.next(users);
    return users;
  }

  public addUser(user: IUser): IUser {
    const newUser = {ID: this.generateId(), ...user};
    const currState = this.state.getValue();
    const usersWithAddUser = R.concat(currState, [newUser]);
    this.state.next(usersWithAddUser);
    return newUser;
  }

  private generateId() {
    const countUsers = this.state.getValue();
    const num = countUsers.length > 0 ? Math.max(...countUsers.map(item => item.ID)) + 1 : 11;
    return num;
  }

  public editUser(userEdit: IUser): IUser {
    const currState = this.state.getValue();
    const usersWithEditUser = R.map(user => {
      if (user.ID === userEdit.ID) {
        return {...userEdit};
      }
      return user;
    }, currState);
    this.state.next(usersWithEditUser);
    return userEdit;
  }

  public deleteUser(userDelete: IUser): IUser {
    const currState = this.state.getValue();
    const usersWithoutDeleteUser = R.filter(user => user.ID !== userDelete.ID, currState);
    this.state.next(usersWithoutDeleteUser);
    return userDelete;
  }
}
