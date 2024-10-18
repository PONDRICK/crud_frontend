import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Step 1: Define an interface for Document
interface Document {
  title: string;
  date: string;
  description: string;
  id: string; // Assuming you have a unique identifier
}

@Component({
  selector: 'app-document',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css'],
})
export class DocumentComponent implements OnInit {
  searchText: string = '';

  // Step 2: Apply the Document type to the arrays
  documents: Document[] = [
    {
      id: '1',
      title: 'Lorem ipsum',
      date: 'April 9, 2022',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
    {
      id: '2',
      title: 'Dolor sit amet',
      date: 'April 10, 2022',
      description:
        'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices.',
    },
    // Add more document objects here
  ];

  // Pagination and control properties
  pageSize: number = 6;
  pageSizes: number[] = [6, 10, 20];
  currentPage: number = 1;
  totalCount: number = this.documents.length;
  totalPages: number = Math.ceil(this.totalCount / this.pageSize);
  paginatedDocuments: Document[] = [];

  constructor() {}

  ngOnInit(): void {
    this.updatePagination();
  }

  // Method to handle search filter
  filterDocuments() {
    const searchLower = this.searchText.toLowerCase();
    const filteredDocuments = this.documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(searchLower) ||
        doc.description.toLowerCase().includes(searchLower)
    );
    this.totalCount = filteredDocuments.length;
    this.paginatedDocuments = filteredDocuments.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );
  }

  // Method to handle adding a new document (currently just a placeholder)
  addDocument() {
    console.log('Add new document');
  }

  // Method to handle editing a document (currently just a placeholder)
  editDocument(documentId: string) {
    console.log('Edit document with ID:', documentId);
  }

  // Method to handle deleting a document (currently just a placeholder)
  deleteDocument(documentId: string) {
    console.log('Delete document with ID:', documentId);
  }

  // Method to handle pagination updates
  updatePagination() {
    this.paginatedDocuments = this.documents.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );
    this.totalPages = Math.ceil(this.totalCount / this.pageSize);
  }

  // Go to the next page
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  // Go to the previous page
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }
}
