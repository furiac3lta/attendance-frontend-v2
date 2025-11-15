import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Subject {
  id: number;
  name: string;
  code: string;
}

export interface CreateSubjectDto {
  name: string;
  code: string;
}

@Injectable({ providedIn: 'root' })
export class SubjectsService {
  private base = `${environment.API_URL}/subjects`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<Subject[]> {
    return this.http.get<Subject[]>(this.base);
  }

  create(dto: CreateSubjectDto): Observable<Subject> {
    return this.http.post<Subject>(this.base, dto);
  }

  update(id: number, dto: Partial<CreateSubjectDto>): Observable<Subject> {
    return this.http.put<Subject>(`${this.base}/${id}`, dto);
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
