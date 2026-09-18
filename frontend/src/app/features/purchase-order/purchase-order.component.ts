import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, forkJoin, map } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { ApiError, toApiError } from '../../core/http/api-error';
import { UserLocation } from '../../core/locations/location.model';
import { LocationService } from '../../core/locations/location.service';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { AutocompleteComponent } from '../../shared/components/autocomplete/autocomplete.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { integerValidator, oneOfValidator } from '../../shared/forms/validators';
import { ItemSummaryComponent } from './components/item-summary/item-summary.component';
import { PurchaseItemsTableComponent } from './components/purchase-items-table/purchase-items-table.component';
import {
  OrderLineDraft,
  PurchaseOrder,
  PurchaseOrderItemRequest,
} from './models/purchase-order.models';
import { PurchaseOrderService } from './services/purchase-order.service';
import { calculateLineAmounts, summarizeLines } from './utils/purchase-order-calculations';

const MAX_QUANTITY = 1_000_000;

interface ItemFormValue {
  itemName: string;
  batchLocationCode: string;
  standardCost: number | null;
  standardPrice: number | null;
  quantity: number | null;
  freeQuantity: number | null;
  discountPercent: number | null;
}

const EMPTY_ITEM_FORM: ItemFormValue = {
  itemName: '',
  batchLocationCode: '',
  standardCost: null,
  standardPrice: null,
  quantity: null,
  freeQuantity: 0,
  discountPercent: 0,
};

@Component({
  selector: 'app-purchase-order',
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    AlertComponent,
    AutocompleteComponent,
    FormFieldComponent,
    PageHeaderComponent,
    SpinnerComponent,
    ItemSummaryComponent,
    PurchaseItemsTableComponent,
  ],
  templateUrl: './purchase-order.component.html',
  styleUrl: './purchase-order.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseOrderComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly purchaseOrderService = inject(PurchaseOrderService);
  private readonly locationService = inject(LocationService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly userEmail = this.authService.currentUserEmail;
  readonly itemOptions = signal<string[]>([]);
  readonly locations = signal<UserLocation[]>([]);

  /** Lines added but not saved yet. The order exists only in the browser until Save is pressed. */
  readonly lines = signal<OrderLineDraft[]>([]);

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);
  readonly savedOrder = signal<PurchaseOrder | null>(null);

  private nextTempId = 1;

  readonly summary = computed(() => summarizeLines(this.lines()));
  readonly canSave = computed(() => this.lines().length > 0 && !this.isSaving());

  readonly form = this.formBuilder.group({
    itemName: this.formBuilder.nonNullable.control(EMPTY_ITEM_FORM.itemName, [
      Validators.required,
      oneOfValidator(() => this.itemOptions()),
    ]),
    batchLocationCode: this.formBuilder.nonNullable.control(EMPTY_ITEM_FORM.batchLocationCode, [
      Validators.required,
    ]),
    standardCost: this.formBuilder.control(EMPTY_ITEM_FORM.standardCost, [
      Validators.required,
      Validators.min(0.01),
    ]),
    standardPrice: this.formBuilder.control(EMPTY_ITEM_FORM.standardPrice, [
      Validators.required,
      Validators.min(0.01),
    ]),
    quantity: this.formBuilder.control(EMPTY_ITEM_FORM.quantity, [
      Validators.required,
      Validators.min(1),
      Validators.max(MAX_QUANTITY),
      integerValidator,
    ]),
    freeQuantity: this.formBuilder.control(EMPTY_ITEM_FORM.freeQuantity, [
      Validators.min(0),
      Validators.max(MAX_QUANTITY),
      integerValidator,
    ]),
    discountPercent: this.formBuilder.control(EMPTY_ITEM_FORM.discountPercent, [
      Validators.min(0),
      Validators.max(100),
    ]),
  });

  private readonly formValue = toSignal(
    this.form.valueChanges.pipe(map(() => this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );

  /** Margin, Total Cost and Total Selling for the line being entered. */
  readonly lineAmounts = computed(() => calculateLineAmounts(this.formValue()));

  constructor() {
    this.loadPageData();
  }

  loadPageData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      itemOptions: this.purchaseOrderService.getItemOptions(),
      locations: this.locationService.getLocations(),
    })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ itemOptions, locations }) => {
          this.itemOptions.set(itemOptions);
          this.locations.set(locations);
          // Re-check any text typed before the item list arrived.
          this.form.controls.itemName.updateValueAndValidity();
        },
        error: (error: unknown) =>
          this.loadError.set(toApiError(error, 'Could not load the purchase order data.').message),
      });
  }

  /** Adds the form's values to the order being built. Nothing is sent to the API yet. */
  addLine(): void {
    this.saveError.set(null);
    this.savedOrder.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const amounts = calculateLineAmounts(value);
    const batchLocationCode = value.batchLocationCode;
    const location = this.locations().find((item) => item.locationCode === batchLocationCode);

    this.lines.update((lines) => [
      ...lines,
      {
        tempId: this.nextTempId++,
        itemName: value.itemName.trim(),
        batchLocationCode,
        batchLocationName: location?.locationName ?? batchLocationCode,
        standardCost: value.standardCost ?? 0,
        standardPrice: value.standardPrice ?? 0,
        quantity: value.quantity ?? 0,
        freeQuantity: value.freeQuantity ?? 0,
        discountPercent: value.discountPercent ?? 0,
        ...amounts,
      },
    ]);

    this.form.reset(EMPTY_ITEM_FORM);
  }

  removeLine(tempId: number): void {
    this.lines.update((lines) => lines.filter((line) => line.tempId !== tempId));
  }

  /** Saves the whole order in one request; the API validates and recalculates every line. */
  saveOrder(): void {
    this.savedOrder.set(null);
    this.saveError.set(null);

    if (this.lines().length === 0) {
      this.saveError.set('Add at least one item before saving the order.');
      return;
    }

    this.isSaving.set(true);
    const items: PurchaseOrderItemRequest[] = this.lines().map((line) => ({
      itemName: line.itemName,
      batchLocationCode: line.batchLocationCode,
      standardCost: line.standardCost,
      standardPrice: line.standardPrice,
      quantity: line.quantity,
      freeQuantity: line.freeQuantity,
      discountPercent: line.discountPercent,
    }));

    this.purchaseOrderService
      .createOrder({ items })
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (order) => {
          this.savedOrder.set(order);
          this.lines.set([]);
          this.form.reset(EMPTY_ITEM_FORM);
        },
        error: (error: unknown) => {
          const apiError = toApiError(error, 'Could not save the order. Please try again.');
          this.saveError.set(describeError(apiError));
        },
      });
  }

  goToDashboard(): void {
    void this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}

/**
 * The API reports a bad line as "items[1].itemName". Turn that into a message naming the row,
 * because the line is in the table below, not in the form.
 */
function describeError(apiError: ApiError): string {
  const entries = Object.entries(apiError.fieldErrors);
  if (entries.length === 0) {
    return apiError.message;
  }

  return entries
    .map(([field, message]) => {
      const lineNumber = /items\[(\d+)]/i.exec(field)?.[1];
      return lineNumber === undefined ? message : `Line ${Number(lineNumber) + 1}: ${message}`;
    })
    .join(' ');
}
