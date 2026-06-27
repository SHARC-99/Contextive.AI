import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-upload',
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.html',
  styleUrl: './upload.css'
  
})
export class UploadComponent {
  selectedFile: File | null = null;
  outputType: string = 'User Stories';
  customFormat: string = '';
  isUploading: boolean = false;
  errorMessage: string = '';
  resultContent: string = '';
  isCopied: boolean = false;
  dragOver: boolean = false;

  private apiUrl = 'https://contextive-ai.onrender.com/Upload';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.setFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.setFile(event.dataTransfer.files[0]);
    }
  }

  private setFile(file: File) {
    const allowedExtensions = ['.txt', '.mp3', '.wav', '.mp4'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      this.errorMessage = `Unsupported file format: ${fileExtension}. Please upload a .txt, .mp3, .wav, or .mp4 file.`;
      this.selectedFile = null;
      return;
    }

    if (file.size > 104857600) { // 100MB
      this.errorMessage = 'File size exceeds the 100MB limit.';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';
    this.resultContent = '';
  }

  clearFile() {
    this.selectedFile = null;
    this.errorMessage = '';
    this.resultContent = '';
  }

  onSubmit() {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file to upload.';
      return;
    }

    this.isUploading = true;
    this.errorMessage = '';
    this.resultContent = '';

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    const actualOutputType = this.outputType === 'Custom' ? this.customFormat : this.outputType;
    formData.append('outputType', actualOutputType || 'Structured Summary');

    this.http.post<{ content: string }>(this.apiUrl, formData).subscribe({
      next: (res) => {
        this.resultContent = res.content;
        this.isUploading = false;
        this.cdr.detectChanges();
        this.saveToHistory(this.selectedFile!.name, actualOutputType);
      },
      error: (err) => {
        console.error('Upload failed:', err);
        this.errorMessage = err.error || 'An error occurred during file processing. Please ensure the backend is running and your OpenAI API key is valid.';
        this.isUploading = false;
        this.cdr.detectChanges();
      }
    });
  }

  copyToClipboard() {
    if (!this.resultContent) return;
    navigator.clipboard.writeText(this.resultContent).then(() => {
      this.isCopied = true;
      setTimeout(() => this.isCopied = false, 2000);
    });
  }

  private saveToHistory(filename: string, type: string) {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const historyJson = localStorage.getItem('contextive_history');
        const history = historyJson ? JSON.parse(historyJson) : [];
        history.unshift({
          filename,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          type: type.length > 25 ? 'Custom Format' : type
        });
        localStorage.setItem('contextive_history', JSON.stringify(history));
      } catch (e) {
        console.error('Error saving history to localStorage:', e);
      }
    }
  }
}