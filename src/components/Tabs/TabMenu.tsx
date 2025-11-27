import "./TabMenu.scss";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

// 문자열 탭을 제너릭 타입으로 받을 수 있게 설정
export interface TabItem<T extends string = string> {
  id: T;
  label: string;
}

interface TabMenuProps<T extends string = string> {
  tabs: ReadonlyArray<TabItem<T>>;
  activeTab: T;
  onTabChange: (tab: T) => void;
}

// 제너릭 컴포넌트 형태로 선언
const TabMenu = <T extends string>({
  tabs,
  activeTab,
  onTabChange,
}: TabMenuProps<T>) => {
  return (
    <div className="tab-menu">
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          className={`tab-menu__tab ${activeTab === id ? "active" : ""}`}
          onClick={() => onTabChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default TabMenu;
