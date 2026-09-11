import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, forkJoin, map } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { toApiError } from '../../core/http/api-error';
import { UserLocation } from '../../core/locations/location.model';
import { LocationService } from '../../core/locations/location.service';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { AutocompleteComponent } from '../../shared/components/autocomplete/autocomplete.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { integerValidator, oneOfValidator } from '../../shared/forms/validators';
import { ItemSummaryComponent } from './components/item-summary/item-summary.component';
import { PurchaseItemsTableComponent } from './components/purchase-items-table/purchase-items-table.component';
import { PurchaseBillItem, PurchaseBillItemRequest } from './models/purchase-bill.models';
import { PurchaseBillService } from './services/purchase-bill.service';
import { calculateLineAmounts, summarizeItems } from './utils/purchase-bill-calculations';

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
  selector: 'app-purchase-bill',
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    AlertComponent,
    AutocompleteComponent,
    FormFieldComponent,
    SpinnerComponent,
    ItemSummaryComponent,
    PurchaseItemsTableComponent,
  ],
  templateUrl: './purchase-bill.component.html',
  styleUrl: './purchase-bill.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseBillComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly purchaseBillService = inject(PurchaseBillService);
  private readonly locationService = inject(LocationService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly userEmail = this.authService.currentUserEmail;
  readonly itemOptions = signal<string[]>([]);
  readonly locations = signal<UserLocation[]>([]);
  readonly items = signal<PurchaseBillItem[]>([]);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);

  readonly summary = computed(() => summarizeItems(this.items()));

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

  /** Margin, Total Cost and Total Selling for the item being entered. */
  readonly lineAmounts = computed(() => calculateLineAmounts(this.formValue()));

  constructor() {
    this.loadPageData();
  }

  loadPageData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      itemOptions: this.purchaseBillService.getItemOptions(),
      locations: this.locationService.getLocations(),
      items: this.purchaseBillService.getItems(),
    })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ itemOptions, locations, items }) => {
          this.itemOptions.set(itemOptions);
          this.locations.set(locations);
          this.items.set(items);
          // Re-check any text typed before the item list arrived.
          this.form.controls.itemName.updateValueAndValidity();
        },
        error: (error: unknown) =>
          this.loadError.set(toApiError(error, 'Could not load the purchase bill data.').message),
      });
  }

  addItem(): void {
    this.saveError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.purchaseBillService
      .addItem(this.buildRequest())
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (savedItem) => {
          this.items.update((items) => [...items, savedItem]);
          this.form.reset(EMPTY_ITEM_FORM);
        },
        error: (error: unknown) => {
          const apiError = toApiError(error, 'Could not add the item. Please try again.');
          this.showServerFieldErrors(apiError.fieldErrors);
          this.saveError.set(apiError.message);
        },
      });
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  private buildRequest(): PurchaseBillItemRequest {
    const value = this.form.getRawValue();
    return {
      itemName: value.itemName.trim(),
      batchLocationCode: value.batchLocationCode,
      standardCost: value.standardCost ?? 0,
      standardPrice: value.standardPrice ?? 0,
      quantity: value.quantity ?? 0,
      freeQuantity: value.freeQuantity ?? 0,
      discountPercent: value.discountPercent ?? 0,
    };
  }

  /** Shows validation messages returned by the API under the matching form fields. */
  private showServerFieldErrors(fieldErrors: Record<string, string>): void {
    for (const [field, message] of Object.entries(fieldErrors)) {
      const control = this.form.get(field);
      control?.setErrors({ ...control.errors, server: message });
      control?.markAsTouched();
    }
  }
}
