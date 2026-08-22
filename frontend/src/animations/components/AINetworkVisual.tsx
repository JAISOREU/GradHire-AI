import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface NetworkNode {
  id: string;
  label: string;
  x: number;
  y: number;
  radius?: number;
  color?: string;
  icon?: ReactNode;
}

export interface NetworkConnection {
  from: string;
  to: string;
  color?: string;
  animated?: boolean;
}

export interface AINetworkVisualProps {
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  width?: number;
  height?: number;
  className?: string;
  animated?: boolean;
  onNodeHover?: (nodeId: string | null) => void;
}

export const AINetworkVisual = ({
  nodes,
  connections,
  width = 800,
  height = 600,
  className = '',
  animated = true,
  onNodeHover,
}: AINetworkVisualProps) => {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div
      ref={containerRef}
      className={`ai-network ${visible ? 'ai-network--visible' : ''} ${animated ? 'ai-network--animated' : ''} ${className}`.trim()}
      style={{ width, height }}
      role="img"
      aria-hidden="true"
    >
      <svg viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="ai-node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="ai-network__connections">
          {connections.map((conn, i) => {
            const fromNode = nodeMap.get(conn.from);
            const toNode = nodeMap.get(conn.to);
            if (!fromNode || !toNode) return null;

            const isHighlighted = hoveredNode === conn.from || hoveredNode === conn.to;
            const opacity = hoveredNode ? (isHighlighted ? 0.9 : 0.15) : 0.6;

            return (
              <g key={i} className="ai-network__conn" style={{ '--conn-index': i } as Record<string, string | number>}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={conn.color || 'var(--color-primary)'}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  opacity={opacity}
                  strokeDasharray={conn.animated && !reducedMotion ? '6 4' : 'none'}
                  className="ai-network__conn-line"
                />
                {conn.animated && !reducedMotion && (
                  <circle r="2" fill={conn.color || 'var(--color-primary)'} opacity={0.8}>
                    <animateMotion
                      dur={`${2 + i * 0.3}s`}
                      repeatCount="indefinite"
                      path={`M${fromNode.x},${fromNode.y} L${toNode.x},${toNode.y}`}
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </g>

        <g className="ai-network__nodes">
          {nodes.map((node, i) => {
            const isHovered = hoveredNode === node.id;
            const r = node.radius || 24;

            return (
              <g
                key={node.id}
                className="ai-network__node"
                style={{ '--node-index': i } as Record<string, string | number>}
                onMouseEnter={() => { setHoveredNode(node.id); onNodeHover?.(node.id); }}
                onMouseLeave={() => { setHoveredNode(null); onNodeHover?.(null); }}
                onFocus={() => { setHoveredNode(node.id); onNodeHover?.(node.id); }}
                onBlur={() => { setHoveredNode(null); onNodeHover?.(null); }}
                tabIndex={0}
                role="button"
                aria-label={node.label}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r + 8}
                  fill={node.color || 'var(--color-primary)'}
                  opacity={isHovered ? 0.15 : 0}
                  className="ai-network__node-bg"
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r}
                  fill="var(--color-surface, #ffffff)"
                  stroke={node.color || 'var(--color-primary)'}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  filter="url(#ai-node-glow)"
                  className="ai-network__node-circle"
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r * 0.55}
                  fill={node.color || 'var(--color-primary)'}
                  opacity={0.15}
                  className="ai-network__node-core"
                />
                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--color-text)"
                  fontSize="9"
                  fontWeight="600"
                  className="ai-network__node-label"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      <style>{`
        .ai-network {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .ai-network svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        .ai-network__conn-line {
          stroke-dasharray: 240;
          stroke-dashoffset: 240;
          transition: stroke-dashoffset var(--conn-duration, 1.2s) cubic-bezier(0.22, 1, 0.36, 1) calc(var(--conn-index, 0) * 80ms);
        }

        .ai-network--visible .ai-network__conn-line {
          stroke-dashoffset: 0;
        }

        .ai-network__node {
          opacity: 0;
          transform: scale(0.8);
          transition:
            opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) calc(var(--node-index, 0) * 100ms + 200ms),
            transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) calc(var(--node-index, 0) * 100ms + 200ms);
          cursor: pointer;
          outline: none;
        }

        .ai-network--visible .ai-network__node {
          opacity: 1;
          transform: scale(1);
        }

        .ai-network__node-circle {
          transition: stroke-width 0.2s ease, transform 0.2s ease;
          transform-origin: center;
          transform-box: fill-box;
        }

        .ai-network__node:hover .ai-network__node-circle,
        .ai-network__node:focus .ai-network__node-circle {
          stroke-width: 2.5;
          transform: scale(1.08);
        }

        .ai-network__node-bg {
          transition: opacity 0.3s ease;
          transform-origin: center;
          transform-box: fill-box;
        }

        .ai-network__node:hover .ai-network__node-bg,
        .ai-network__node:focus .ai-network__node-bg {
          opacity: 0.15 !important;
        }

        @media (prefers-reduced-motion: reduce) {
          .ai-network__conn-line {
            stroke-dashoffset: 0 !important;
            transition-duration: 0.01ms !important;
            transition-delay: 0ms !important;
          }
          .ai-network__node {
            opacity: 1 !important;
            transform: none !important;
            transition-duration: 0.01ms !important;
            transition-delay: 0ms !important;
          }
        }
      `}</style>
    </div>
  );
};
