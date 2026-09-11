import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, timeout } from 'rxjs';
import { API_BASE_URL, DEFAULT_REQUEST_TIMEOUT_MS } from '../../../core/http/api-base-url.token';
import { PurchaseBillItem, PurchaseBillItemRequest } from '../models/purchase-bill.models';

@Injectable({ providedIn: 'root' })
export class PurchaseBillService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_BASE_URL)}/purchase-bills`;

  /** Item names offered by the Item autocomplete. */
  getItemOptions(): Observable<string[]> {
    return this.http
      .get<string[]>(`${this.baseUrl}/item-options`)
      .pipe(timeout(DEFAULT_REQUEST_TIMEOUT_MS));
  }

  getItems(): Observable<PurchaseBillItem[]> {
    return this.http
      .get<PurchaseBillItem[]>(`${this.baseUrl}/items`)
      .pipe(timeout(DEFAULT_REQUEST_TIMEOUT_MS));
  }

  addItem(request: PurchaseBillItemRequest): Observable<PurchaseBillItem> {
    return this.http
      .post<PurchaseBillItem>(`${this.baseUrl}/items`, request)
      .pipe(timeout(DEFAULT_REQUEST_TIMEOUT_MS));
  }
}
