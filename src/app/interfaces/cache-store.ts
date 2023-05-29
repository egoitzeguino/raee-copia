import { Observable } from "rxjs";
import { Raee } from "./raee.interface";

export interface CacheStore {
  term: string;
  raeesBuscados: Observable<Raee | undefined>;
}
