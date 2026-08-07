import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/entities/product.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/product`; // replace with your actual API URL

  constructor(private http: HttpClient) {}

  // Get all products (AllowAnonymous)
  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}`);
  }

  // Get a product by id (AllowAnonymous)
  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // Create a new product (RequiresAdmin)
  create(product: Product): Observable<Product | void> {
    return this.http.post<Product | void>(`${this.apiUrl}`, product);
  }

  // Update an existing product (RequiresAdmin)
  update(id: number, product: Product): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, product);
  }

  // Delete a product (RequiresAdmin)
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 
