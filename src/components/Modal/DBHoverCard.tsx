import React from "react";

// Hover 시 표시되는 DB 요약 카드
const DBHoverCard: React.FC = () => {
  return (
    <div className="db-info-card">
      <h3>DB Name</h3>
      <p>
        <strong>IP</strong> <span>localhost</span>
      </p>
      <p>
        <strong>Port</strong> <span>1521</span>
      </p>
      <p>
        <strong>Database</strong> <span>CDB$ROOT</span>
      </p>
      <hr />
      <p>
        <strong>Active Sessions</strong> <span>1</span>
      </p>
      <p>
        <strong>Lock Wait Sessions</strong> <span>1</span>
      </p>
      <p>
        <strong>Session Logical Reads</strong> <span>1</span>
      </p>
      <p>
        <strong>Execute Count</strong> <span>1</span>
      </p>
    </div>
  );
};

export default DBHoverCard;
