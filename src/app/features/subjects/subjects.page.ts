import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SubjectsService } from '../../core/services/subjects.service';
import { Subject } from '../../core/services/subjects.service';

@Component({
  standalone: true,
  selector: 'app-subjects-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './subjects.page.html',
  styleUrls: ['./subjects.page.css']
})
export class SubjectsPage {
  private fb = inject(FormBuilder);
  private svc = inject(SubjectsService);

  subjects: Subject[] = [];
  form = this.fb.group({
    name: ['', Validators.required],
    code: ['', Validators.required]
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.svc.findAll().subscribe(r => (this.subjects = r));
  }

  create() {
    if (this.form.invalid) return;
    this.svc.create(this.form.value as any).subscribe(() => {
      this.form.reset();
      this.load();
    });
  }

  delete(id: number) {
    if (!confirm('Delete subject?')) return;
    this.svc.remove(id).subscribe(() => this.load());
  }
}
