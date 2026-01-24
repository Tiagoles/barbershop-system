import { Injectable, signal } from '@angular/core';

export interface BarbershopSettings {
  name: string;
  phone: string;
  address: string;
  instagram: string;
  whatsapp: string;
  logoUrl: string | null;
  backgroundVideoUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  
  private initialSettings: BarbershopSettings = {
    name: 'BRUNO BARBERSHOP',
    phone: '27999887767',
    address: 'Avenida Antônio Peruchi, 616 - Honório Fraga, Colatina - ES, 29704-670',
    instagram: 'https://www.instagram.com/brunobarbershop.hf',
    whatsapp: 'https://wa.me/5527999887767',
    logoUrl: 'https://i.imgur.com/vK5u24z.png',
    backgroundVideoUrl: 'https://videos.pexels.com/video-files/3998393/3998393-uhd_2560_1440_25fps.mp4',
  };
  
  settings = signal<BarbershopSettings>(this.initialSettings);

  constructor() { }

  updateSettings(newSettings: Partial<BarbershopSettings>) {
    this.settings.update(current => ({...current, ...newSettings}));
  }
}
