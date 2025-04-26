import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-add-round-modal',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatInputModule, ReactiveFormsModule, NgFor],
  template: `
    <h2 mat-dialog-title>Add Round Scores</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <div *ngFor="let player of data.players; let i = index" class="score-input-row">
        <span class="avatar">{{ player.avatar }}</span>
        <span class="name">{{ player.name }}</span>
        <mat-form-field appearance="outline">
          <mat-label>Score</mat-label>
          <input matInput type="number" [formControlName]="'score_' + i" required />
        </mat-form-field>
      </div>
      <div class="modal-actions">
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Add</button>
        <button mat-stroked-button mat-dialog-close type="button">Cancel</button>
      </div>
    </form>
  `,
  styles: [`
    .score-input-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .avatar { font-size: 1.5em; }
    .name { min-width: 80px; font-weight: bold; }
    .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
  `]
})
export class AddRoundModalComponent {
  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddRoundModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { players: { name: string; avatar: string }[] }
  ) {
    const controls: { [key: string]: any } = {};
    data.players.forEach((_, i) => {
      controls['score_' + i] = [0, Validators.required];
    });
    this.form = this.fb.group(controls);
  }

  submit() {
    if (this.form.valid) {
      const scores = Object.keys(this.form.value).map(key => Number(this.form.value[key]));
      this.dialogRef.close(scores);
    }
  }
}
