import { DamageReport, DamageMarker, ReportFormData } from "@/types/report";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Submit a new damage report to the backend
 */
export async function submitDamageReport(data: ReportFormData): Promise<void> {
  // Convert image to base64 for submission
  let imageBase64 = "";
  // if (data.image) {
  //   imageBase64 = await fileToBase64(data.image);
  // }

  const payload = {
    latitude: data.latitude,
    longitude: data.longitude,
    locationDetail: data.locationDetail,
    image: imageBase64,
    damageType: data.damageType,
    description: data.description,
    timestamp: new Date().toISOString(),
  };

  const response = await fetch(`${API_BASE_URL}/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to submit report" }));
    throw new Error(error.message || "Failed to submit report");
  }
}

/**
 * Fetch existing damage reports for display on map
 */
export async function fetchDamageReports(): Promise<DamageMarker[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch reports");
      return [];
    }

    const data = await response.json();
    return data.reports || [];
  } catch (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
}

/**
 * Convert File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get just the base64 string
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
