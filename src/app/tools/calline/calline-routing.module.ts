import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CallineComponent } from './calline.component';

const routes: Routes = [
	{
		path: '',
		component: CallineComponent,
		data: { title: '图片边长计算' }
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CallineRoutingModule {}
