import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { AddUserComponent } from '../add-user/add-user.component'; // Import AddUserComponent
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users-dashboard',
  standalone: true,
  templateUrl: './users-dashboard.component.html',
  styleUrls: ['./users-dashboard.component.css'],
  imports: [
    FormsModule,
    NgIf,
    NgForOf,
    AsyncPipe,
    AddUserComponent,
    CommonModule,
  ], // Add necessary imports
})
export class UsersDashboardComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  paginatedUsers: any[] = [];
  searchText: string = '';
  currentPage: number = 1;
  pageSize: number = 6; // ค่าเริ่มต้นคือ 6
  pageSizes: number[] = [6, 10, 20]; // ขนาดหน้าต่างๆ ให้เลือก
  totalPages: number = 1;
  totalCount: number = 0;
  isAddUserVisible = false;

  // New properties for sorting and saved search functionality
  selectedSort: string = 'firstName'; // Default sorting option
  selectedSavedSearch: string = ''; // Default saved search option
  savedSearches: string[] = ['Search 1', 'Search 2', 'Search 3']; // Dummy saved searches

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

  // Method to sort users based on selected option
  sortUsers() {
    switch (this.selectedSort) {
      case 'firstName':
        this.filteredUsers.sort((a, b) =>
          a.firstName.localeCompare(b.firstName)
        );
        break;
      case 'createDate':
        this.filteredUsers.sort(
          (a, b) =>
            new Date(a.createdDate).getTime() -
            new Date(b.createdDate).getTime()
        );
        break;
      case 'role':
        const rolePriority: { [key: string]: number } = {
          Employee: 1,
          'HR Admin': 2,
          Admin: 3,
          'Super User': 4,
        };
        this.filteredUsers.sort(
          (a, b) =>
            rolePriority[b.maxPermission] - rolePriority[a.maxPermission]
        );
        break;
      default:
        break;
    }
    this.updatePagination();
  }

  // Method to apply saved search filters
  applySavedSearch() {
    if (this.selectedSavedSearch === 'Search 1') {
      // Apply some search logic here based on saved search
    } else if (this.selectedSavedSearch === 'Search 2') {
      // Apply another saved search filter
    } else if (this.selectedSavedSearch === 'Search 3') {
      // Another search logic
    }
    this.updatePagination();
  }

  filterUsers() {
    this.filteredUsers = this.users.filter((user) =>
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(this.searchText.toLowerCase())
    );
    this.sortUsers(); // Sort after filtering
    this.updatePagination();
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
  }

  hideAddUserForm() {
    this.isAddUserVisible = false;
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
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteUser(userId);
        Swal.fire('Deleted!', 'User has been deleted.', 'success');
      }
    });
  }

  // Method to delete the user (you should update this to use your API)
  deleteUser(userId: string) {
    this.apiService.deleteUser(userId).subscribe(() => {
      this.loadUsers(); // Reload the list after deletion
    });
  }
}
