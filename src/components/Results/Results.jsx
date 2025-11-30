import "./Results.css";

export function Results({ results, categories }) {
  const categoryScores = results.categoryScores;
  const maxAvg = Math.max(...categoryScores.map((c) => c.avg));

  // Define colors for each petal with adjusted opacity for balance
  const petalColors = [
    { color: "#fae641", opacity: 0.55 }, // Yellow - slightly reduced
    { color: "#213f7e", opacity: 0.8 }, // Dark blue - good as is
    { color: "#e4302f", opacity: 0.55 }, // Red - reduced for less intensity
    { color: "#f1d0d1", opacity: 0.65 }, // Light pink - good as is
    { color: "#f37462", opacity: 0.6 }, // Coral - slightly reduced
    { color: "#5b3f8a", opacity: 0.7 }, // Purple - slightly reduced
    { color: "#41b2ab", opacity: 0.65 }, // Teal - slightly reduced
    { color: "#904b4f", opacity: 0.75 }, // Brown-red - slightly reduced
    { color: "#8ab942", opacity: 0.6 }, // Green - slightly reduced
    { color: "#ed168b", opacity: 0.5 }, // Hot pink - most reduced
  ];

  // Calculate overall average
  const overallAverage =
    categoryScores.length > 0
      ? categoryScores.reduce((sum, cat) => sum + cat.avg, 0) /
        categoryScores.length
      : 0;

  // Get evaluation message based on overall average
  const getEvaluationMessage = (avg) => {
    if (avg >= 0 && avg <= 2) {
      return "Your well-being is low right now, be gentle with yourself and prioritize self-care.";
    } else if (avg > 2 && avg <= 4) {
      return "Your well-being is in a sensitive place right now, prioritize yourself and stay attentive to your needs.";
    } else if (avg > 4 && avg <= 7) {
      return "Your well-being is in a good place, keep nurturing it with small positive daily choices!";
    } else if (avg > 7 && avg <= 10) {
      return "Wow, your well-being is shining, keep up the good job nurturing it!";
    }
    return "";
  };

  // Calculate polar coordinates for each category
  const getCoordinates = (index, total, radius) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2; // Start from top
    const x = 750 + radius * Math.cos(angle);
    const y = 750 + radius * Math.sin(angle);
    return { x, y, angle };
  };

  // Create smooth, rounded petal path
  const createPetalPath = (angle, avg, maxAvg) => {
    const maxRadius = 456;
    const minRadius = 62;
    const radius =
      maxAvg === 0
        ? minRadius
        : minRadius + (avg / maxAvg) * (maxRadius - minRadius);
    const petalWidth = 0.32; // Narrower petals for more elongated look

    const centerX = 750;
    const centerY = 750;

    // Calculate angles for petal edges
    const leftAngle = angle - petalWidth;
    const rightAngle = angle + petalWidth;

    // Inner connection points (near center)
    const innerRadius = 50;
    const innerLeftX = centerX + innerRadius * Math.cos(leftAngle);
    const innerLeftY = centerY + innerRadius * Math.sin(leftAngle);
    const innerRightX = centerX + innerRadius * Math.cos(rightAngle);
    const innerRightY = centerY + innerRadius * Math.sin(rightAngle);

    // Calculate petal side points at various distances
    const midRadius = radius * 0.85;
    const outerRadius = radius * 0.99;

    // Left side points
    const midLeftX = centerX + midRadius * Math.cos(leftAngle) * 1.2;
    const midLeftY = centerY + midRadius * Math.sin(leftAngle) * 1.2;
    const outerLeftX =
      centerX + outerRadius * Math.cos(leftAngle + petalWidth * 0.95);
    const outerLeftY =
      centerY + outerRadius * Math.sin(leftAngle + petalWidth * 0.95);

    // Right side points
    const midRightX = centerX + midRadius * Math.cos(rightAngle) * 1.2;
    const midRightY = centerY + midRadius * Math.sin(rightAngle) * 1.2;
    const outerRightX =
      centerX + outerRadius * Math.cos(rightAngle - petalWidth * 0.95);
    const outerRightY =
      centerY + outerRadius * Math.sin(rightAngle - petalWidth * 0.95);

    // Tip point (rounded)
    const tipX = centerX + radius * Math.cos(angle) * 0.99;
    const tipY = centerY + radius * Math.sin(angle) * 0.99;

    return `M ${innerLeftX} ${innerLeftY}
                Q ${midLeftX} ${midLeftY}, ${outerLeftX} ${outerLeftY}
                Q ${tipX} ${tipY}, ${outerRightX} ${outerRightY}
                Q ${midRightX} ${midRightY}, ${innerRightX} ${innerRightY}
                Z`;
  };

  return (
    <div className="results-container">
      <h2>Results</h2>

      <div className="overall-average">
        <span className="average-label">Overall Average:</span>
        <span className="average-value">{overallAverage.toFixed(1)}</span>
      </div>

      <div className="flower-chart">
        <svg viewBox="0 0 1500 1500" className="flower-svg">
          {/* Grid circles */}
          {[2, 4, 6, 8, 10].map((level) => (
            <circle
              key={level}
              cx="750"
              cy="750"
              r={62 + (level / 10) * 375}
              fill="none"
              stroke="#ddd"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}

          {/* Grid lines */}
          {categoryScores.map((_, index) => {
            const coords = getCoordinates(index, categoryScores.length, 437);
            return (
              <line
                key={`line-${index}`}
                x1="750"
                y1="750"
                x2={coords.x}
                y2={coords.y}
                stroke="#ddd"
                strokeWidth="1"
                opacity="0.3"
              />
            );
          })}

          {/* Petals */}
          {categoryScores.map((cat, index) => {
            const coords = getCoordinates(index, categoryScores.length, 0);
            const path = createPetalPath(coords.angle, cat.avg, maxAvg);
            const petalStyle = petalColors[index % petalColors.length];

            return (
              <path
                key={`petal-${index}`}
                d={path}
                fill={petalStyle.color}
                fillOpacity={petalStyle.opacity}
                stroke="#333"
                strokeWidth="2"
              />
            );
          })}

          {/* Center circle */}
          <circle
            cx="750"
            cy="750"
            r="50"
            fill="#a33a58ff"
            fillOpacity="0.8"
            stroke="#811035ff"
            strokeWidth="2"
          />

          {/* Category labels */}
          {categoryScores.map((cat, index) => {
            const coords = getCoordinates(index, categoryScores.length, 500);
            const textAnchor =
              coords.x > 750 ? "start" : coords.x < 750 ? "end" : "middle";

            return (
              <g key={`label-${index}`}>
                <text
                  x={coords.x}
                  y={coords.y}
                  textAnchor={textAnchor}
                  className="category-label"
                  dy="-0.5em"
                >
                  {cat.category}
                </text>
                <text
                  x={coords.x}
                  y={coords.y}
                  textAnchor={textAnchor}
                  className="category-score"
                  dy="1em"
                >
                  Average: {cat.avg.toFixed(1)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="final-evaluation">
        <h3>Your Well-being Evaluation</h3>
        <p className="evaluation-message">
          {getEvaluationMessage(overallAverage)}
        </p>
        <div className="evaluation-scale">
          <div className="scale-item">
            <span className="scale-range">0–2:</span>
            <span className="scale-text">Low - Be gentle with yourself</span>
          </div>
          <div className="scale-item">
            <span className="scale-range">3–4:</span>
            <span className="scale-text">Sensitive - Prioritize yourself</span>
          </div>
          <div className="scale-item">
            <span className="scale-range">5–7:</span>
            <span className="scale-text">Good - Keep nurturing it</span>
          </div>
          <div className="scale-item">
            <span className="scale-range">8–10:</span>
            <span className="scale-text">
              Excellent - Keep up the good work!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
