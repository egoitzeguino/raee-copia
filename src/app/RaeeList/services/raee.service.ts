import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Raee } from '../interfaces/raee.interface';
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
  lecturas: Raee[] = [];
  raees: Raee[] = [];
  tagCounts: { [key: string]: number } = {};
  lecturasPorCodigo: { [key: string]: Raee[] } = {};
  raeesLecturas: [Raee, Raee[]][] = [];
  resultadoSubject = new BehaviorSubject<Raee | undefined>(undefined);
  resultadosSubject = new BehaviorSubject<Raee[]>([]);
  resultado$ = this.resultadoSubject.asObservable();
  resultadoBusqueda$ = this.resultadoSubject.asObservable();
  resultados$ = this.resultadosSubject.asObservable();

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

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.url === '/list') {
        this.recargarListaConBusqueda();
      }
    });
    this.http.get<Raee[]>(`${this.serviceUrl}`).subscribe(
      (response) => {
        this.lecturas = response;
        this.updateTable();
      });
  }

updateTable():void{

  this.raees = [];
  this.tagCounts = {};
  this.raeesLecturas = [] ;
  //this.lecturasPorCodigo = {};

      for (let i = 0; i < this.lecturas.length; i++) {
        const raee = this.lecturas[i];
        const tag = raee.CodigoEtiqueta;


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
        if(!this.lecturasPorCodigo[tag].find((r) => r.CargaDatosLecturasId === raee.CargaDatosLecturasId))
        this.lecturasPorCodigo[tag].push(raee);
      }


      // Calcular la propiedad porcentaje para cada raee en base a su valor de contador
      this.raees.forEach((raee) => {
        const tag = raee.contador;
        if (tag === 1) {
          raee.porcentaje = 1;
        } else if (tag === 2 || tag === 3) {
          raee.porcentaje = 34.5;
        } else if (tag === 4 || tag === 5) {
          raee.porcentaje = 68;
        } else {
          raee.porcentaje = 100;
        }

        const lecturas = this.lecturasPorCodigo[raee.CodigoEtiqueta];
        if (lecturas) {
          raee.base = lecturas.findIndex((r) => r.CargaDatosLecturasId === raee.CargaDatosLecturasId);
        } else {
          raee.base = -1; // Set -1 if the raee is not found in lecturasPorCodigo
        }
        console.log(this.lecturasPorCodigo[raee.CodigoEtiqueta]);
        console.log(raee)
        this.raeesLecturas.push([raee, lecturas]);

      });
    }

  searchTag(query: string,dateIni: string,dateFin:string): Observable<Raee[]> {
    let newUrl =this.serviceUrl;
    newUrl += "?fechaInicio="+dateIni;
    newUrl += "&fechaFin="+dateFin;
    return this.http.get<Raee[]>(newUrl).pipe(
      map(data => this.findSimilarItems(data, query)),
      catchError(error => of([]))
    );
  }
  findSimilarItems(data: Raee[], query: string): Raee[] {
    if(query === '')
      return data;
    const fuse = new Fuse(data, {
      keys: ['CodigoEtiqueta'], // Specify the properties to search for similarity
      includeScore: true, // Include similarity scores in the results
      threshold: 0.2, // Adjust the threshold for matching similarity
      minMatchCharLength: 1, // Minimum number of characters for a match
    });

    const results = fuse.search(query);
    const similarItems = results
      .map(result => ({
        ...result.item,
        score: result.score // Add the similarity score as a property in the Raee object
      }))

    return similarItems;
  }

  recargarListaConBusqueda() {
    const searchQuery = this.route.snapshot.queryParams['search'];
    if (searchQuery) {
      this.searchTag(searchQuery,"00-00-0000","00-00-3000").subscribe(
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

  get tagsHistory() {
    return this._tagsHistory;
  }

  setResultado(result: Raee | undefined) {
    this.resultadoSubject.next(result);
  }

  setResultados(resultados: Raee[]) {
    this.resultadosSubject.next(resultados);
  }
  setRaee(resultados: Raee[]){
    this.lecturas = resultados;
    this.updateTable();
  }
}
