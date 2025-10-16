import { X, Package, Mail, Check, Copy } from "lucide-react";
import type { PurchaseOrder, Email } from "../types";
import { useState } from "react";

type Props = {
  po: PurchaseOrder;
  email: Email;
  onClose: () => void;
};

export default function BuyerAgentModal({ po, email, onClose }: Props) {
  console.log("🎉 BuyerAgentModal rendered!", { po, email });
  const [copiedPO, setCopiedPO] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const copyPO = () => {
    const poText = `Purchase Order: ${po.po_number}
Item: ${po.sku} - ${po.item_name}
Quantity: ${po.qty} units
Supplier: ${po.supplier.name}
Unit Price: $${po.unit_price.toFixed(2)}
Total: $${po.total_price.toFixed(2)}
Delivery Date: ${po.delivery_date}
Payment Terms: ${po.payment_terms}`;
    
    navigator.clipboard.writeText(poText);
    setCopiedPO(true);
    setTimeout(() => setCopiedPO(false), 2000);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(email.body);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-4 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border-b border-neutral-700 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                  🤖
                </div>
                Buyer Agent Result
              </h2>
              <p className="text-sm text-cyan-200 mt-1">Purchase Order Created & Email Generated</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6 space-y-6">
          {/* Purchase Order Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Package size={18} className="text-emerald-400" />
                Purchase Order
              </h3>
              <button
                onClick={copyPO}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 transition-colors"
              >
                {copiedPO ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy PO
                  </>
                )}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-neutral-700">
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1">PO Number</div>
                  <div className="text-lg font-bold font-mono text-emerald-300">{po.po_number}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Item</div>
                  <div className="text-sm font-semibold text-white">{po.item_name}</div>
                  <div className="text-xs font-mono text-blue-300">{po.sku}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Quantity</div>
                  <div className="text-base font-bold text-white">{po.qty} units</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Supplier</div>
                  <div className="text-sm font-semibold text-white">{po.supplier.name}</div>
                  <div className="text-xs text-neutral-400 mt-1">
                    ⭐ Rating: {po.supplier.rating}/5 • Lead Time: {po.supplier.lead_time_days} days
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Unit Price</div>
                    <div className="text-base font-semibold text-white">${po.unit_price.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Total</div>
                    <div className="text-lg font-bold text-emerald-300">${po.total_price.toFixed(2)}</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Delivery Date</div>
                  <div className="text-sm font-semibold text-white">{po.delivery_date}</div>
                </div>
              </div>
              
              <div className="col-span-2 pt-3 border-t border-neutral-700">
                <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Payment Terms</div>
                <div className="text-sm text-white">{po.payment_terms}</div>
              </div>
              
              <div className="col-span-2">
                <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Notes</div>
                <div className="text-xs text-neutral-300 bg-neutral-900/40 rounded p-2">{po.notes}</div>
              </div>
            </div>
          </div>

          {/* Email Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail size={18} className="text-blue-400" />
                Email to Supplier
              </h3>
              <button
                onClick={copyEmail}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 transition-colors"
              >
                {copiedEmail ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy Email
                  </>
                )}
              </button>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-neutral-700 space-y-3">
              <div>
                <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1">To</div>
                <div className="text-sm font-mono text-blue-300">{email.to}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Subject</div>
                <div className="text-sm font-semibold text-white">{email.subject}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Message Body</div>
                <pre className="text-xs text-neutral-200 bg-neutral-950 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap font-mono border border-neutral-800 leading-relaxed">
{email.body}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-6 py-4 bg-gradient-to-r from-neutral-900 to-neutral-950 border-t border-neutral-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 font-medium text-white shadow-lg shadow-emerald-500/20 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

