import * as R from 'ramda';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { untilComponentDestroyed } from 'ng2-rx-componentdestroyed';

import { UsersService } from './services/users.service';
import { tap } from 'rxjs/operators';
import { IUser } from './interfaces/user.interface';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public dataSource = new MatTableDataSource<IUser>();
  public columns = [];
  public myForm: FormGroup;
  private idx: number = null;
  public panelOpenState = false;
  public panelAddUserOpenState = false;

  get formDisabled(): boolean {
    return this.myForm.invalid || this.myForm.pristine;
  }

  constructor(
    private usersService: UsersService
  ) {}

  ngOnInit() {
    this.myForm = new FormGroup({
      CARD: new FormControl('', Validators.required),
      LASTNAME: new FormControl('', Validators.required),
      FIRSTNAME: new FormControl('', Validators.required),
      PATRONYMIC: new FormControl('', Validators.required),
      IDPERSON: new FormControl('', Validators.required),
      STATUSNAME: new FormControl('', Validators.required),
      ACC1NUM: new FormControl('', Validators.required),
      CARDTEMPLNAME: new FormControl(''),
      ORGNAMESHORT: new FormControl('', Validators.required),
      PERSONTYPENAME: new FormControl('', Validators.required),
      CURRNAME: new FormControl('', Validators.required),
      IDCARD: new FormControl('', Validators.required),
      BIRTHDATE: new FormControl('', Validators.required),
      DOCSERIES: new FormControl('', Validators.required),
      DOCNUM: new FormControl('', Validators.required),
      IDTASKAUTHSTATUS: new FormControl('', Validators.required),
      DOCTYPENAME: new FormControl('', Validators.required)
    });
    this.usersService.loadUsers().pipe(
      tap(({metaData, users}) => {
        this.dataSource.data = users;
        this.columns = metaData.concat(['EDIT', 'DELETE']);
      }),
      untilComponentDestroyed(this)
    ).subscribe();
  }

  public openPanelForAddUser() {
    this.panelOpenState = true;
    this.panelAddUserOpenState = true;
  }

  public addUser() {
    const newUser: IUser = this.myForm.value;
    this.dataSource.data = this.dataSource.data.concat([newUser]);
    this.myForm.reset();
    this.panelOpenState = false;
  }

  public editUser(user: IUser, index: number) {
    this.panelOpenState = true;
    this.panelAddUserOpenState = false;
    this.idx = index;
    this.myForm.patchValue({...user});
  }

  public updateUser() {
    const editUser = this.myForm.value;
    const users = R.map((item) => {
      if (item === this.dataSource.data[this.idx]) {
        return editUser;
      }
      return item;
    }, this.dataSource.data);
    this.dataSource.data = users;
    this.myForm.reset();
    this.panelOpenState = false;
  }

  public removeUser(user: IUser) {
    this.dataSource.data = R.filter((item: IUser) => item.CARD !== user.CARD, this.dataSource.data);
  }

  ngOnDestroy() {}

}
