export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  checkoutHeader: string;
  description: string;
  mdBlurb: string;
  highlights: string[];
  active?: boolean;
  readyToActivate?: boolean;
  imageSizes?: boolean;
  imagesUpdated?: boolean;
}
