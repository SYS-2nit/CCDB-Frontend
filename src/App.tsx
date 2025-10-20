import "./App.css";
import "@/styles/_global.scss";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./layouts/Layout";
import Dashboard from "./pages/Dashboard/Dashboard";
import SQL from "./pages/SQL/SQL";
import Alert from "./pages/Alert/Alert";
import Analysis from "./pages/Analysis/Analysis";
import Improvement from "./pages/Improvement/Improvement";
import Setting from "./pages/Setting/Setting";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sql" element={<SQL />} />
          <Route path="/alert" element={<Alert />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/improvement" element={<Improvement />} />
          <Route path="/setting" element={<Setting />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
