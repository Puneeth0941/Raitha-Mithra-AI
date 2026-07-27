import { API } from "./authService";

export interface BillData {
  id: number;
  farm_id?: number;
  bill_type: string;
  image_url: string;
  date?: string;
  notes?: string;
  uploaded_at: string;
}

const BASE = "/bill";

// Get all bills
export const getAllBills = async (): Promise<BillData[]> => {
  const response = await API.get(`${BASE}/all`);
  return response.data;
};

// Get bills by farm
export const getBillsByFarm = async (
  farmId: number
): Promise<BillData[]> => {
  const response = await API.get(`${BASE}/all/${farmId}`);
  return response.data;
};

// Upload bill
export const uploadBill = async (
  image: File,
  farmId?: number,
  billType: string = "General",
  billDate?: string,
  notes?: string,
  onUploadProgress?: (progressEvent: any) => void
): Promise<BillData> => {
  const formData = new FormData();

  formData.append("image", image);

  if (farmId) {
    formData.append("farm_id", farmId.toString());
  }

  formData.append("bill_type", billType);

  if (billDate) {
    formData.append("bill_date", billDate);
  }

  if (notes) {
    formData.append("notes", notes);
  }

  const response = await API.post(`${BASE}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });

  return response.data;
};

// Delete bill
export const deleteBill = async (
  billId: number
): Promise<{ message: string }> => {
  const response = await API.delete(`${BASE}/delete/${billId}`);
  return response.data;
};

// Download bill
export const downloadBillUrl = (billId: number): string => {
  return `${import.meta.env.VITE_API_URL}${BASE}/download/${billId}`;
};