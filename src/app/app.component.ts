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
  private currUser: IUser;

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
      this.myForm = new FormGroup(objFormGroup);
  }

  public openFormPanel(userType: UserFormType, user?: IUser) {
    this.currUser = user;
    if (this.formType === null) {
      this.formType = userType;
      this.panelOpenState = true;
      if (userType === 'editUser') {
        this.myForm.patchValue({...user});
      }
    } else if (this.formType === 'editUser' && userType === 'addUser') {
      const result = confirm('Do you want to add a new user?');
      if (!result) {
        return;
      }
      this.myForm.reset();
      this.formType = 'addUser';
    } else if (this.formType === 'addUser' && userType === 'editUser') {
      const result = confirm('Do you want to edit a user?');
      if (!result) {
        return;
      }
      this.formType = 'editUser';
      this.myForm.patchValue({...user});
    }
  }

  public addUser() {
    const newUser: IUser = this.myForm.value;
    this.usersService.addUser(newUser);
    this.myForm.reset();
    this.panelOpenState = false;
    this.formType = null;
  }

  public updateUser() {
    const editUser = {ID: this.currUser.ID, ...this.myForm.value};
    this.usersService.editUser(editUser);
    this.myForm.reset();
    this.panelOpenState = false;
    this.formType = null;
  }

  public removeUser(user: IUser) {
    this.usersService.deleteUser(user);
  }

  ngOnDestroy() {}
}
