// Viewer interfaces

export interface IImageStudy {
  id: string;
  patientId: string;
  studyDate: Date;
  series: IImageSeries[];
}

export interface IImageSeries {
  id: string;
  images: IImage[];
  metadata: Record<string, any>;
}

export interface IImage {
  id: string;
  url: string;
  dicomTags?: Record<string, any>;
}

export interface IViewerService {
  loadStudy(studyId: string): Promise<IImageStudy>;
  getViewportTools(): Tool[];
  render(container: HTMLElement, study: IImageStudy): Promise<void>;
}

export interface Tool {
  id: string;
  name: string;
  icon?: string;
}


