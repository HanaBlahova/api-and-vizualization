import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TableComponent } from './components/table/table.component';
import { VizualizationComponent } from './components/vizualization/vizualization.component';

const routes: Routes = [
  { path: 'table', component: TableComponent },
  { path: 'vizualization', component: VizualizationComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
