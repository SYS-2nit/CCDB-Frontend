import { useState } from "react";
import logo from "./assets/logo.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <img src={logo} className="logo" alt="Project logo" />
      </div>
      <h1>CCDB</h1>
      <p className="read-the-docs">
        Sysone Final Project 2팀 웹 사이트 입니다.
      </p>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  );
}

export default App;
