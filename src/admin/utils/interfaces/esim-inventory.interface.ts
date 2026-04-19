export interface IEsimInventoryItem {
  id: string;
  order: any;
  shared: {
    id: string;
    shared_email: string;
    shared_at: Date | string;
    product_name: string[];
  }[] | null;
  created_at: string;
  updated_at: string;
}


