import BedgeSuccessIcon from "@/assets/header/bedge-success.svg";
import TimeSection from "./TimeSection";
import Select from "@/components/Select/Select";
import { useInstances } from "../hooks/useInstances";
import { useDbInfo } from "../hooks/useDbInfo";
import { useLocation } from "react-router-dom";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

// DB + Instance + Time
const HeaderLeft = () => {
  const location = useLocation();

  // "/dashboard" 라는 경로일 때만 노출
  const showTimeSection = location.pathname.startsWith("/dashboard");

  const { dbName } = useDbInfo();
  const { instances, selectedInstanceId, handleInstanceChange } =
    useInstances();

  return (
    <div className="header__left">
      <div className="header__dbinfo">
        <img src={BedgeSuccessIcon} alt="DB" />
        <div className="header__dbname">{dbName ?? "DB Name"}</div>
      </div>

      <Select
        placeholder="인스턴스 선택"
        size="sm"
        options={instances.map((i) => ({
          label: i.label,
          value: String(i.id),
        }))}
        value={selectedInstanceId !== null ? String(selectedInstanceId) : ""}
        onChange={handleInstanceChange}
      />

      {showTimeSection && <TimeSection />}
    </div>
  );
};

export default HeaderLeft;
