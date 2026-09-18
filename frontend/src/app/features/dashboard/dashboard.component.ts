import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { toApiError } from '../../core/http/api-error';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { ItemQuantityDonutComponent } from './components/item-quantity-donut/item-quantity-donut.component';
import { LatestOrdersWidgetComponent } from './components/latest-orders-widget/latest-orders-widget.component';
import { OldestItemsWidgetComponent } from './components/oldest-items-widget/oldest-items-widget.component';
import { DashboardData } from './models/dashboard.models';
import { DashboardService } from './services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    AlertComponent,
    PageHeaderComponent,
    SpinnerComponent,
    ItemQuantityDonutComponent,
    LatestOrdersWidgetComponent,
    OldestItemsWidgetComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly userEmail = this.authService.currentUserEmail;
  readonly data = signal<DashboardData | null>(null);
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);

  /** True once data has loaded and there is nothing to show, so the page can invite the first order. */
  readonly isEmpty = computed(() => {
    const data = this.data();
    return data !== null && data.latestOrders.length === 0;
  });

  constructor() {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.dashboardService
      .getDashboard()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (data) => this.data.set(data),
        error: (error: unknown) =>
          this.loadError.set(toApiError(error, 'Could not load the dashboard.').message),
      });
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
