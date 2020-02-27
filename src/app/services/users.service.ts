import * as R from 'ramda';
import { Injectable } from '@angular/core';

import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IUser } from '../interfaces/user.interface.js';

@Injectable()
export class UsersService {
  loadUsers(): Observable<{metaData: string[], users: IUser[]}> {
    return from(import('./person.json')).pipe(
      map(R.path(['default', 'data'])),
      map(({metaData, rows}) => {
        const keys = R.map(R.path(['name']), metaData);
        const makeUserFromKeys = R.zipObj(keys);
        const users = R.map(makeUserFromKeys, rows);
        return {metaData: keys, users};
      })
    );
  }
}
