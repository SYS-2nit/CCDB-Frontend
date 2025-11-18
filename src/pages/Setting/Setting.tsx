import React, { useState, useEffect } from "react";
import "./Setting.scss";
import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";
import { fetchMembers, type Member } from "@/api/Member/member";

const Setting: React.FC = () => {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  // 페이지 진입 시 사용자 정보 불러오기
  useEffect(() => {
    const load = async () => {
      try {
        const members = await fetchMembers();

        // TODO: 로그인 유저 기준으로 필터링 필요함 → 지금은 첫 번째 유저 사용
        setMember(members[0]);
      } catch (err) {
        console.error("사용자 정보 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // 로딩 중 UI
  if (loading || !member)
    return <div className="setting">사용자 정보를 불러오는 중...</div>;

  return (
    <div className="setting">
      <div className="setting__card">
        <h2 className="setting__title">사용자 정보</h2>

        <div className="setting__content">
          {/* 입력란 */}
          <div className="setting__form">
            <Input
              size="lg"
              label="이름"
              value={member.username}
              onChange={(e) =>
                setMember({ ...member, username: e.target.value })
              }
            />

            <Input
              size="lg"
              label="이메일"
              value={member.email}
              onChange={(e) => setMember({ ...member, email: e.target.value })}
            />

            <Input
              size="lg"
              label="회사"
              value={member.company}
              onChange={(e) =>
                setMember({ ...member, company: e.target.value })
              }
            />

            {/* 저장 버튼 */}
            <Button
              text="저장"
              size="sm"
              variant="primary"
              onClick={() => console.log("저장 요청:", member)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
