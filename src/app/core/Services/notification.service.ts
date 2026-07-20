import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  toasts = signal<Toast[]>([]);

  show(message: string, type: Toast['type'] = 'success', duration: number = 4000) {
    const id = 'toast-' + Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type, duration };
    
    this.toasts.update(current => [...current, newToast]);
    this.playBeep();

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  remove(id: string) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  private playBeep() {
    if (typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        
        const audioCtx = new AudioContextClass();
        
        const playNote = (frequency: number, startTime: number, duration: number) => {
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          oscillator.type = 'sine';
          oscillator.frequency.value = frequency;
          
          gainNode.gain.setValueAtTime(0.15, startTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          
          oscillator.start(startTime);
          oscillator.stop(startTime + duration);
        };

        const now = audioCtx.currentTime;
        playNote(587.33, now, 0.12); // D5 chime
        playNote(880.00, now + 0.08, 0.22); // A5 chime
      } catch (e) {
        console.warn('AudioContext not supported or blocked by user gesture:', e);
      }
    }
  }
}
