import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { AddUserComponent } from '../add-user/add-user.component'; // Import AddUserComponent
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-users-dashboard',
  standalone: true,
  templateUrl: './users-dashboard.component.html',
  styleUrls: ['./users-dashboard.component.css'],
  imports: [NgIf, NgForOf, AsyncPipe, AddUserComponent, CommonModule], // Add necessary imports
})
export class UsersDashboardComponent implements OnInit {
  users: any[] = [];
  totalCount: number = 0;
  isAddUserVisible = false;

  // กำหนดประเภทที่ชัดเจนสำหรับ priority
  permissionPriority: { [key: string]: number } = {
    Employee: 1,
    'HR Admin': 2,
    Admin: 3,
    'Super User': 4,
  };

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
      this.totalCount = response.totalCount;
    });
  }

  // ฟังก์ชันเพื่อหา permission สูงสุด
  getMaxPermission(permissions: any[]): string {
    if (!permissions || permissions.length === 0) {
      return 'No Permissions';
    }

    // หา permission ที่มีลำดับสูงสุด
    return permissions.reduce((prev: any, current: any) => {
      return this.permissionPriority[current.permissionName] >
        this.permissionPriority[prev.permissionName]
        ? current
        : prev;
    }).permissionName;
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
}
