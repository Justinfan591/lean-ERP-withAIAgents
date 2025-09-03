// src/components/GameBoard.tsx
import React from "react";

export default function GameBoard() {
  return (
    <div className="board">
      {/* Suppliers tile */}
      <div className="tile suppliers">
        {/* Invisible, full-tile overlay so the anchor = tile center */}
        <div data-flow-anchor="SUP" className="flow-anchor-cover" />
        <h3 className="tile-title">Suppliers</h3>
        {/* ...rest of your suppliers content... */}
      </div>

      {/* Warehouse tile */}
      <div className="tile warehouse">
        <div data-flow-anchor="WH" className="flow-anchor-cover" />
        <h3 className="tile-title">Warehouse</h3>
        {/* ...rest of your warehouse content... */}
      </div>

      {/* Customers tile */}
      <div className="tile customers">
        <div data-flow-anchor="CUST" className="flow-anchor-cover" />
        <h3 className="tile-title">Customers</h3>
        {/* ...rest of your customers content... */}
      </div>

      <style>
        {`
          .board {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
          }
          .tile {
            position: relative;         /* important so anchors position inside */
            border-radius: 12px;
            padding: 12px;
            background: #111318;
            border: 1px solid #24262b;
            min-height: 140px;
          }
          /* The anchor cover spans the whole tile; App.tsx measures its center */
          .flow-anchor-cover {
            position: absolute;
            inset: 0;
            pointer-events: none;
          }
          .tile-title {
            margin: 0 0 8px 0;
            font-size: 14px;
            color: #e5e7eb;
            letter-spacing: .3px;
            text-transform: uppercase;
          }
        `}
      </style>
    </div>
  );
}
