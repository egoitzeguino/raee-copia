import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Raee, TipoRAEE } from '../interfaces/raee.interface';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { CacheStore } from '../interfaces/cache-store';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import Fuse from 'fuse.js';

@Injectable({
  providedIn: 'root'
})
export class RaeeService {
  serviceUrl = 'https://trazatic-api.azurewebsites.net/api/objetos/';
  private _tagsHistory: string[] = [];
  lecturas: Raee[] = []; // Arreglo para almacenar las lecturas
  raees: Raee[] = []; // Arreglo para almacenar los raees únicos
  tagCounts: { [key: string]: number } = {}; // Objeto para almacenar el contador de etiquetas
  lecturasPorCodigo: { [key: string]: Raee[] } = {}; // Objeto para almacenar las lecturas por etiqueta
  raeesLecturas: [Raee, Raee[]][] = []; // Arreglo para almacenar pares de raee y lecturas relacionadas
  resultadoSubject = new BehaviorSubject<Raee | undefined>(undefined); // Sujeto para el resultado individual
  resultadosSubject = new BehaviorSubject<Raee[]>([]); // Sujeto para los resultados múltiples
  resultado$ = this.resultadoSubject.asObservable(); // Observable para el resultado individual
  resultadoBusqueda$ = this.resultadoSubject.asObservable(); // Observable para el resultado de la búsqueda
  resultados$ = this.resultadosSubject.asObservable(); // Observable para los resultados múltiples

  public cacheStore: CacheStore = {
    term: '',
    raeesBuscados: this.resultadoBusqueda$,
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
    // Suscribirse a los eventos de navegación del enrutador
    this.router.events.subscribe(event => {
      // Verificar si la URL es '/list' después de finalizar la navegación
      if (event instanceof NavigationEnd && event.url === '/list') {
        this.recargarListaConBusqueda();
      }
    });

    // Obtener las lecturas desde el servicio web al inicializar
    this.http.get<Raee[]>(`${this.serviceUrl}`).subscribe(
      (response) => {
        this.lecturas = response;
        this.updateTable();
      });
  }

  // Método para actualizar la tabla de raees
  updateTable(): void {
    this.raees = [];
    this.tagCounts = {};
    this.raeesLecturas = [];
    //this.lecturasPorCodigo = {};

    for (let i = 0; i < this.lecturas.length; i++) {
      const raee = this.lecturas[i];
      const tag = raee.CodigoEtiqueta;

      // Actualizar el contador de etiquetas
      if (!this.tagCounts[tag]) {
        this.tagCounts[tag] = 1;
      } else {
        this.tagCounts[tag]++;
      }

      // Crear el array raees con las etiquetas únicas y actualizar la propiedad contador
      const exists = this.raees.find((r) => r.CodigoEtiqueta === tag);
      if (!exists) {
        raee.contador = this.tagCounts[tag] || 1;
        raee.porcentaje = 0;
        this.raees.push(raee);
      } else {
        exists.contador = this.tagCounts[tag] || 1;
      }

      // Almacenar el raee en el objeto lecturasPorCodigo con su etiqueta correspondiente
      if (!this.lecturasPorCodigo[tag]) {
        this.lecturasPorCodigo[tag] = [];
      }
      if (!this.lecturasPorCodigo[tag].find((r) => r.CargaDatosLecturasId === raee.CargaDatosLecturasId))
        this.lecturasPorCodigo[tag].push(raee);
    }

    // Calcular la propiedad porcentaje para cada raee en base a su valor de contador
    this.raees.forEach((raee) => {
      const lecturas = this.lecturasPorCodigo[raee.CodigoEtiqueta];
      if (lecturas) {
        raee.base = lecturas.findIndex((r) => r.CargaDatosLecturasId === raee.CargaDatosLecturasId);
      } else {
        raee.base = -1; // Establecer -1 si el raee no se encuentra en lecturasPorCodigo
      }

      const tag = lecturas.length;
      if (tag === 1) {
        raee.porcentaje = 1;
      } else if (tag === 2 || tag === 3) {
        raee.porcentaje = 34.5;
      } else if (tag === 4 || tag === 5) {
        raee.porcentaje = 68;
      } else {
        raee.porcentaje = 100;
      }

      //console.log(this.lecturasPorCodigo[raee.CodigoEtiqueta]);
      //console.log(raee)
      this.raeesLecturas.push([raee, lecturas]);
    });
  }

  // Método para buscar etiquetas
  searchTag(query: string, dateIni: string, dateFin: string, region: string): Observable<Raee[]> {
    let newUrl = this.serviceUrl;
    newUrl += "?fechaInicio=" + dateIni;
    newUrl += "&fechaFin=" + dateFin;
    if (region.length > 0)
      newUrl += "&region=" + region;
    return this.http.get<Raee[]>(newUrl).pipe(
      map(data => this.findSimilarItems(data, query)),
      catchError(error => of([]))
    );
  }

  // Método para buscar elementos similares a una etiqueta
  findSimilarItems(data: Raee[], query: string): Raee[] {
    if (query === '')
      return data;

    const fuse = new Fuse(data, {
      keys: ['CodigoEtiqueta'], // Especificar las propiedades en las que buscar similitud
      includeScore: true, // Incluir puntajes de similitud en los resultados
      threshold: 0.2, // Ajustar el umbral para la similitud de coincidencia
      minMatchCharLength: 1, // Número mínimo de caracteres para una coincidencia
    });

    const results = fuse.search(query);
    const similarItems = results
      .map(result => ({
        ...result.item,
        score: result.score // Agregar el puntaje de similitud como una propiedad en el objeto Raee
      }))

    return similarItems;
  }

  // Método para recargar la lista con la búsqueda actual
  recargarListaConBusqueda() {
    const searchQuery = this.route.snapshot.queryParams['search'];
    if (searchQuery) {
      this.searchTag(searchQuery, "00-00-0000", "00-00-3000", "Pais Vasco").subscribe(
        (resultados) => {
          this.setResultados(resultados);
        },
        (error) => {
          console.log('Error');
        }
      );
    } else {
      this.setResultados([]);
    }
  }

  // Getter para obtener el historial de etiquetas
  get tagsHistory() {
    return this._tagsHistory;
  }

  // Método para establecer el resultado individual
  setResultado(result: Raee | undefined) {
    this.resultadoSubject.next(result);
  }

  // Método para establecer los resultados múltiples
  setResultados(resultados: Raee[]) {
    this.resultadosSubject.next(resultados);
  }

  // Método para establecer los raees
  setRaee(resultados: Raee[]) {
    this.lecturas = resultados;
    this.updateTable();
  }
}
