import "./App.css";
import "@/styles/_global.scss";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./layouts/Layout";
import Dashboard from "./pages/Dashboard/InstanceMap/Dashboard/Dashboard";
import Analysis from "./pages/Analysis/Analysis";
import Improvement from "./pages/Improvement/Improvement";
import History from "./pages/History/History";
import Setting from "./pages/Setting/Setting";
<<<<<<< HEAD
import SqlTop from "./pages/SQL/SqlTop";
import SqlAnalysis from "./pages/SQL/SqlAnalysis";
import SqlStat from "./pages/SQL/SqlStat";
=======
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
import AlertEventSetting from "./pages/Alert/AlertEventSetting/AlertEventSetting";
import AlerEventLog from "./pages/Alert/AlerEventLog/AlerEventLog";
import InstanceList from "./pages/Dashboard/InstanceList/InstanceList";
import Database from "./pages/Dashboard/InstanceMap/Database/Database";
<<<<<<< HEAD
=======
import SqlStat from "./pages/SQL/SqlStat/SqlStat";
import SqlTop from "./pages/SQL/SqlTop/SqlTop";
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b

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
<<<<<<< HEAD
          <Route path="sql/analysis" element={<SqlAnalysis />} />
=======
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
          <Route path="sql/top" element={<SqlTop />} />
          <Route path="sql/stat" element={<SqlStat />} />
          <Route path="alert/event-setting" element={<AlertEventSetting />} />
          <Route path="alert/event-log" element={<AlerEventLog />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="improvement" element={<Improvement />} />
<<<<<<< HEAD
=======
          <Route path="history" element={<History />} />
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
          <Route path="setting" element={<Setting />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
