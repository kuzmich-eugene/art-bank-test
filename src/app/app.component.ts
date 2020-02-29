import * as R from 'ramda';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { untilComponentDestroyed } from 'ng2-rx-componentdestroyed';

import { UsersService } from './services/users.service';
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
  public panelOpenState = false;
  public showButtonAddUser = false;
  public keysFormControls: string[];

  get formDisabled(): boolean {
    return this.myForm.invalid || this.myForm.pristine;
  }

  constructor(
    private usersService: UsersService
  ) {}

  ngOnInit() {
    this.usersService.loadUsers();
    this.usersService.subj$.pipe(
      untilComponentDestroyed(this)
    ).subscribe((state) => {
      this.dataSource.data = state.users;
      this.keysFormControls = state.metaData;
      this.columns = state.metaData.concat(['EDIT', 'DELETE']);
      this.createForm();
    });
  }

  private createForm() {
      const objFormGroup = R.reduce((acc, curr) => ({...acc, [curr]: new FormControl('', Validators.required)}), {}, this.keysFormControls);
      this.myForm = new FormGroup(objFormGroup);
  }

  public openPanelForAddUser() {
    if (this.panelOpenState && !this.showButtonAddUser) {
      const result = confirm('Do you want to edit a user?');
      if (result) {
        return;
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

  public editUser(user: IUser, index: number) {
    if (this.panelOpenState && this.showButtonAddUser) {
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
    const editUser = this.myForm.value;
    this.usersService.editUser(editUser);
    this.myForm.reset();
    this.panelOpenState = false;
  }

  public removeUser(user: IUser) {
    this.usersService.deleteUser(user);
  }

  ngOnDestroy() {}

}
