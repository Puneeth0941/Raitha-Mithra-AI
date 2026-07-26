import axios from "axios";

const API_URL = "https://raitha-mithra-backend.onrender.com";

export interface BillData {
  id: number;
  farm_id?: number;
  bill_type: string;
  image_url: string;
  date?: string;
  notes?: string;
  uploaded_at: string;
}

export const getAllBills = async (): Promise<BillData[]> => {
  const response = await axios.get(`${API_URL}/all`);
  return response.data;
};

export const getBillsByFarm = async (farmId: number): Promise<BillData[]> => {
  const response = await axios.get(`${API_URL}/all/${farmId}`);
  return response.data;
};

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
  if (farmId) formData.append("farm_id", farmId.toString());
  formData.append("bill_type", billType);
  if (billDate) formData.append("bill_date", billDate);
  if (notes) formData.append("notes", notes);

  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
  return response.data;
};

export const deleteBill = async (billId: number): Promise<{ message: string }> => {
  const response = await axios.delete(`${API_URL}/delete/${billId}`);
  return response.data;
};

export const downloadBillUrl = (billId: number): string => {
  return `${API_URL}/download/${billId}`;
};
