import * as R from 'ramda';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { untilComponentDestroyed } from 'ng2-rx-componentdestroyed';
import { tap } from 'rxjs/operators';

import { UsersService } from './services/users.service';
import { IUser } from './interfaces/user.interface';

type UserFormType = 'addUser' | 'editUser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public dataSource = new MatTableDataSource<IUser>();
  public columns = [];
  public myForm: FormGroup;
  public panelOpenState = false;
  private countKeys: number;
  public keys: string[];
  private formType: UserFormType = null;
  public isSpinnerShow = false;

  get formDisabled(): boolean {
    return this.myForm.invalid || this.myForm.pristine;
  }
  get buttonSettings(): string {
    return this.formType === 'addUser' ? 'Add user' : 'Update';
  }

  constructor(
    private usersService: UsersService
  ) {}

  async ngOnInit() {
    this.isSpinnerShow = true;
    await this.usersService.loadUsers();
    this.usersService.state$.pipe(
      tap(state => {
        this.dataSource.data = state;
        this.keys = this.usersService.keysNamesOfUser;
        this.columns = this.keys.slice(1).concat(['EDIT', 'DELETE']);
        this.isSpinnerShow = false;
        if (this.countKeys !== this.keys.length) {
          this.countKeys = this.keys.length;
          this.createForm(this.usersService.keysNamesOfUser);
        }
      }),
      untilComponentDestroyed(this)
    ).subscribe();
  }

  private createForm(keys) {
      const objFormGroup = R.reduce((acc, curr) => ({...acc, [curr]: new FormControl('', Validators.required)}), {}, keys.slice(1));
      this.myForm = new FormGroup({ID: new FormControl(''), ...objFormGroup});
  }

  public handleSubmit() {
    switch (this.formType) {
      case 'addUser':
        this.addUser();
        break;
      case 'editUser':
        this.updateUser();
        break;
    }
  }

  public openPanelForAddUser() {
    if (this.formType === null) {
      this.formType = 'addUser';
      this.panelOpenState = true;
    } else {
      const result = confirm('You have unsaved data. Do you want to continue without saving?');
      if (!result) {
        return;
      }
      this.myForm.reset();
      this.formType = 'addUser';
    }
  }

  public openPanelForEditUser(user: IUser) {
    if (this.formType === null) {
      this.formType = 'editUser';
      this.panelOpenState = true;
      this.myForm.patchValue({...user});
    } else {
      const result = confirm('You have unsaved data. Do you want to continue without adding a new user?');
      if (!result) {
        return;
      }
      this.formType = 'editUser';
      this.myForm.patchValue({...user});
    }
  }

  public addUser() {
    if (this.formDisabled) {
      return;
    }
    const newUser: IUser = this.myForm.value;
    this.usersService.addUser(newUser);
    this.panelOpenState = false;
    this.formType = null;
    this.myForm.reset();
  }

  public updateUser() {
    if (this.formDisabled) {
      return;
    }
    const editUser = this.myForm.value;
    this.usersService.editUser({...editUser});
    this.panelOpenState = false;
    this.formType = null;
    this.myForm.reset();
  }

  public removeUser(user: IUser) {
    this.usersService.deleteUser(user);
  }

  ngOnDestroy() {}
}
