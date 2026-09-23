import type { DrawingStyle } from '@annotorious/openseadragon'

export interface IAnnotationStyleConfig extends DrawingStyle {
	hover?: DrawingStyle
	select?: DrawingStyle
}

export interface IAnnotationStylesConfig {
	[key: string]: IAnnotationStyleConfig
}
