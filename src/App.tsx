import "./App.css";
import "@/styles/_global.scss";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./layouts/Layout";
import Dashboard from "./pages/Dashboard/InstanceMap/Dashboard/Dashboard";
import Analysis from "./pages/Analysis/Analysis";
import Improvement from "./pages/Improvement/Improvement";
import Setting from "./pages/Setting/Setting";
import AlertEventSetting from "./pages/Alert/AlertEventSetting/AlertEventSetting";
import AlerEventLog from "./pages/Alert/AlerEventLog/AlerEventLog";
import InstanceList from "./pages/Dashboard/InstanceList/InstanceList";
import Database from "./pages/Dashboard/InstanceMap/Database/Database";
import SqlStat from "./pages/SQL/SqlStat/SqlStat";
import SqlTop from "./pages/SQL/SqlTop/SqlTop";
import SqlAnalysis from "./pages/SQL/SqlAnalysis/SqlAnalysis";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={<Navigate to="dashboard/instance-map" replace />}
          />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard/instance-list" element={<InstanceList />} />
          <Route path="dashboard/instance-map" element={<Database />} />
          <Route path="sql/analysis" element={<SqlAnalysis />} />
          <Route path="sql/top" element={<SqlTop />} />
          <Route path="sql/stat" element={<SqlStat />} />
          <Route path="alert/event-setting" element={<AlertEventSetting />} />
          <Route path="alert/event-log" element={<AlerEventLog />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="improvement" element={<Improvement />} />
          <Route path="setting" element={<Setting />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
