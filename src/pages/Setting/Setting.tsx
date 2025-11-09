import React, { useState } from "react";
import "./Setting.scss";
import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";

const Setting: React.FC = () => {
  const [name, setName] = useState("유저1");
  const [email, setEmail] = useState("user1@gmail.com");
  const [company, setCompany] = useState("시스원");

  return (
    <div className="setting">
      <div className="setting__card">
        <h2 className="setting__title">사용자 정보</h2>

        <div className="setting__content">
          {/* 입력란 */}
          <div className="setting__form">
            <Input
              label="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="회사"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />

            {/* 저장 버튼 */}
            <Button text="저장" size="sm" variant="primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
