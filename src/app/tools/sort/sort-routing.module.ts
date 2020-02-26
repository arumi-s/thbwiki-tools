import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SortComponent } from './sort.component';

const routes: Routes = [
	{
		path: '',
		component: SortComponent,
		data: { title: '模板列表排序' }
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SortRoutingModule {}
