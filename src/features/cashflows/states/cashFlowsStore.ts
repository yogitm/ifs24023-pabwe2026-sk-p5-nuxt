import { defineStore } from "pinia";
import cashFlowApi, {
  type CashFlow,
  type CashFlowStats,
} from "../api/cashFlowApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import apiHelper from "../../../helpers/apiHelper";

export interface CashFlowsState {
  cashFlows: CashFlow[];
  cashFlow: CashFlow | null;
  stats: CashFlowStats | null;
  labels: string[];
  statsDaily: any;
  statsMonthly: any;
  isCashFlow: boolean;
  isCashFlowAdd: boolean;
  isCashFlowAdded: boolean;
  isCashFlowChange: boolean;
  isCashFlowChanged: boolean;
  isCashFlowDelete: boolean;
  isCashFlowDeleted: boolean;
  isCashFlowDeleteAll: boolean;
  isCashFlowDeletedAll: boolean;
}

export const useCashFlowsStore = defineStore("cashFlows", {
  state: (): CashFlowsState => ({
    cashFlows: [],
    cashFlow: null,
    stats: null,
    labels: [],
    statsDaily: null,
    statsMonthly: null,
    isCashFlow: false,
    isCashFlowAdd: false,
    isCashFlowAdded: false,
    isCashFlowChange: false,
    isCashFlowChanged: false,
    isCashFlowDelete: false,
    isCashFlowDeleted: false,
    isCashFlowDeleteAll: false,
    isCashFlowDeletedAll: false,
  }),

  actions: {
    setIsCashFlow(val: boolean) {
      this.isCashFlow = val;
    },
    setIsCashFlowAdd(val: boolean) {
      this.isCashFlowAdd = val;
    },
    setIsCashFlowAdded(val: boolean) {
      this.isCashFlowAdded = val;
    },
    setIsCashFlowChange(val: boolean) {
      this.isCashFlowChange = val;
    },
    setIsCashFlowChanged(val: boolean) {
      this.isCashFlowChanged = val;
    },
    setIsCashFlowDelete(val: boolean) {
      this.isCashFlowDelete = val;
    },
    setIsCashFlowDeleted(val: boolean) {
      this.isCashFlowDeleted = val;
    },
    setIsCashFlowDeleteAll(val: boolean) {
      this.isCashFlowDeleteAll = val;
    },
    setIsCashFlowDeletedAll(val: boolean) {
      this.isCashFlowDeletedAll = val;
    },

    async asyncSetCashFlows(
      type?: string | null,
      source?: string | null,
      label?: string | null,
      startDate?: string | null,
      endDate?: string | null
    ) {
      try {
        const { cash_flows, stats } = await cashFlowApi.getCashFlows(
          type,
          source,
          label,
          startDate,
          endDate
        );
        this.cashFlows = cash_flows;
        this.stats = stats;
      } catch (error: any) {
        if (error?.message === "Belum melakukan autentikasi") {
          apiHelper.putAccessToken("");
        } else {
          showErrorDialog(error.message);
        }
      }
    },

    async asyncSetCashFlowById(id: string | number) {
      try {
        const cashFlow = await cashFlowApi.getCashFlowById(id);
        this.cashFlow = cashFlow;
        this.isCashFlow = true;
      } catch (error: any) {
        if (error?.message === "Belum melakukan autentikasi") {
          apiHelper.putAccessToken("");
        } else {
          showErrorDialog(error.message);
        }
      }
    },

    async asyncSetLabels() {
      try {
        const labels = await cashFlowApi.getLabels();
        this.labels = labels;
      } catch (error: any) {
        if (error?.message === "Belum melakukan autentikasi") {
          apiHelper.putAccessToken("");
        } else {
          showErrorDialog(error.message);
        }
      }
    },

    async asyncPostCashFlow(
      type: string,
      source: string,
      label: string,
      nominal: number | string,
      description: string
    ) {
      this.isCashFlowAdd = true;
      try {
        const msg = await cashFlowApi.postCashFlow(
          type,
          source,
          label,
          nominal,
          description
        );
        await showSuccessDialog(msg);
        this.isCashFlowAdded = true;
      } catch (error: any) {
        showErrorDialog(error.message);
      } finally {
        this.isCashFlowAdd = false;
      }
    },

    async asyncPutCashFlow(
      id: string | number,
      type: string,
      source: string,
      label: string,
      nominal: number | string,
      description: string
    ) {
      this.isCashFlowChange = true;
      try {
        const msg = await cashFlowApi.putCashFlow(
          id,
          type,
          source,
          label,
          nominal,
          description
        );
        await showSuccessDialog(msg);
        this.isCashFlowChanged = true;
      } catch (error: any) {
        showErrorDialog(error.message);
      } finally {
        this.isCashFlowChange = false;
      }
    },

    async asyncDeleteCashFlow(id: string | number) {
      this.isCashFlowDelete = true;
      try {
        const msg = await cashFlowApi.deleteCashFlow(id);
        await showSuccessDialog(msg);
        this.isCashFlowDeleted = true;
      } catch (error: any) {
        showErrorDialog(error.message);
      } finally {
        this.isCashFlowDelete = false;
      }
    },

    async asyncDeleteAllCashFlows() {
      this.isCashFlowDeleteAll = true;
      try {
        const msg = await cashFlowApi.deleteAllCashFlows();
        await showSuccessDialog(msg);
        this.isCashFlowDeletedAll = true;
      } catch (error: any) {
        showErrorDialog(error.message);
      } finally {
        this.isCashFlowDeleteAll = false;
      }
    },
  },
});
