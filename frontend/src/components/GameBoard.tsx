// src/components/GameBoard.tsx
import { Package, Warehouse, Users } from "lucide-react";

export default function GameBoard() {
  return (
    <div className="board">
      {/* Top Row: Suppliers and Customers */}
      <div className="tile suppliers group">
        {/* Invisible, full-tile overlay so the anchor = tile center */}
        <div data-flow-anchor="SUP" className="flow-anchor-cover" />
        <div className="tile-header">
          <div className="tile-icon suppliers-icon">
            <Package size={20} />
          </div>
          <h3 className="tile-title">Suppliers</h3>
        </div>
        <div className="tile-content">
          <div className="stat-row">
            <span className="stat-label">Active POs</span>
            <span className="stat-value">12</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Lead Time</span>
            <span className="stat-value text-blue-300">3-5 days</span>
          </div>
        </div>
      </div>

      <div className="tile customers group">
        <div data-flow-anchor="CUST" className="flow-anchor-cover" />
        <div className="tile-header">
          <div className="tile-icon customers-icon">
            <Users size={20} />
          </div>
          <h3 className="tile-title">Customers</h3>
        </div>
        <div className="tile-content">
          <div className="stat-row">
            <span className="stat-label">Active Orders</span>
            <span className="stat-value">18</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Fulfillment</span>
            <span className="stat-value text-emerald-300">94%</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Warehouse centered */}
      <div className="tile warehouse group warehouse-bottom">
        <div data-flow-anchor="WH" className="flow-anchor-cover" />
        <div className="tile-header">
          <div className="tile-icon warehouse-icon">
            <Warehouse size={20} />
          </div>
          <h3 className="tile-title">Warehouse</h3>
        </div>
        <div className="tile-content">
          <div className="stat-row">
            <span className="stat-label">Total Items</span>
            <span className="stat-value">248</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Utilization</span>
            <span className="stat-value text-emerald-300">76%</span>
          </div>
        </div>
      </div>

      <style>
        {`
          .board {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            grid-template-rows: auto auto;
            gap: 24px;
            width: 100%;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .tile {
            position: relative;
            border-radius: 12px;
            padding: 16px;
            background: linear-gradient(145deg, rgba(26, 29, 36, 0.6) 0%, rgba(17, 19, 24, 0.8) 100%);
            border: 1px solid rgba(255, 255, 255, 0.05);
            min-height: 160px;
            transition: all 0.3s ease;
            backdrop-filter: blur(12px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
          }
          
          .warehouse-bottom {
            grid-column: 1 / -1;
            max-width: 400px;
            margin: 0 auto;
            width: 100%;
          }
          
          .tile:hover {
            transform: translateY(-2px);
            border-color: rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
          }
          
          .tile::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            border-radius: 16px 16px 0 0;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          .tile:hover::before {
            opacity: 1;
          }
          
          .suppliers::before {
            background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
          }
          
          .warehouse::before {
            background: linear-gradient(90deg, #10b981 0%, #06b6d4 100%);
          }
          
          .customers::before {
            background: linear-gradient(90deg, #f59e0b 0%, #ef4444 100%);
          }
          
          .flow-anchor-cover {
            position: absolute;
            inset: 0;
            pointer-events: none;
          }
          
          .tile-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 12px;
          }
          
          .tile-icon {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            transition: all 0.3s ease;
          }
          
          .group:hover .tile-icon {
            transform: scale(1.1) rotate(5deg);
          }
          
          .suppliers-icon {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
            border: 1px solid rgba(59, 130, 246, 0.3);
            color: #93c5fd;
          }
          
          .warehouse-icon {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: #6ee7b7;
          }
          
          .customers-icon {
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%);
            border: 1px solid rgba(245, 158, 11, 0.3);
            color: #fcd34d;
          }
          
          .tile-title {
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            color: #f3f4f6;
            letter-spacing: 0.3px;
            text-transform: uppercase;
          }
          
          .tile-content {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          
          .stat-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 10px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.03);
          }
          
          .stat-label {
            font-size: 11px;
            color: #9ca3af;
            font-weight: 500;
          }
          
          .stat-value {
            font-size: 13px;
            font-weight: 600;
            color: #e5e7eb;
            font-variant-numeric: tabular-nums;
          }
        `}
      </style>
    </div>
  );
}
