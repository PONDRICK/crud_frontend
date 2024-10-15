import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
  AsyncValidatorFn,
} from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css'],
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
})
export class EditUserComponent implements OnInit {
  @Input() userId: string = '';
  @Output() closeForm = new EventEmitter<void>();
  @Output() userEdited = new EventEmitter<void>();

  editUserForm: FormGroup;
  roles: any[] = [];
  permissions: any[] = [];
  originalEmail: string = '';

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.editUserForm = this.fb.group(
      {
        id: [{ value: '', disabled: true }, Validators.required],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: [
          '',
          {
            validators: [Validators.required, Validators.email],
            asyncValidators: [this.emailExistsValidator()],
            updateOn: 'blur',
          },
        ],
        phone: [''],
        username: ['', Validators.required],
        password: [''],
        confirmPassword: [''],
        roleId: ['', Validators.required],
        userPermissions: this.fb.array([]),
      },
      { validators: this.passwordMatchValidator }
    );
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

      if (this.userId) {
        this.loadUserData();
      }
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

  // Getter for template
  get userPermissionsControls(): FormGroup[] {
    return this.userPermissions.controls as FormGroup[];
  }

  loadUserData() {
    this.apiService.getUserById(this.userId).subscribe((user) => {
      const userData = user.data;
      this.originalEmail = userData.email;

      this.editUserForm.patchValue({
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        username: userData.username,
        roleId: userData.role.roleId,
      });

      this.setUserPermissions(userData.permissions);
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

  // Custom Validator for Password Match
  passwordMatchValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        return { passwordMismatch: true };
      }
    }
    return null;
  };

  // Async Validator to check if Email exists
  emailExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.value === this.originalEmail) {
        return of(null);
      }
      return this.checkEmailExists(control.value).pipe(
        map((exists) => (exists ? { emailExists: true } : null))
      );
    };
  }

  // Method to check if email exists
  checkEmailExists(email: string): Observable<boolean> {
    const request = {
      orderBy: 'Email',
      orderDirection: 'ASC',
      pageNumber: 1,
      pageSize: 1,
      search: email,
    };
    return this.apiService.getUsersDataTable(request).pipe(
      map((response) => {
        if (response.totalCount === 0) {
          return false;
        }
        const user = response.dataSource[0];
        return user.email === email && user.id !== this.userId;
      }),
      catchError(() => of(false))
    );
  }

  submitForm() {
    if (this.editUserForm.invalid) {
      this.editUserForm.markAllAsTouched();
      return;
    }

    const userData = {
      ...this.editUserForm.getRawValue(),
      userPermissions: this.filterSelectedPermissions(),
    };

    // If password is empty, remove it from userData
    if (!userData.password) {
      delete userData.password;
      delete userData.confirmPassword;
    }

    this.apiService.editUser(this.userId, userData).subscribe(
      (response) => {
        console.log('User updated successfully', response);
        this.userEdited.emit();
        this.closeForm.emit();
      },
      (error) => {
        console.error('Error updating user', error);
      }
    );
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

  cancelForm() {
    this.closeForm.emit();
  }
}
