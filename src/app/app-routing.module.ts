import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from './RaeeList/pages/main-page/main-page.component';
import { ListComponent } from './RaeeList/components/list/list.component';

const routes: Routes = [
  {
    path: '', // Ruta vacía (raíz de la aplicación)
    redirectTo: 'home', // Redirige a la ruta '/home'
    pathMatch: 'full' // Coincidencia completa para redireccionar
  },
  {
    path: 'home', // Ruta '/home'
    component: MainPageComponent // Componente asociado: MainPageComponent
  },
  {
    path: 'lista', // Ruta '/lista'
    component: ListComponent, // Componente asociado: ListComponent
    pathMatch: 'full' // Coincidencia completa para la ruta
  },
  {
    path: '**', // Ruta comodín, captura cualquier ruta no definida
    redirectTo: 'home' // Redirige a la ruta '/home'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], // Configuración de rutas principales
  exports: [RouterModule] // Exporta el módulo de rutas para su uso en otros módulos
})
export class AppRoutingModule { }
