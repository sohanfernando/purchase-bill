import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, timeout } from 'rxjs';
import { API_BASE_URL, DEFAULT_REQUEST_TIMEOUT_MS } from '../../../core/http/api-base-url.token';
import { CreatePurchaseOrderRequest, PurchaseOrder } from '../models/purchase-order.models';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_BASE_URL)}/purchase-orders`;

  /** Item names offered by the Item autocomplete. */
  getItemOptions(): Observable<string[]> {
    return this.http
      .get<string[]>(`${this.baseUrl}/item-options`)
      .pipe(timeout(DEFAULT_REQUEST_TIMEOUT_MS));
  }

  /** Saves the whole order: the header and every line in one request. */
  createOrder(request: CreatePurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.http
      .post<PurchaseOrder>(this.baseUrl, request)
      .pipe(timeout(DEFAULT_REQUEST_TIMEOUT_MS));
  }
}
