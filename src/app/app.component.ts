import * as R from 'ramda';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { untilComponentDestroyed } from 'ng2-rx-componentdestroyed';
import { tap } from 'rxjs/operators';

import { UsersService } from './services/users.service';
import { IUser } from './interfaces/user.interface';

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
  public showButtonAddUser = false;
  private idx: number;
  public keys: string[];
  private currUser: IUser;

  get formDisabled(): boolean {
    return this.myForm.invalid || this.myForm.pristine;
  }
  get userAddPanelOpenNow(): boolean {
    return this.panelOpenState && this.showButtonAddUser;
  }
  get userEditPanelOpenNow(): boolean {
    return this.panelOpenState && !this.showButtonAddUser;
  }

  constructor(
    private usersService: UsersService
  ) {}

  async ngOnInit() {
    await this.usersService.loadUsers();
    this.usersService.state$.pipe(
      tap(state => {
        this.dataSource.data = state;
        this.keys = this.usersService.keysNamesOfUser;
        this.columns = this.keys.slice(1).concat(['EDIT', 'DELETE']);
        if (this.idx !== this.usersService.keysNamesOfUser.length) {
          this.idx = this.usersService.keysNamesOfUser.length;
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

  public openPanelForAddUser() {
    if (this.userEditPanelOpenNow) {
      const result = confirm('Do you want to save the changes?');
      if (result) {
        this.updateUser();
      }
    }
    this.myForm.reset();
    this.panelOpenState = true;
    this.showButtonAddUser = true;
  }

  public addUser() {
    const newUser: IUser = this.myForm.value;
    this.usersService.addUser(newUser);
    this.myForm.reset();
    this.panelOpenState = false;
  }

  public openPanelForEditUser(user: IUser) {
    this.currUser = user;
    if (this.userAddPanelOpenNow) {
      const result = confirm('Do you want to add a user?');
      if (result) {
        return;
      }
    }
    this.panelOpenState = true;
    this.showButtonAddUser = false;
    this.myForm.patchValue({...user});
  }

  public updateUser() {
    const editUser = {ID: this.currUser.ID, ...this.myForm.value};
    this.usersService.editUser(editUser);
    this.myForm.reset();
    this.panelOpenState = false;
  }

  public removeUser(user: IUser) {
    this.usersService.deleteUser(user);
  }

  ngOnDestroy() {}
}
