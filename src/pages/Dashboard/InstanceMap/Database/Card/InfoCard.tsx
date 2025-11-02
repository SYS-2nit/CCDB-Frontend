import React from "react";
import "./InfoCard.scss";

interface InfoItem {
  label: string;
  value: string;
}

interface DBHoverCardProps {
  name?: string;
  data: InfoItem[];
  dividerIndex?: number;
}

const DBInfoRow: React.FC<InfoItem> = ({ label, value }) => (
  <p>
    <strong>{label}</strong> <span>{value}</span>
  </p>
);

const InfoCard: React.FC<DBHoverCardProps> = ({
  name = "DB Name",
  data,
  dividerIndex,
}) => {
  return (
    <div className="db-info-card">
      <h3>{name}</h3>
      <hr />
      {data.map((item, i) => (
        <React.Fragment key={i}>
          <DBInfoRow {...item} />
          {dividerIndex === i + 1 && <hr />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default InfoCard;
