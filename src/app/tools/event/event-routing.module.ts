import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EventComponent } from './event.component';

const routes: Routes = [
	{
		path: '',
		component: EventComponent,
		data: { title: '展会摊位列表转换' }
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class EventRoutingModule {}
