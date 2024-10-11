import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css'],
  imports: [ReactiveFormsModule, CommonModule],
})
export class EditUserComponent implements OnInit {
  @Input() userId: string = ''; // รับค่า userId
  @Output() closeForm = new EventEmitter<void>();
  @Output() userEdited = new EventEmitter<void>();

  editUserForm: FormGroup;
  roles: any[] = [];
  permissions: any[] = [];

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.editUserForm = this.fb.group({
      id: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      username: ['', Validators.required],
      password: [''], // password not required
      confirmPassword: [''],
      roleId: ['', Validators.required],
      userPermissions: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.loadRolesAndPermissions();
    if (this.userId) {
      this.loadUserData();
    }
  }

  loadRolesAndPermissions() {
    this.apiService.getRoles().subscribe((roles) => {
      this.roles = roles.data;
    });

    this.apiService.getPermissions().subscribe((permissions) => {
      this.permissions = permissions.data;
      this.initializePermissions();
    });
  }

  initializePermissions() {
    const permissionsFormArray = this.editUserForm.get(
      'userPermissions'
    ) as FormArray;
    this.permissions.forEach((permission) => {
      permissionsFormArray.push(
        this.fb.group({
          permissionId: [permission.permissionId],
          isReadable: [false],
          isWritable: [false],
          isDeletable: [false],
        })
      );
    });
  }

  get userPermissions(): FormArray {
    return this.editUserForm.get('userPermissions') as FormArray;
  }

  // Getter ที่จะใช้ใน template
  get userPermissionsControls(): FormGroup[] {
    return this.userPermissions.controls as FormGroup[];
  }

  loadUserData() {
    this.apiService.getUserById(this.userId).subscribe((user) => {
      this.editUserForm.patchValue({
        id: user.data.id,
        firstName: user.data.firstName,
        lastName: user.data.lastName,
        email: user.data.email,
        phone: user.data.phone,
        username: user.data.username,
        roleId: user.data.role.roleId,
      });

      this.setUserPermissions(user.data.permissions);
    });
  }

  setUserPermissions(userPermissions: any[]) {
    const permissionsFormArray = this.editUserForm.get(
      'userPermissions'
    ) as FormArray;
    userPermissions.forEach((userPermission) => {
      const permissionForm = permissionsFormArray.controls.find(
        (control) =>
          control.get('permissionId')?.value === userPermission.permissionId
      );
      if (permissionForm) {
        permissionForm.patchValue({
          isReadable: userPermission.isReadable,
          isWritable: userPermission.isWritable,
          isDeletable: userPermission.isDeletable,
        });
      }
    });
  }

  filterSelectedPermissions(): any[] {
    return this.userPermissions.controls
      .filter((control) => {
        return (
          control.get('isReadable')?.value ||
          control.get('isWritable')?.value ||
          control.get('isDeletable')?.value
        );
      })
      .map((control) => ({
        permissionId: control.get('permissionId')?.value,
        isReadable: control.get('isReadable')?.value,
        isWritable: control.get('isWritable')?.value,
        isDeletable: control.get('isDeletable')?.value,
      }));
  }

  submitForm() {
    if (this.editUserForm.valid) {
      const userData = {
        ...this.editUserForm.value,
        userPermissions: this.filterSelectedPermissions(),
      };

      this.apiService.editUser(this.userId, userData).subscribe((response) => {
        console.log('User updated successfully', response);
        this.userEdited.emit();
      });
    }
  }

  cancelForm() {
    this.closeForm.emit();
  }
}
