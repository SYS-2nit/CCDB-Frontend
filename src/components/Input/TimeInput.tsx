import React, { useRef, useEffect } from "react";
import "./TimeInput.scss";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

interface TimeInputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// 시간 선택
const TimeInput: React.FC<TimeInputProps> = ({ label, value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    const container = containerRef.current;
    if (!input || !container) return;

    // 시간 선택 팝업이 열릴 때 중앙 정렬을 위한 시도
    // 브라우저 기본 동작이므로 제한적이지만, 입력 필드 위치를 조정
    const handleClick = () => {
      // 입력 필드의 위치를 계산하여 중앙에 가깝게 조정
      setTimeout(() => {
        const rect = container.getBoundingClientRect();
        const centerX = window.innerWidth / 2;
        const inputCenterX = rect.left + rect.width / 2;
        
        // 입력 필드가 화면 중앙에 가깝도록 스크롤 조정 (제한적)
        if (Math.abs(inputCenterX - centerX) > 100) {
          // 큰 차이가 있을 때만 스크롤 조정
          container.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 0);
    };

    input.addEventListener("click", handleClick);
    return () => {
      input.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div className="time-input" ref={containerRef}>
      {label && <label>{label}</label>}
      <input 
        ref={inputRef}
        type="time" 
        value={value} 
        onChange={onChange}
        style={{
          textAlign: "center",
        }}
      />
    </div>
  );
};

export default TimeInput;
