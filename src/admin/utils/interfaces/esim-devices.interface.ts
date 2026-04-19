export interface IDeviceBrand {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface IDeviceModel {
  id: string;
  brandId: string;
  name: string;
  maxEsims: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  brand?: IDeviceBrand;
}

export interface IFormDeviceModel {
  brandId: string;
  name: string;
  maxEsims: number | string;
  isActive: boolean;
  sortOrder: number | string;
}
