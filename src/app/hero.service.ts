import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Hero } from './hero';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class HeroService {
  private heroesUrl = 'https://5dc46d6713d21600147e63f2.mockapi.io/heroes';
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  }

  constructor(
    private readonly messageService: MessageService,
    private readonly http: HttpClient
  ) { }

  private log(message: string): void {
    this.messageService.add(`HeroService: ${message}`);
  }

  private handleError<T>(operation: string, result?: T) {
    return (err: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(err);

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${err.message}`);

      return of(result as T)
    }
  }

  getHeroes(): Observable<Hero[]> {
    return this.http.get<Hero[]>(this.heroesUrl)
      .pipe(
        tap(() => this.log('Fetched heroes')),
        catchError(this.handleError<Hero[]>('getHeroes', []))
      );
  }

  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<Hero>(url)
      .pipe(
        tap(() => this.log('Fetched hero with id ' + id)),
        catchError(this.handleError<Hero>('getHero'))
      );
  }

  updateHero(hero: Hero): Observable<Hero> {
    const url = `${this.heroesUrl}/${hero.id}`;
    return this.http.put<Hero>(url, hero, this.httpOptions)
      .pipe(
        tap(() => this.log('Updated hero with id ' + hero.id)),
        catchError(this.handleError<Hero>('updateHero'))
      );
  }

  addHero(hero: Pick<Hero, 'name'>): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions)
      .pipe(
        tap(newHero => this.log('Added hero with id ' + newHero.id)),
        catchError(this.handleError<Hero>('addHero'))
      );;
  }

  deleteHero(hero: Hero): Observable<undefined> {
    const url = `${this.heroesUrl}/${hero.id}`;
    return this.http.delete<undefined>(url)
      .pipe(
        tap(() => this.log(`deleted hero id=${hero.id}`)),
        catchError(this.handleError<undefined>('deleteHero'))
      )
  }

  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) return of([]);

    return this.http.get<Hero[]>(this.heroesUrl)
      .pipe(
        tap(_ => this.log(`found heroes matching "${term}"`)),
        catchError(this.handleError<Hero[]>('searchHeroes', [])),
        map(
          heroes => heroes.filter(
            hero => hero.name.toLowerCase()
              .includes(term.trim().toLowerCase())
          )
        )
      );
  }
}
