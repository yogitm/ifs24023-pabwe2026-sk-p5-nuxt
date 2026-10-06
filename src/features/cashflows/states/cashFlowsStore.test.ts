import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useCashFlowsStore } from "./cashFlowsStore";
import cashFlowApi from "../api/cashFlowApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("cashFlowsStore", () => {
  let store: ReturnType<typeof useCashFlowsStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useCashFlowsStore();
    vi.restoreAllMocks();
  });

  it("should have correct initial state", () => {
    expect(store.cashFlows).toEqual([]);
    expect(store.cashFlow).toBeNull();
    expect(store.stats).toBeNull();
    expect(store.labels).toEqual([]);
    expect(store.isCashFlow).toBe(false);
    expect(store.isCashFlowAdd).toBe(false);
    expect(store.isCashFlowAdded).toBe(false);
    expect(store.isCashFlowChange).toBe(false);
    expect(store.isCashFlowChanged).toBe(false);
    expect(store.isCashFlowDelete).toBe(false);
    expect(store.isCashFlowDeleted).toBe(false);
    expect(store.isCashFlowDeleteAll).toBe(false);
    expect(store.isCashFlowDeletedAll).toBe(false);
  });

  it("should toggle state flags via setters", () => {
    store.setIsCashFlow(true);
    expect(store.isCashFlow).toBe(true);

    store.setIsCashFlowAdd(true);
    expect(store.isCashFlowAdd).toBe(true);

    store.setIsCashFlowAdded(true);
    expect(store.isCashFlowAdded).toBe(true);

    store.setIsCashFlowChange(true);
    expect(store.isCashFlowChange).toBe(true);

    store.setIsCashFlowChanged(true);
    expect(store.isCashFlowChanged).toBe(true);

    store.setIsCashFlowDelete(true);
    expect(store.isCashFlowDelete).toBe(true);

    store.setIsCashFlowDeleted(true);
    expect(store.isCashFlowDeleted).toBe(true);

    store.setIsCashFlowDeleteAll(true);
    expect(store.isCashFlowDeleteAll).toBe(true);

    store.setIsCashFlowDeletedAll(true);
    expect(store.isCashFlowDeletedAll).toBe(true);
  });

  describe("asyncSetCashFlows", () => {
    it("should set cashFlows and stats on success", async () => {
      const mockData = {
        cash_flows: [{ id: 1, nominal: 50000 }] as any,
        stats: { cashflow: 50000 },
      };
      vi.spyOn(cashFlowApi, "getCashFlows").mockResolvedValue(mockData);

      await store.asyncSetCashFlows("inflow", "cash", "gaji", "2024-01-01", "2024-01-31");
      expect(store.cashFlows).toEqual(mockData.cash_flows);
      expect(store.stats).toEqual(mockData.stats);
    });

    it("should call showErrorDialog on failure", async () => {
      vi.spyOn(cashFlowApi, "getCashFlows").mockRejectedValue(new Error("Fetch failed"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);

      await store.asyncSetCashFlows();
      expect(errorSpy).toHaveBeenCalledWith("Fetch failed");
    });
  });

  describe("asyncSetCashFlowById", () => {
    it("should set cashFlow and isCashFlow to true on success", async () => {
      const mockDetail = { id: 1, nominal: 100000 } as any;
      vi.spyOn(cashFlowApi, "getCashFlowById").mockResolvedValue(mockDetail);

      await store.asyncSetCashFlowById(1);
      expect(store.cashFlow).toEqual(mockDetail);
      expect(store.isCashFlow).toBe(true);
    });

    it("should call showErrorDialog on failure", async () => {
      vi.spyOn(cashFlowApi, "getCashFlowById").mockRejectedValue(new Error("Detail failed"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);

      await store.asyncSetCashFlowById(99);
      expect(errorSpy).toHaveBeenCalledWith("Detail failed");
    });
  });

  describe("asyncSetLabels", () => {
    it("should set labels on success", async () => {
      vi.spyOn(cashFlowApi, "getLabels").mockResolvedValue(["gaji", "makan"]);

      await store.asyncSetLabels();
      expect(store.labels).toEqual(["gaji", "makan"]);
    });

    it("should call showErrorDialog on failure", async () => {
      vi.spyOn(cashFlowApi, "getLabels").mockRejectedValue(new Error("Labels failed"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);

      await store.asyncSetLabels();
      expect(errorSpy).toHaveBeenCalledWith("Labels failed");
    });
  });

  describe("asyncPostCashFlow", () => {
    it("should create cash flow, show success dialog, and set isCashFlowAdded", async () => {
      vi.spyOn(cashFlowApi, "postCashFlow").mockResolvedValue("Berhasil");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);

      await store.asyncPostCashFlow("inflow", "cash", "gaji", 500000, "Gaji bulanan");
      expect(successSpy).toHaveBeenCalledWith("Berhasil");
      expect(store.isCashFlowAdded).toBe(true);
      expect(store.isCashFlowAdd).toBe(false);
    });

    it("should call showErrorDialog on failure and reset isCashFlowAdd", async () => {
      vi.spyOn(cashFlowApi, "postCashFlow").mockRejectedValue(new Error("Post failed"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);

      await store.asyncPostCashFlow("inflow", "cash", "gaji", 500000, "Gaji bulanan");
      expect(errorSpy).toHaveBeenCalledWith("Post failed");
      expect(store.isCashFlowAdd).toBe(false);
    });
  });

  describe("asyncPutCashFlow", () => {
    it("should update cash flow, show success dialog, and set isCashFlowChanged", async () => {
      vi.spyOn(cashFlowApi, "putCashFlow").mockResolvedValue("Berhasil ubah");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);

      await store.asyncPutCashFlow(1, "outflow", "savings", "makan", 25000, "Makan siang");
      expect(successSpy).toHaveBeenCalledWith("Berhasil ubah");
      expect(store.isCashFlowChanged).toBe(true);
      expect(store.isCashFlowChange).toBe(false);
    });

    it("should call showErrorDialog on failure and reset isCashFlowChange", async () => {
      vi.spyOn(cashFlowApi, "putCashFlow").mockRejectedValue(new Error("Put failed"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);

      await store.asyncPutCashFlow(1, "outflow", "savings", "makan", 25000, "Makan siang");
      expect(errorSpy).toHaveBeenCalledWith("Put failed");
      expect(store.isCashFlowChange).toBe(false);
    });
  });

  describe("asyncDeleteCashFlow", () => {
    it("should delete cash flow, show success dialog, and set isCashFlowDeleted", async () => {
      vi.spyOn(cashFlowApi, "deleteCashFlow").mockResolvedValue("Berhasil hapus");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);

      await store.asyncDeleteCashFlow(1);
      expect(successSpy).toHaveBeenCalledWith("Berhasil hapus");
      expect(store.isCashFlowDeleted).toBe(true);
      expect(store.isCashFlowDelete).toBe(false);
    });

    it("should call showErrorDialog on failure and reset isCashFlowDelete", async () => {
      vi.spyOn(cashFlowApi, "deleteCashFlow").mockRejectedValue(new Error("Delete failed"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);

      await store.asyncDeleteCashFlow(1);
      expect(errorSpy).toHaveBeenCalledWith("Delete failed");
      expect(store.isCashFlowDelete).toBe(false);
    });
  });

  describe("asyncDeleteAllCashFlows", () => {
    it("should delete all cash flows, show success dialog, and set isCashFlowDeletedAll", async () => {
      vi.spyOn(cashFlowApi, "deleteAllCashFlows").mockResolvedValue("Berhasil reset");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);

      await store.asyncDeleteAllCashFlows();
      expect(successSpy).toHaveBeenCalledWith("Berhasil reset");
      expect(store.isCashFlowDeletedAll).toBe(true);
      expect(store.isCashFlowDeleteAll).toBe(false);
    });

    it("should call showErrorDialog on failure and reset isCashFlowDeleteAll", async () => {
      vi.spyOn(cashFlowApi, "deleteAllCashFlows").mockRejectedValue(new Error("Reset failed"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);

      await store.asyncDeleteAllCashFlows();
      expect(errorSpy).toHaveBeenCalledWith("Reset failed");
      expect(store.isCashFlowDeleteAll).toBe(false);
    });
  });
});
