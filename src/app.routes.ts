import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ServicesComponent } from './components/services/services.component';
import { ProductsComponent } from './components/products/products.component';
import { AppointmentsComponent } from './components/appointments/appointments.component';
import { BookingComponent } from './components/booking/booking.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'appointments', component: AppointmentsComponent },
  { path: 'booking', component: BookingComponent },
  {
    path: 'admin',
    loadChildren: () => import('./components/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
];
