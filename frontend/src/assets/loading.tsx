const LoadingSpinner = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 8 8" 
    preserveAspectRatio="xMidYMid" 
    width="32" 
    height="32" 
    style={{shapeRendering: 'auto', display: 'block', background: 'rgb(255, 255, 255)'}}
  >
    <g>
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((rotation, i) => (
        <g key={rotation} transform={`rotate(${rotation} 50 50)`}>
          <rect 
            fill="#000000" 
            height="12" 
            width="1" 
            ry="6" 
            rx="0.5" 
            y="24" 
            x="49.5"
          >
            <animate 
              repeatCount="indefinite" 
              begin={`${-0.0833333333333333 * (11-i)}s`}
              dur="1s" 
              keyTimes="0;1" 
              values="1;0" 
              attributeName="opacity"
            />
          </rect>
        </g>
      ))}
      <g></g>
    </g>
  </svg>
)

export default LoadingSpinner;