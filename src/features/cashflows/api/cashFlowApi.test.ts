import { describe, it, expect, vi, beforeEach } from "vitest";
import cashFlowApi from "./cashFlowApi";
import apiHelper from "../../../helpers/apiHelper";

describe("cashFlowApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getCashFlows", () => {
    it("should fetch cash flows with query parameters and return data", async () => {
      const mockResult = {
        status: "success",
        data: {
          cash_flows: [{ id: 1, nominal: 50000 }],
          stats: { cashflow: 50000 },
        },
      };

      const fetchSpy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => mockResult,
      } as any);

      const data = await cashFlowApi.getCashFlows("inflow", "cash", "gaji", "2024-01-01", "2024-01-31");
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("type=inflow&source=cash&label=gaji&start_date=2024-01-01&end_date=2024-01-31"),
        { method: "GET" }
      );
      expect(data.cash_flows).toHaveLength(1);
      expect(data.stats.cashflow).toBe(50000);
    });

    it("should fetch cash flows without parameters and handle empty data fallback", async () => {
      const mockResult = {
        status: "success",
        data: {},
      };

      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => mockResult,
      } as any);

      const data = await cashFlowApi.getCashFlows();
      expect(data.cash_flows).toEqual([]);
      expect(data.stats).toEqual({});
    });

    it("should throw error when api returns fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Gagal mengambil data" }),
      } as any);

      await expect(cashFlowApi.getCashFlows()).rejects.toThrow("Gagal mengambil data");
    });

    it("should throw error with fallback message when result message is missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as any);

      await expect(cashFlowApi.getCashFlows()).rejects.toThrow("Gagal mengambil data arus kas");
    });
  });

  describe("getCashFlowById", () => {
    it("should fetch single cash flow by id", async () => {
      const mockResult = {
        status: "success",
        data: {
          cash_flow: { id: 1, nominal: 100000 },
        },
      };

      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => mockResult,
      } as any);

      const cashFlow = await cashFlowApi.getCashFlowById(1);
      expect(cashFlow.id).toBe(1);
      expect(cashFlow.nominal).toBe(100000);
    });

    it("should throw error when fetching detail fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Data tidak ditemukan" }),
      } as any);

      await expect(cashFlowApi.getCashFlowById(99)).rejects.toThrow("Data tidak ditemukan");
    });

    it("should throw error with fallback message when detail fails without message", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as any);

      await expect(cashFlowApi.getCashFlowById(99)).rejects.toThrow("Gagal mengambil detail arus kas");
    });
  });

  describe("postCashFlow", () => {
    it("should post new cash flow successfully", async () => {
      const mockResult = {
        status: "success",
        message: "Berhasil menambahkan data",
      };

      const fetchSpy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => mockResult,
      } as any);

      const msg = await cashFlowApi.postCashFlow("inflow", "cash", "gaji", 500000, "Gaji bulanan");
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\/cash-flows$/),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            type: "inflow",
            source: "cash",
            label: "gaji",
            nominal: 500000,
            description: "Gaji bulanan",
          }),
        })
      );
      expect(msg).toBe("Berhasil menambahkan data");
    });

    it("should return fallback message if result message is empty on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success" }),
      } as any);

      const msg = await cashFlowApi.postCashFlow("inflow", "cash", "gaji", 500000, "Gaji");
      expect(msg).toBe("Berhasil menambahkan data");
    });

    it("should throw formatted error when post fails with field validation object", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Data tidak valid",
          data: { nominal: ["Nominal harus berupa angka"] },
        }),
      } as any);

      await expect(
        cashFlowApi.postCashFlow("inflow", "cash", "gaji", -10, "Gaji")
      ).rejects.toThrow("Data tidak valid: Nominal harus berupa angka");
    });

    it("should throw error when post fails without validation data or message", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as any);

      await expect(
        cashFlowApi.postCashFlow("inflow", "cash", "gaji", 50000, "Gaji")
      ).rejects.toThrow("Gagal menambahkan catatan arus kas");
    });
  });

  describe("putCashFlow", () => {
    it("should update cash flow successfully", async () => {
      const mockResult = {
        status: "success",
        message: "Berhasil mengubah data",
      };

      const fetchSpy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => mockResult,
      } as any);

      const msg = await cashFlowApi.putCashFlow(1, "outflow", "savings", "makan", 25000, "Makan siang");
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\/cash-flows\/1$/),
        expect.objectContaining({
          method: "PUT",
        })
      );
      expect(msg).toBe("Berhasil mengubah data");
    });

    it("should return fallback message if result message is missing on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success" }),
      } as any);

      const msg = await cashFlowApi.putCashFlow(1, "outflow", "savings", "makan", 25000, "Makan");
      expect(msg).toBe("Berhasil mengubah data");
    });

    it("should throw formatted error when update fails with validation object", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Validasi gagal",
          data: { label: ["Label tidak boleh kosong"] },
        }),
      } as any);

      await expect(
        cashFlowApi.putCashFlow(1, "outflow", "savings", "", 25000, "Makan")
      ).rejects.toThrow("Validasi gagal: Label tidak boleh kosong");
    });

    it("should throw fallback error when update fails without message", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as any);

      await expect(
        cashFlowApi.putCashFlow(1, "outflow", "savings", "makan", 25000, "Makan")
      ).rejects.toThrow("Gagal mengubah catatan arus kas");
    });
  });

  describe("deleteCashFlow", () => {
    it("should delete cash flow successfully", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil menghapus data" }),
      } as any);

      const msg = await cashFlowApi.deleteCashFlow(1);
      expect(msg).toBe("Berhasil menghapus data");
    });

    it("should return fallback message if result message is empty on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success" }),
      } as any);

      const msg = await cashFlowApi.deleteCashFlow(1);
      expect(msg).toBe("Berhasil menghapus data");
    });

    it("should throw error when delete fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Gagal menghapus" }),
      } as any);

      await expect(cashFlowApi.deleteCashFlow(1)).rejects.toThrow("Gagal menghapus");
    });

    it("should throw fallback message when delete fails without message", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as any);

      await expect(cashFlowApi.deleteCashFlow(1)).rejects.toThrow("Gagal menghapus catatan arus kas");
    });
  });

  describe("getLabels", () => {
    it("should return labels array", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", data: { labels: ["gaji", "makan"] } }),
      } as any);

      const labels = await cashFlowApi.getLabels();
      expect(labels).toEqual(["gaji", "makan"]);
    });

    it("should fallback to empty array if labels missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", data: {} }),
      } as any);

      const labels = await cashFlowApi.getLabels();
      expect(labels).toEqual([]);
    });

    it("should throw error when getLabels fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Error labels" }),
      } as any);

      await expect(cashFlowApi.getLabels()).rejects.toThrow("Error labels");
    });

    it("should throw fallback message when getLabels fails without message", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as any);

      await expect(cashFlowApi.getLabels()).rejects.toThrow("Gagal mengambil daftar label");
    });
  });

  describe("getStatsDaily", () => {
    it("should fetch daily stats with parameters", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", data: { stats_inflow: {} } }),
      } as any);

      const data = await cashFlowApi.getStatsDaily("2024-10-05 23:59:59", 7);
      expect(data).toHaveProperty("stats_inflow");
    });

    it("should fetch daily stats without parameters", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", data: {} }),
      } as any);

      const data = await cashFlowApi.getStatsDaily();
      expect(data).toEqual({});
    });

    it("should throw error when getStatsDaily fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Error daily" }),
      } as any);

      await expect(cashFlowApi.getStatsDaily()).rejects.toThrow("Error daily");
    });

    it("should throw fallback message when getStatsDaily fails without message", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as any);

      await expect(cashFlowApi.getStatsDaily()).rejects.toThrow("Gagal mengambil statistik harian");
    });
  });

  describe("getStatsMonthly", () => {
    it("should fetch monthly stats with parameters", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", data: { stats_monthly: {} } }),
      } as any);

      const data = await cashFlowApi.getStatsMonthly("2024-10-05 23:59:59", 12);
      expect(data).toHaveProperty("stats_monthly");
    });

    it("should fetch monthly stats without parameters", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", data: {} }),
      } as any);

      const data = await cashFlowApi.getStatsMonthly();
      expect(data).toEqual({});
    });

    it("should throw error when getStatsMonthly fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Error monthly" }),
      } as any);

      await expect(cashFlowApi.getStatsMonthly()).rejects.toThrow("Error monthly");
    });

    it("should throw fallback message when getStatsMonthly fails without message", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as any);

      await expect(cashFlowApi.getStatsMonthly()).rejects.toThrow("Gagal mengambil statistik bulanan");
    });
  });

  describe("deleteAllCashFlows", () => {
    it("should delete all cash flows successfully", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success", message: "Berhasil menghapus semua data" }),
      } as any);

      const msg = await cashFlowApi.deleteAllCashFlows();
      expect(msg).toBe("Berhasil menghapus semua data");
    });

    it("should return fallback message if result message is empty on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "success" }),
      } as any);

      const msg = await cashFlowApi.deleteAllCashFlows();
      expect(msg).toBe("Berhasil menghapus semua data cash flow");
    });

    it("should throw error when deleteAllCashFlows fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail", message: "Error reset" }),
      } as any);

      await expect(cashFlowApi.deleteAllCashFlows()).rejects.toThrow("Error reset");
    });

    it("should throw fallback message when deleteAllCashFlows fails without message", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({ status: "fail" }),
      } as any);

      await expect(cashFlowApi.deleteAllCashFlows()).rejects.toThrow("Gagal menghapus semua data arus kas");
    });
  });
});
