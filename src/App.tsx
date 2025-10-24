import "./App.css";
import "@/styles/_global.scss";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./layouts/Layout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Analysis from "./pages/Analysis/Analysis";
import Improvement from "./pages/Improvement/Improvement";
import Setting from "./pages/Setting/Setting";
import SqlTop from "./pages/SQL/SqlTop";
import SqlAnalysis from "./pages/SQL/SqlAnalysis";
import SqlStat from "./pages/SQL/SqlStat";
import AlertEventSetting from "./pages/Alert/AlertEventSetting";
import AlertLog from "./pages/Alert/AlertLog";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* SQL 관련 */}
          <Route path="/sql/analysis" element={<SqlAnalysis />} />
          <Route path="/sql/top" element={<SqlTop />} />
          <Route path="/sql/stat" element={<SqlStat />} />

          {/* 알림 관련 */}
          <Route path="/alert/event-setting" element={<AlertEventSetting />} />
          <Route path="/alert/log" element={<AlertLog />} />

          <Route path="/analysis" element={<Analysis />} />
          <Route path="/improvement" element={<Improvement />} />
          <Route path="/setting" element={<Setting />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
