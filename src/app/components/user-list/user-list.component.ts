// user-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { AddUserComponent } from '../add-user/add-user.component';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf,
    AsyncPipe,
    AddUserComponent,
    EditUserComponent,
    MatIconModule,
    CommonModule,
  ],
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  paginatedUsers: any[] = [];
  searchText: string = '';
  currentPage: number = 1;
  pageSize: number = 6;
  pageSizes: number[] = [6, 10, 20];
  totalPages: number = 1;
  totalCount: number = 0;
  isAddUserVisible = false;
  isEditUserVisible = false;
  editingUserId: string | null = null;
  selectedSort: string = 'name';
  selectedSavedSearch: string = '';
  savedSearches: string[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    const request = {
      orderBy: 'FirstName',
      orderDirection: 'ASC',
      pageNumber: 1,
      pageSize: 10,
      search: '',
    };
    this.apiService.getUsersDataTable(request).subscribe((response) => {
      this.users = response.dataSource.map((user: any) => ({
        ...user,
        maxPermission: this.getMaxPermission(user.permissions),
      }));
      this.filteredUsers = [...this.users];
      this.totalCount = response.totalCount;
      this.updatePagination();
    });
  }

  filterUsers() {
    this.filteredUsers = this.users.filter((user) =>
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(this.searchText.toLowerCase())
    );
    this.updatePagination();
  }

  sortUsers() {
    if (this.selectedSort === 'name') {
      this.filteredUsers.sort((a, b) => a.firstName.localeCompare(b.firstName));
    } else if (this.selectedSort === 'date') {
      this.filteredUsers.sort(
        (a, b) =>
          new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      );
    } else if (this.selectedSort === 'role') {
      this.filteredUsers.sort((a, b) =>
        a.role.roleName.localeCompare(b.role.roleName)
      );
    }
    this.updatePagination();
  }

  applySavedSearch() {
    if (this.selectedSavedSearch) {
      this.searchText = this.selectedSavedSearch;
      this.filterUsers();
    }
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    this.paginatedUsers = this.filteredUsers.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  getMaxPermission(permissions: any[]): string {
    if (!permissions || permissions.length === 0) {
      return 'No Permissions';
    }
    const permissionPriority: { [key: string]: number } = {
      Employee: 1,
      'HR Admin': 2,
      Admin: 3,
      'Super User': 4,
    };
    return permissions.reduce((prev, current) =>
      permissionPriority[current.permissionName] >
      permissionPriority[prev.permissionName]
        ? current
        : prev
    ).permissionName;
  }

  showAddUserForm() {
    this.isAddUserVisible = true;
    document.body.classList.add('modal-open');
  }

  hideAddUserForm() {
    this.isAddUserVisible = false;
    document.body.classList.remove('modal-open');
  }

  onUserAdded() {
    this.hideAddUserForm();
    this.loadUsers();
  }

  confirmDeleteUser(userId: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this user?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteUser(userId).subscribe(() => {
          Swal.fire('Deleted!', 'User has been deleted.', 'success');
          this.loadUsers();
        });
      }
    });
  }

  showEditUserForm(userId: string) {
    this.editingUserId = userId;
    this.isEditUserVisible = true;
    document.body.classList.add('modal-open');
  }

  hideEditUserForm() {
    this.isEditUserVisible = false;
    document.body.classList.remove('modal-open');
  }

  onUserEdited() {
    this.hideEditUserForm();
    this.loadUsers();
  }
}
