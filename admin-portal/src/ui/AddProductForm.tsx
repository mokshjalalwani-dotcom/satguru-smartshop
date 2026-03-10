import React, { useState } from "react";
import Input from "./Input";
import Button from "./Button";

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
    if (!form.name.trim()) newErrors.name = "Product name is required.";
    if (!form.price.trim()) newErrors.price = "Price is required.";
    else if (isNaN(Number(form.price)) || Number(form.price) <= 0)
      newErrors.price = "Enter a valid positive price.";
    if (!form.category.trim()) newErrors.category = "Category is required.";
    if (!form.description.trim()) newErrors.description = "Description is required.";
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Product Name"
        value={form.name}
        onChange={set("name")}
        placeholder="e.g. Wireless Headphones"
        error={errors.name}
      />
      <Input
        label="Price (₹)"
        value={form.price}
        onChange={set("price")}
        type="number"
        placeholder="e.g. 2999"
        error={errors.price}
      />
      <Input
        label="Category"
        value={form.category}
        onChange={set("category")}
        placeholder="e.g. Electronics"
        error={errors.category}
      />
      <Input
        label="Description"
        value={form.description}
        onChange={set("description")}
        placeholder="Short product description..."
        multiline
        error={errors.description}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary">
          Add Product
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default AddProductForm;