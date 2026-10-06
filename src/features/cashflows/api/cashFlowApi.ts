import apiHelper from "../../../helpers/apiHelper";

export interface CashFlow {
  id: number;
  user_id: number;
  type: "inflow" | "outflow";
  source: "cash" | "savings" | "loans";
  label: string;
  description: string;
  nominal: number;
  created_at: string;
  updated_at: string;
}

export interface CashFlowStats {
  cashflow?: number;
  balance?: number;
  total_inflow?: number;
  total_outflow?: number;
  total_outflow_savings?: number;
  total_outflow_cash?: number;
  total_outflow_loans?: number;
  total_inflow_savings?: number;
  total_inflow_cash?: number;
  total_inflow_loans?: number;
  [key: string]: any;
}

export interface CashFlowsResponseData {
  cash_flows: CashFlow[];
  stats: CashFlowStats;
}

const cashFlowApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/cash-flows`;

  function _url(path: string = ""): string {
    return BASE_URL + path;
  }

  async function getCashFlows(
    type?: string | null,
    source?: string | null,
    label?: string | null,
    startDate?: string | null,
    endDate?: string | null
  ): Promise<CashFlowsResponseData> {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (source) params.append("source", source);
    if (label) params.append("label", label);
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await apiHelper.fetchData(_url(query), {
      method: "GET",
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal mengambil data arus kas");
    }

    return {
      cash_flows: result.data?.cash_flows || [],
      stats: result.data?.stats || {},
    };
  }

  async function getCashFlowById(id: string | number): Promise<CashFlow> {
    const response = await apiHelper.fetchData(_url(`/${id}`), {
      method: "GET",
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal mengambil detail arus kas");
    }

    return result.data?.cash_flow;
  }

  async function postCashFlow(
    type: string,
    source: string,
    label: string,
    nominal: number | string,
    description: string
  ): Promise<string> {
    const response = await apiHelper.fetchData(_url(""), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        source,
        label,
        nominal: Number(nominal),
        description,
      }),
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      const errorDetails =
        result.data && typeof result.data === "object"
          ? Object.values(result.data).flat().join(", ")
          : "";
      const baseMsg = result.message || "Gagal menambahkan catatan arus kas";
      throw new Error(errorDetails ? `${baseMsg}: ${errorDetails}` : baseMsg);
    }

    return result.message || "Berhasil menambahkan data";
  }

  async function putCashFlow(
    id: string | number,
    type: string,
    source: string,
    label: string,
    nominal: number | string,
    description: string
  ): Promise<string> {
    const response = await apiHelper.fetchData(_url(`/${id}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        source,
        label,
        nominal: Number(nominal),
        description,
      }),
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      const errorDetails =
        result.data && typeof result.data === "object"
          ? Object.values(result.data).flat().join(", ")
          : "";
      const baseMsg = result.message || "Gagal mengubah catatan arus kas";
      throw new Error(errorDetails ? `${baseMsg}: ${errorDetails}` : baseMsg);
    }

    return result.message || "Berhasil mengubah data";
  }

  async function deleteCashFlow(id: string | number): Promise<string> {
    const response = await apiHelper.fetchData(_url(`/${id}`), {
      method: "DELETE",
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal menghapus catatan arus kas");
    }

    return result.message || "Berhasil menghapus data";
  }

  async function getLabels(): Promise<string[]> {
    const response = await apiHelper.fetchData(_url("/labels"), {
      method: "GET",
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal mengambil daftar label");
    }

    return result.data?.labels || [];
  }

  async function getStatsDaily(
    endDate?: string | null,
    totalData?: number | null
  ): Promise<any> {
    const params = new URLSearchParams();
    if (endDate) params.append("end_date", endDate);
    if (totalData) params.append("total_data", String(totalData));

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await apiHelper.fetchData(_url(`/stats/daily${query}`), {
      method: "GET",
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal mengambil statistik harian");
    }

    return result.data;
  }

  async function getStatsMonthly(
    endDate?: string | null,
    totalData?: number | null
  ): Promise<any> {
    const params = new URLSearchParams();
    if (endDate) params.append("end_date", endDate);
    if (totalData) params.append("total_data", String(totalData));

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await apiHelper.fetchData(_url(`/stats/monthly${query}`), {
      method: "GET",
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal mengambil statistik bulanan");
    }

    return result.data;
  }

  async function deleteAllCashFlows(): Promise<string> {
    const response = await apiHelper.fetchData(_url(""), {
      method: "DELETE",
    });

    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || "Gagal menghapus semua data arus kas");
    }

    return result.message || "Berhasil menghapus semua data cash flow";
  }

  return {
    getCashFlows,
    getCashFlowById,
    postCashFlow,
    putCashFlow,
    deleteCashFlow,
    getLabels,
    getStatsDaily,
    getStatsMonthly,
    deleteAllCashFlows,
  };
})();

export default cashFlowApi;
