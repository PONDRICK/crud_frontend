// add-user.component.ts
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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
  selector: 'app-add-user',
  standalone: true,
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css'],
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
})
export class AddUserComponent implements OnInit {
  @Output() closeForm = new EventEmitter<void>();
  @Output() userAdded = new EventEmitter<void>();
  addUserForm: FormGroup;
  roles: any[] = [];
  permissions: any[] = [];

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.addUserForm = this.fb.group(
      {
        id: [
          '',
          {
            validators: [Validators.required],
            asyncValidators: [this.userIdExistsValidator()],
            updateOn: 'blur',
          },
        ],
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
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
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

  // Getter for template
  get userPermissionsControls(): FormGroup[] {
    return this.userPermissions.controls as FormGroup[];
  }

  // Custom Validator for Password Match
  passwordMatchValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    } else {
      return null;
    }
  };

  // Async Validator to check if User ID exists
  userIdExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }
      return this.apiService.getUserById(control.value).pipe(
        map((user) => {
          return user ? { userIdExists: true } : null;
        }),
        catchError((error) => {
          if (error.status === 404) {
            // User not found, ID is unique
            return of(null);
          } else {
            return of({ userIdExists: true });
          }
        })
      );
    };
  }

  // Async Validator to check if Email exists
  emailExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
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
      map((response) => response.totalCount > 0),
      catchError(() => of(false))
    );
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
    if (this.addUserForm.invalid) {
      this.addUserForm.markAllAsTouched();
      return;
    }

    const userData = {
      ...this.addUserForm.value,
      userPermissions: this.filterSelectedPermissions(),
    };

    this.apiService.addUser(userData).subscribe(
      (response) => {
        console.log('User added successfully', response);
        this.userAdded.emit();
        this.closeForm.emit();
      },
      (error) => {
        console.error('Error adding user', error);
      }
    );
  }

  cancelForm() {
    this.closeForm.emit();
  }
}
