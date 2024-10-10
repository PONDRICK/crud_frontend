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
  imports: [ReactiveFormsModule, CommonModule], // Import ReactiveFormsModule and NgForOf
})
export class AddUserComponent implements OnInit {
  @Output() closeForm = new EventEmitter<void>(); // EventEmitter to close the form
  addUserForm: FormGroup;
  roles: any[] = []; // Stores roles
  permissions: any[] = []; // Stores permissions

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
      userPermissions: this.fb.array([]), // Permissions array
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

  get userPermissions() {
    return this.addUserForm.get('userPermissions') as FormArray;
  }

  submitForm() {
    if (this.addUserForm.valid) {
      const userData = this.addUserForm.value;
      this.apiService.addUser(userData).subscribe((response) => {
        console.log('User added successfully', response);
        this.closeForm.emit(); // Close the form after submission
      });
    }
  }

  cancelForm() {
    this.closeForm.emit(); // Close the form on cancel
  }
}
