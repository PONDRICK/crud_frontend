import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-user',
  standalone: true,
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css'],
  imports: [ReactiveFormsModule, CommonModule],
})
export class AddUserComponent implements OnInit {
  @Output() closeForm = new EventEmitter<void>();
  addUserForm: FormGroup;
  roles: any[] = [];
  permissions: any[] = [];

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.addUserForm = this.fb.group({
      id: ['User111', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      roleId: ['', Validators.required],
      userPermissions: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.loadRolesAndPermissions();
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
    const permissionsFormArray = this.addUserForm.get(
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
    return this.addUserForm.get('userPermissions') as FormArray;
  }

  // Getter ที่จะใช้ใน template
  get userPermissionsControls(): FormGroup[] {
    return this.userPermissions.controls as FormGroup[];
  }

  filterSelectedPermissions(): any[] {
    const selectedPermissions = this.userPermissions.controls
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

    return selectedPermissions;
  }

  submitForm() {
    if (this.addUserForm.valid) {
      const userData = {
        ...this.addUserForm.value,
        userPermissions: this.filterSelectedPermissions(),
      };

      this.apiService.addUser(userData).subscribe((response) => {
        console.log('User added successfully', response);
        this.closeForm.emit();
      });
    }
  }

  cancelForm() {
    this.closeForm.emit();
  }
}
