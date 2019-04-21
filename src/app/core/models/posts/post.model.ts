import { HeroImageProps } from './hero-image-props.model';

export interface Post {
  title: string;
  author: string;
  authorId: string;
  content: string;
  modifiedDate: number;
  published?: boolean;
  publishedDate?: number;
  imageProps?: HeroImageProps;
  id?: string;
  imagesUpdated?: Date;
  imageSizes?: number[];
  imageFilePathList?: string[];
  videoUrl?: string;
  featured?: boolean;
}
