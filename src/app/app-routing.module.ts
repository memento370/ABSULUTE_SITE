import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register-component/register-component';
import { MainComponent } from './main-component/main-component';
import { CabinetComponent } from './cabinet-component/cabinet-component';
import { FilesComponent } from './files-component/files-component';

const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'cabinet', component: CabinetComponent },
  { path: 'files', component: FilesComponent },
  { path: '', component: MainComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
