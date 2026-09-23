import { IAnnotationStylesConfig } from './interfaces/IAnnotationStylesConfig'

export const annotationTypesStyles: IAnnotationStylesConfig = {
	update: {
		stroke: '#53fa00ff',
		fill: '#53fa0056',
		hover: {
			stroke: '#287800ff',
			fill: '#28780055',
		},
	},
	add: {
		stroke: '#00d995',
		fill: '#00d99547',
		hover: {
			stroke: '#00d995',
			fill: '#67d2b56e',
		},
	},

	delete: {
		stroke: '#ff6200',
		fill: '#f6600b40',
		hover: {
			stroke: '#ff6200',
			fill: '#f6600b82',
		},
	},
	default: {
		stroke: '#00d0fa',
		fill: '#0dc9f059',
		hover: {
			stroke: '#00768e',
			fill: '#0a99b880',
		},
	},
}
