import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { AgendaComponent } from './agenda/agenda.component';
import { ClientsComponent } from './clients/clients.component';
import { FinancialComponent } from './financial/financial.component';
import { ServicesHistoryComponent } from './services-history/services-history.component';
import { TeamComponent } from './team/team.component';
import { AdminServicesComponent } from './services/admin-services.component';
import { AdminProductsComponent } from './products/admin-products.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'agenda', component: AgendaComponent },
      { path: 'clientes', component: ClientsComponent },
      { path: 'equipe', component: TeamComponent },
      { path: 'financeiro', component: FinancialComponent },
      { path: 'servicos', component: AdminServicesComponent },
      { path: 'produtos', component: AdminProductsComponent },
      { path: 'servicos-historico', component: ServicesHistoryComponent }
    ]
  }
];
