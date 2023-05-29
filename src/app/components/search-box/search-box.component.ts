import { Raee } from './../../interfaces/raee.interface';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RaeeService } from '../../services/raee.service';
import { take } from 'rxjs';

@Component({
  selector: 'raee-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.css']
})
export class SearchBoxComponent implements OnInit {
  @ViewChild('txtTagInput') tagInput!: ElementRef<HTMLInputElement>;

  isSearching: boolean = false;
  resultado?: Raee;
  resultados?: Raee[] = [];
  resultadosOriginales?: Raee[] = [];


  constructor(
    public raeeService: RaeeService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  // Cargar la página localhost
  loadLocalhost() {
    window.location.href = '/lista';
  };

  ngOnInit(): void {
    this.handlePopstateEvent();
    this.raeeService.resultados$.pipe(take(1)).subscribe((resultados) => {
      this.resultadosOriginales = resultados;
    });

  }

  handlePopstateEvent() {
    this.raeeService.resultado$.pipe(take(1)).subscribe(
      (storedResult) => {
        if (storedResult) {
          // Si hay un resultado almacenado, se asigna a las propiedades correspondientes
          this.resultado = storedResult;
          this.resultados = [storedResult];
          this.isSearching = true;
          this.raeeService.recargarListaConBusqueda();
        } else {
          // Si no hay resultado almacenado, se reinician las propiedades
          this.resultado = undefined;
          this.resultados = [];
          this.isSearching = false;
        }
      }
    );
  }


  buscar() {
    const newTag = this.tagInput.nativeElement.value;

    if (newTag.trim() === '') {
      // Restablecer los resultados y las propiedades
      this.resultado = undefined;
      this.resultados = [];
      this.isSearching = false;
      this.raeeService.setResultado(undefined);
      this.raeeService.setResultados([]);

      // Restablecer el campo de búsqueda
      this.tagInput.nativeElement.value = ''; // Agregar esta línea

      return; // Salir del método sin realizar la búsqueda
    }

    // Realizar búsqueda en el servicio de raees
    this.raeeService.searchTag(newTag).subscribe(
      (resultados) => {
        if (resultados.length > 0) {
          // Filtrar los resultados
          this.resultados = resultados;
          this.isSearching = true;
          this.raeeService.setRaee(this.resultados);
        } else {
          // Si no se encontraron resultados, se muestra una alerta
          window.alert('No se encontraron etiquetas.');
          this.resultado = undefined;
          this.resultados = [];
          this.isSearching = false;
          this.raeeService.setResultado(undefined);
          this.raeeService.setResultados([]);
        }
      },
      (error) => {
        console.log('Error');
      }
    );

    this.handlePopstateEvent();
  }


}
