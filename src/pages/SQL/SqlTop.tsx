import React, { useState } from "react";
import "./SqlTop.scss";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import TableChart from "@/components/Chart/TableChart";
import Pagination from "@/components/Pagination/Pagination";
import SearchIcon from "@/assets/general/search.svg";
import LineChart from "@/components/Chart/LineChart";
import DateInput from "@/components/Input/DateInput";

const SqlTop: React.FC = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [compareDate, setCompareDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = 5;
  const columns = ["rank (+n)", "ratio", "execute count", "query"];
  const rows = Array.from({ length: 10 }).map((_, i) => [
    `N (+${i})`,
    "N %",
    "N",
    "SELECT ...",
  ]);

  return (
    <div className="sql-top">
      {/* 상단 영역 */}
      <div className="sql-top__header">
        <div className="sql-top__filters">
          <div className="sql-top__date-group">
            <label>기간</label>
            <DateInput
              label=""
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>~</span>
            <DateInput
              label=""
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* 비교 날짜 */}
          <div className="sql-top__compare">
            <label>비교</label>
            <DateInput
              label=""
              value={compareDate}
              onChange={(e) => setCompareDate(e.target.value)}
            />
          </div>

          {/* 검색란 */}
          <div className="sql-top__search">
            <label>조회 건수</label>
            <Input
              size="sm"
              variant="default"
              placeholder="조회 건수를 입력하세요"
              icon={SearchIcon}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              text="검색"
              size="sm"
              variant="primary"
              onClick={() => console.log("검색:", searchTerm)}
            />
          </div>
        </div>
      </div>

      {/* Summary Chart 영역 */}
      <div className="sql-top__summary">
        <div className="sql-top__chart">
          <LineChart
            legends={["기준 날짜", "비교 날짜"]}
            seriesData={[
              [
                8, 10, 12, 11, 9, 10, 8, 9, 11, 13, 12, 10, 9, 10, 11, 12, 13,
                12, 11, 9, 8, 10, 9, 11,
              ],
              [
                15, 18, 22, 20, 16, 18, 15, 17, 19, 21, 23, 20, 18, 19, 21, 22,
                20, 19, 18, 17, 15, 16, 18, 17,
              ],
            ]}
            categories={[
              "00:00",
              "01:00",
              "02:00",
              "03:00",
              "04:00",
              "05:00",
              "06:00",
              "07:00",
              "08:00",
              "08:00",
              "09:00",
              "10:00",
              "11:00",
              "12:00",
              "13:00",
              "14:00",
              "15:00",
              "16:00",
              "17:00",
              "18:00",
              "19:00",
              "20:00",
              "21:00",
              "22:00",
              "23:00",
              "24:00",
            ]}
          />
        </div>
      </div>

      {/* 테이블 비교 영역 */}
      <div className="sql-top__tables">
        <TableChart
          size="lg"
          columns={columns}
          rows={rows}
          onClick={() => console.log("좌측 클릭")}
        />
        <TableChart
          size="lg"
          columns={columns}
          rows={rows}
          onClick={() => console.log("우측 클릭")}
        />
      </div>

      {/* 페이지네이션 */}
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default SqlTop;
