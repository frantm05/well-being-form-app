import "./Results.css";

export function Results({ results, categories }) {
    const categoryScores = results.categoryScores;
    const maxAvg = Math.max(...categoryScores.map((c) => c.avg));

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
        const radius = minRadius + (avg / maxAvg) * (maxRadius - minRadius);
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

                        return (
                            <path
                                key={`petal-${index}`}
                                d={path}
                                fill="#c75b7a"
                                fillOpacity="0.7"
                                stroke="#811035ff"
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
        </div>
    );
}
