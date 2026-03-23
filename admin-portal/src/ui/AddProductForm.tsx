import React, { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import { ShieldPlus, Zap } from "lucide-react";

interface ProductFormData {
  name: string;
  price: string;
  category: string;
  description: string;
}

interface AddProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  onCancel?: () => void;
}

type Errors = Partial<Record<keyof ProductFormData, string>>;

const AddProductForm: React.FC<AddProductFormProps> = ({ onSubmit, onCancel }) => {
  const [form, setForm] = useState<ProductFormData>({
    name: "",
    price: "",
    category: "",
    description: "",
  });

  const [errors, setErrors] = useState<Errors>({});

  const set = (field: keyof ProductFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = (): boolean => {
    const newErrors: Errors = {};
    if (!form.name.trim()) newErrors.name = "Entity identifier is required.";
    if (!form.price.trim()) newErrors.price = "Valuation is required.";
    else if (isNaN(Number(form.price)) || Number(form.price) <= 0)
      newErrors.price = "Enter a valid positive valuation.";
    if (!form.category.trim()) newErrors.category = "Classification is required.";
    if (!form.description.trim()) newErrors.description = "Operational details required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
      setForm({ name: "", price: "", category: "", description: "" });
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <div className="bg-black/20 border border-white/5 rounded-3xl p-6 mb-2">
         <div className="flex items-center gap-3 mb-6">
            <Zap size={14} className="text-accent" />
            <span className="text-[10px] font-black text-muted/40 uppercase tracking-widest">Initialization Parameters</span>
         </div>
          <div className="space-y-4">
            <Input
              label="Entity Identifier"
              value={form.name}
              onChange={set("name")}
              placeholder="ENTER PRODUCT NAME..."
              error={errors.name}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Valuation (₹)"
                value={form.price}
                onChange={set("price")}
                type="number"
                placeholder="0.00"
                error={errors.price}
              />
              <Input
                label="Classification"
                value={form.category}
                onChange={set("category")}
                placeholder="E.G. ELECTRONICS"
                error={errors.category}
              />
            </div>
            <Input
              label="Operational Description"
              value={form.description}
              onChange={set("description")}
              placeholder="SPECIFY ASSET CAPABILITIES..."
              multiline
              error={errors.description}
            />
          </div>
       </div>

      <div className="flex gap-4 pt-4 border-t border-white/5">
        <Button type="submit" variant="primary">
          <ShieldPlus size={18} className="mr-2" />
          Authorize Integration
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Abort Protocol
          </Button>
        )}
      </div>
    </form>
  );
};

export default AddProductForm;