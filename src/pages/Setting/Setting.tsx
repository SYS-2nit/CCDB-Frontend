import React, { useState, useEffect } from "react";
import "./Setting.scss";
import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";
import { fetchMembers, updateMember, type Member } from "@/api/Member/member";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

const Setting: React.FC = () => {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 페이지 진입 시 사용자 정보 불러오기
  useEffect(() => {
    const load = async () => {
      try {
        const members = await fetchMembers();
        setMember(members[0]); // TODO: 로그인 유저 기준 필터링 필요
      } catch (err) {
        console.error("사용자 정보 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // 저장 버튼 클릭 → update API 호출
  const handleSave = async () => {
    if (!member) return;

    setSaving(true);
    try {
      await updateMember(member.id, {
        username: member.username,
        email: member.email,
        company: member.company,
      });

      alert("회원 정보가 성공적으로 저장되었습니다.");
    } catch (err) {
      console.error("회원 정보 저장 실패:", err);
      alert("회원 정보 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !member)
    return <div className="setting">사용자 정보를 불러오는 중...</div>;

  return (
    <div className="setting">
      <div className="setting__card">
        <h2 className="setting__title">사용자 정보</h2>

        <div className="setting__content">
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
              disabled={saving}
              onClick={handleSave}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
