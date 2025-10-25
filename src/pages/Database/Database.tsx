import Header from "@/components/Header/Header";
import React from "react";

const Database: React.FC = () => {
  return (
    <div>
      <Header showTime={false} />
      <div className="background">
        <span>DB 설정 화면입니다.</span>
      </div>
    </div>
  );
};

export default Database;
