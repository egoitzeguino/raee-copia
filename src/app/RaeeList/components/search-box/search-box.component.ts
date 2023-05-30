import { Raee, TipoRAEE } from './../../interfaces/raee.interface';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RaeeService } from '../../services/raee.service';
import { take } from 'rxjs';

@Component({
  selector: 'raee-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.css']
})
export class SearchBoxComponent implements OnInit, AfterViewInit {

  // Elementos ViewChild para acceder a los elementos del DOM
  @ViewChild('txtTagInput') tagInput!: ElementRef<HTMLInputElement>;
  @ViewChild('DateInputIni') tagDateIni!: ElementRef<HTMLInputElement>;
  @ViewChild('DateInputFin') tagDateFin!: ElementRef<HTMLInputElement>;
  @ViewChild('regionInput') regionInput!: ElementRef<HTMLInputElement>;
  @ViewChild('tipoRaeeInput') tipoRaeeInput!: ElementRef<HTMLSelectElement>;

  // Propiedades de la clase
  isSearching: boolean = false;
  resultado?: Raee;
  resultados?: Raee[] = [];
  resultadosOriginales?: Raee[] = [];
  Todaydate = this.formatDate(new Date());
  tipoRaee: TipoRAEE;
  tipoRaeeValues: TipoRAEE[];

  constructor(
    public raeeService: RaeeService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngAfterViewInit(): void {
    this.tagDateFin.nativeElement.value = this.Todaydate.toString();
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
    this.tipoRaeeValues = Object.values(TipoRAEE) as TipoRAEE[];
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
    const newRegion = this.regionInput.nativeElement.value;
    const newTag = this.tagInput.nativeElement.value;
    const newDateIni = this.tagDateIni.nativeElement.value;
    let newDateFin = this.tagDateFin.nativeElement.value || this.Todaydate;
    const newTipoRaee = this.tipoRaee; // Obtener el valor seleccionado del tipo de RAEE

    if (!newDateFin) {
      newDateFin = this.Todaydate;
    }

    // Realizar búsqueda en el servicio de raees
    this.raeeService
      .searchTag(newTag, newDateIni, newDateFin, newRegion) // Pasar el valor seleccionado correctamente
      .subscribe(
        (resultados) => {
          if (resultados.length > 0) {
            // Filtrar los resultados
            this.resultados = resultados;
            this.isSearching = true;
            if(newTipoRaee)
             this.resultados = this.filtradoTipoRaee(newTipoRaee);
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

  padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
  }

  formatDate(date: Date) {
    return (
      [
        date.getFullYear(),
        this.padTo2Digits(date.getMonth() + 1),
        this.padTo2Digits(date.getDate()),
      ].join('-')
    );
  }
  filtradoTipoRaee(tipo:TipoRAEE):Raee[]{
    let temp:Raee[] = [];
    this.resultados!.forEach(r => {
      if(r.TipoRAEE === tipo)
        temp.push(r);
    });
    return temp;
  }
}
