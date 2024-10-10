import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { AddUserComponent } from '../add-user/add-user.component'; // Import AddUserComponent
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  pageSize: number = 7;
  totalPages: number = 1;
  totalCount: number = 0;
  isAddUserVisible = false;
  selectedSort: string = 'name'; // สำหรับจัดเรียง
  savedSearches: string[] = ['Search 1', 'Search 2']; // รายการการค้นหาที่บันทึกไว้
  selectedSavedSearch: string = '';

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
      this.sortUsers(); // เรียกใช้การจัดเรียงเมื่อโหลดข้อมูลเสร็จ
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

  // ฟังก์ชันการจัดเรียง
  sortUsers() {
    if (this.selectedSort === 'name') {
      this.filteredUsers.sort((a, b) => a.firstName.localeCompare(b.firstName));
    } else if (this.selectedSort === 'date') {
      this.filteredUsers.sort(
        (a, b) =>
          new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
      );
    } else if (this.selectedSort === 'role') {
      const rolePriority: { [key: string]: number } = {
        'Super User': 4,
        Admin: 3,
        'HR Admin': 2,
        Employee: 1,
      };
      this.filteredUsers.sort(
        (a, b) => rolePriority[b.role.roleName] - rolePriority[a.role.roleName]
      );
    }
    this.updatePagination();
  }

  // ฟังก์ชันสำหรับการใช้ Saved Search
  applySavedSearch() {
    if (this.selectedSavedSearch) {
      this.searchText = this.selectedSavedSearch;
      this.filterUsers();
    }
  }
}
