import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'https://localhost:7247/api'; // แก้ไข URL ให้ตรงกับ API จริงของคุณ

  constructor(private http: HttpClient) {}

  // เรียก API Users DataTable เพื่อแสดงผลผู้ใช้แบบแบ่งหน้าและค้นหา
  getUsersDataTable(request: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/DataTable`, request);
  }

  // ดึงข้อมูลผู้ใช้ตาม ID
  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${id}`);
  }

  // เพิ่มผู้ใช้ใหม่
  addUser(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users`, user);
  }

  // ลบผู้ใช้
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${id}`);
  }

  // แก้ไขข้อมูลผู้ใช้
  editUser(id: string, user: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${id}`, user);
  }

  // ดึงข้อมูล Permissions ทั้งหมด
  getPermissions(): Observable<any> {
    return this.http.get(`${this.baseUrl}/permissions`);
  }

  // เพิ่ม Permission ใหม่
  addPermission(permission: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/permissions`, permission);
  }

  // ดึงข้อมูล Roles ทั้งหมด
  getRoles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/roles`);
  }

  // เพิ่ม Role ใหม่
  addRole(role: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/roles`, role);
  }
}
