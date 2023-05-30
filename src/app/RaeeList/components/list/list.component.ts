import { Component, OnInit } from '@angular/core';
import { RaeeService } from '../../services/raee.service';
import { Raee } from '../../interfaces/raee.interface';
import { MatDialog } from '@angular/material/dialog';
import { TarjetaLecturaContent } from '../../pages/tarjeta-lecturas/terjeta-lectura';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { TarjetaRaeeContent } from '../../pages/tarjeta-raee/tarjeta-raee';

@Component({
  selector: 'raee-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  public page!: number;
  resultado?: Raee; // Resultado de la búsqueda
  resultados: Raee[] = []; // Lista de resultados
  static selectedRaee?: Raee | null = null; // Raee seleccionado
  raeeSelected?: Raee | null = null; // Raee seleccionado
  lecturasCodigo: Raee[] = []; // Lecturas de un código específico
  cantidadLecturas: number = 0; // Cantidad de lecturas
  static lecturaRaee: Raee[][] = []; // Lecturas de los raees
  static tipoRaeeImg: number; // Tipo de imagen de raee

  constructor(
    private raeeService: RaeeService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ejecutarAccion(raee?: Raee) {
    // Seleccionamos el raee
    if (ListComponent.selectedRaee === raee) {
      ListComponent.selectedRaee = null;
    } else {
      ListComponent.selectedRaee = raee;
    }
    this.raeeSelected = ListComponent.selectedRaee;

    this.dialog.open(TarjetaRaeeContent, {
      data: raee
    });
  }

  ngOnInit() {
    this.lecturasCodigo = [];

    this.raeeService.resultado$.subscribe(resultado => {
      if (resultado) {
        // Asignamos el porcentaje del raee correspondiente al resultado de búsqueda
        for (let i = 0; i < this.raees.length; i++) {
          if (resultado.CodigoEtiqueta === this.raees[i].CodigoEtiqueta) {
            resultado= this.raees[i];

          }
        }
        this.resultado = resultado;
      }
    });

    this.raeeService.resultados$.subscribe((resultados: Raee[]) => {
      if (resultados) {
        this.resultados = resultados;
      }
    });

    // Observador para recargar la lista de raees cuando se navega por la aplicación
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (this.location.getState()) {
          this.raeeService.recargarListaConBusqueda();
        }
      }
    });
  }

  get lecturas(): Raee[] {
    return this.raeeService.lecturas;
  }

  get raeeLecturas(): [Raee, Raee[]][] {
    return this.raeeService.raeesLecturas;
  }

  // Buscar raee en la lista de raees y devolver su lectura en la posición especificada
  findRaeeLecturas(raee: Raee, posicion: number): Raee | undefined {
    const raeeLecturas = this.raeeService.raeesLecturas;
    const index = raeeLecturas.findIndex(([r]) => r === raee);

    if (index !== -1 && posicion >= 0 && posicion < raeeLecturas[index][1].length) {
      return raeeLecturas[index][1][posicion];
    }

    return undefined;
  }

  get raees(): Raee[] {
    return this.raeeService.raees;
  }

  // Ejecutar lectura de un raee en una posición especificada
  ejecutarLectura(raee: Raee, posicion: number) {
    ListComponent.selectedRaee = raee;
    const lecturaSeleccionada = this.findRaeeLecturas(raee, posicion);
    if (lecturaSeleccionada) {
      this.dialog.open(TarjetaLecturaContent, {
        data: lecturaSeleccionada
      });
    }
  }

  // Obtener un rango de botones en función de una longitud
  getButtonRange(length: number): number[] {
    return Array(length).fill(0).map((_, index) => index);
  }

  // Abrir diálogo con la tarjeta de lectura
  openDialog(raee: Raee, type: string) {
    const dialogRef = this.dialog.open(TarjetaLecturaContent, {
      data: {
        raee,
        type
      }
    });
  }
  calculateVisibility(base:number, contador:number, index:number):boolean{
    console.log("Base:"+base);
    console.log("Contador:"+contador);
    console.log("Index:"+index);
    if (contador > 0 && index >= base && index < base+contador) {
      return true;
    }

    return false;
  }
}

