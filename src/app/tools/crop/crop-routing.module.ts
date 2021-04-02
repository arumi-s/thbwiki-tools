import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CropComponent } from './crop.component';

const routes: Routes = [
	{
		path: '',
		component: CropComponent,
		data: { title: '图片剪裁' }
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CropRoutingModule {}
