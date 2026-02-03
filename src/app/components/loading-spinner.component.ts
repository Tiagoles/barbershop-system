import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex items-center justify-center"
      role="status"
    >
      <div [class]="spinnerClass()"></div>
    </div>
  `,
})
export class LoadingSpinnerComponent {
  // tamanho: sm | md | lg
  size = input<'sm' | 'md' | 'lg'>('md');

  // cor tailwind
  color = input<'blue' | 'red' | 'green' | 'yellow' | 'gray'>('blue');

  spinnerClass = computed(() => {
    const sizeMap = {
      sm: 'w-4 h-4 border-2',
      md: 'w-8 h-8 border-4',
      lg: 'w-12 h-12 border-4',
    };

    return `
      ${sizeMap[this.size()]}
      rounded-full
      animate-spin
      border-${this.color()}-500
      border-t-transparent
    `;
  });
}
