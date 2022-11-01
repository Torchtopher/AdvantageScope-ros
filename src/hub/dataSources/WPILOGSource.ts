import Log from "../../shared/log/Log";
import WorkerManager from "../WorkerManager";
import { HistorialDataSource, HistorialDataSourceStatus } from "./HistoricalDataSource";

export default class WPILOGSource extends HistorialDataSource {
  handleMainMessage(data: any) {
    if (this.status != HistorialDataSourceStatus.Reading) return;
    this.setStatus(HistorialDataSourceStatus.Decoding);

    WorkerManager.request("../bundles/hub$wpilogWorker.js", data)
      .then((logData: any) => {
        if (this.status == HistorialDataSourceStatus.Error || this.status == HistorialDataSourceStatus.Stopped) return;
        if (this.outputCallback != null) this.outputCallback(Log.fromSerialized(logData));
        this.setStatus(HistorialDataSourceStatus.Ready);
      })
      .catch(() => {
        this.setStatus(HistorialDataSourceStatus.Error);
      });
  }
}