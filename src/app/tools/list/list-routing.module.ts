import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListComponent } from './list.component';

const routes: Routes = [
	{
		path: '',
		component: ListComponent,
		data: { title: '列表处理' }
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ListRoutingModule {}
