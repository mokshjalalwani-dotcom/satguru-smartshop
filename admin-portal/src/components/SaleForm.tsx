import React, { useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import type { NewSale } from "../services/api";
import Input from "../ui/Input";
import Button from "../ui/Button";

interface Product {
  product_id: string;
  name: string;
  price: number;
}

interface Props {
  selectedProduct: Product | null;
}

const SaleForm: React.FC<Props> = ({ selectedProduct }) => {
  const [customerName, setCustomerName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [invoiceUrl, setInvoiceUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSale = async () => {
    if (!selectedProduct) {
      alert("Please select a product first!");
      return;
    }

    if (!customerName.trim()) {
      alert("Please provide a customer name!");
      return;
    }

    const saleData: NewSale = {
      customer: customerName.trim(),
      amount: selectedProduct.price * quantity,
      products: [selectedProduct.product_id],
    };

    try {
      setLoading(true);
      const result = await api.createSale(saleData);
      setInvoiceUrl(result.invoiceUrl);
      alert("Sale successful!");
    } catch (err) {
      console.error("Sale error:", err);
      alert("Failed to complete sale.");
    } finally {
      setLoading(false);
    }
  };

  const total = selectedProduct ? selectedProduct.price * quantity : 0;

  return (
    <div className="space-y-4">
      {/* Selected Product Display */}
      <div className="bg-xdark border border-xdark-border rounded-xl p-4">
        <p className="text-[13px] text-xtext-secondary mb-2">Selected Product</p>
        {selectedProduct ? (
          <div className="flex items-center justify-between">
            <span className="text-xtext font-bold text-[14px]">{selectedProduct.name}</span>
            <span className="text-xblue text-[14px] font-bold">
              ₹{selectedProduct.price.toLocaleString("en-IN")}
            </span>
          </div>
        ) : (
          <p className="text-xtext-tertiary text-[14px]">No product selected — pick one from the left</p>
        )}
      </div>

      {/* Customer Name Input */}
      <Input
        label="Customer Name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        placeholder="e.g. Rahul Sharma"
      />

      {/* Quantity Input */}
      <Input
        label="Quantity"
        value={String(quantity)}
        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
        type="number"
        placeholder="1"
      />

      {/* Order Summary */}
      {selectedProduct && (
        <div className="border-t border-xdark-border pt-3 space-y-2">
          <div className="flex justify-between text-[14px]">
            <span className="text-xtext-secondary">{selectedProduct.name} × {quantity}</span>
            <span className="text-xtext font-bold">₹{total.toLocaleString("en-IN")}</span>
          </div>
        </div>
      )}

      {/* Submit */}
      <Button onClick={handleSale} disabled={loading || !selectedProduct}>
        {loading ? "Processing..." : `Complete Sale — ₹${total.toLocaleString("en-IN")}`}
      </Button>

      {/* Invoice URL */}
      {invoiceUrl && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-xdark border border-xdark-border rounded-xl p-4"
        >
          <p className="text-[13px] text-xgreen font-bold mb-1">✅ Invoice Generated</p>
          <a
            href={invoiceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xblue text-[14px] break-all hover:underline transition"
          >
            {invoiceUrl}
          </a>
        </motion.div>
      )}
    </div>
  );
};

export default SaleForm;
