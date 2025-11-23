// import { classNames } from "../../utils";

// const Typing = () => {
//   return (
//     <div
//       className={classNames(
//         "p-5 rounded-3xl bg-secondary w-fit inline-flex gap-1.5"
//       )}
//     >
//       <span className="animation1 h-2 w-2 bg-zinc-300 rounded-full"></span>
//       <span className="animation2 h-2 w-2 bg-zinc-300 rounded-full"></span>
//       <span className="animation3 h-2 w-2 bg-zinc-300 rounded-full"></span>
//     </div>
//   );
// };

// export default Typing;

import { Space } from "antd";

const Typing = () => {
  const dotStyle = {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "#d9d9d9",
    animation: "bounce 1.4s infinite ease-in-out both",
  };

  return (
    <>
      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0);
            }
            40% {
              transform: scale(1);
            }
          }
          
          .typing-dot-1 {
            animation-delay: -0.32s;
          }
          
          .typing-dot-2 {
            animation-delay: -0.16s;
          }
        `}
      </style>

      <div
        style={{
          display: "inline-flex",
          padding: "12px 16px",
          borderRadius: 16,
          background: "#f5f5f5",
          gap: 6,
        }}
      >
        <span style={dotStyle} className="typing-dot-1" />
        <span style={dotStyle} className="typing-dot-2" />
        <span style={dotStyle} />
      </div>
    </>
  );
};

export default Typing;
