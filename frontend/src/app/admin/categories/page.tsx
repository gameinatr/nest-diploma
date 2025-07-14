"use client";

import { useState, useEffect, Fragment } from "react";
import AdminGuard from "@/components/AdminGuard";
import { apiClient, Category } from "@/lib/api";
import Link from "next/link";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const categoriesRes = await apiClient.getCategories();
      setCategories(categoriesRes);
    } catch (err) {
      setError("Failed to load categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to organize categories into hierarchy
  const organizeCategories = (categories: Category[]) => {
    const categoryMap = new Map<number, Category & { children: Category[] }>();
    const rootCategories: (Category & { children: Category[] })[] = [];

    // Initialize all categories with children array
    categories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Build hierarchy
    categories.forEach((category) => {
      const categoryNode = categoryMap.get(category.id)!;
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(categoryNode);
        }
      } else {
        rootCategories.push(categoryNode);
      }
    });

    return rootCategories;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        description: formData.description || undefined,
        parentId: formData.parentId ? parseInt(formData.parentId) : undefined,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
      };

      if (editingCategory) {
        await apiClient.adminUpdateCategory(editingCategory.id, data);
      } else {
        await apiClient.adminCreateCategory(data);
      }

      setShowForm(false);
      setEditingCategory(null);
      resetForm();
      loadData();
    } catch (err) {
      setError("Failed to save category");
      console.error(err);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      parentId: category.parentId ? category.parentId.toString() : "",
      isActive: category.isActive ?? true,
      sortOrder: category.sortOrder ?? 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const hasChildren = categories.some((c) => c.parentId === id);

    let confirmMessage = "Are you sure you want to delete this category?";
    if (hasChildren) {
      confirmMessage += " This will also delete all subcategories.";
    }
    confirmMessage += " This action cannot be undone.";

    if (confirm(confirmMessage)) {
      try {
        await apiClient.adminDeleteCategory(id);
        loadData();
      } catch (err) {
        setError("Failed to delete category");
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      parentId: "",
      isActive: true,
      sortOrder: 0,
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    resetForm();
  };

  const handleAddSubcategory = (parentId: number) => {
    setFormData({
      name: "",
      description: "",
      parentId: parentId.toString(),
      isActive: true,
      sortOrder: 0,
    });
    setShowForm(true);
  };

  // Get available parent categories (exclude the category being edited and its descendants)
  const getAvailableParentCategories = () => {
    if (!editingCategory) return categories.filter((c) => !c.parentId);

    const getDescendantIds = (categoryId: number): number[] => {
      const descendants: number[] = [];
      const children = categories.filter((c) => c.parentId === categoryId);
      children.forEach((child) => {
        descendants.push(child.id);
        descendants.push(...getDescendantIds(child.id));
      });
      return descendants;
    };

    const excludeIds = [
      editingCategory.id,
      ...getDescendantIds(editingCategory.id),
    ];
    return categories.filter((c) => !excludeIds.includes(c.id));
  };

  const renderCategoryRow = (
    category: Category & { children: Category[] },
    level = 0
  ) => {
    const indent = level * 20;

    return (
      <Fragment key={category.id}>
        <tr className={level > 0 ? "bg-gray-50" : ""}>
          <td className="px-6 py-4 whitespace-nowrap">
            <div
              className="flex items-center"
              style={{ paddingLeft: `${indent}px` }}
            >
              {level > 0 && <span className="text-gray-400 mr-2">{"└─ "}</span>}
              <div className="text-sm font-medium text-gray-900">
                {category.name}
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">
              {category.description || "N/A"}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                category.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {category.isActive ? "Active" : "Inactive"}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {category.sortOrder}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {category.children.length}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <button
              onClick={() => handleEdit(category)}
              className="text-blue-600 hover:text-blue-900 mr-3"
            >
              Edit
            </button>
            {!category.parentId && (
              <button
                onClick={() => handleAddSubcategory(category.id)}
                className="text-green-600 hover:text-green-900 mr-3"
              >
                Add Sub
              </button>
            )}
            <button
              onClick={() => handleDelete(category.id)}
              className="text-red-600 hover:text-red-900"
            >
              Delete
            </button>
          </td>
        </tr>
        {category.children.map((child) => renderCategoryRow(child, level + 1))}
      </Fragment>
    );
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
      </AdminGuard>
    );
  }

  const organizedCategories = organizeCategories(categories);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Categories Management
                </h1>
                <Link
                  href="/admin"
                  className="text-blue-600 hover:text-blue-800"
                >
                  ← Back to Dashboard
                </Link>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
              >
                Add Category
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Category Form */}
            {showForm && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h2>
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Category
                    </label>
                    <select
                      value={formData.parentId}
                      onChange={(e) =>
                        setFormData({ ...formData, parentId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">None (Root Category)</option>
                      {getAvailableParentCategories().map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.sortOrder}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sortOrder: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isActive"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Active
                    </label>
                  </div>

                  <div className="lg:col-span-3 flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                    >
                      {editingCategory ? "Update" : "Create"} Category
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Categories Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Categories & Subcategories
                </h3>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sort Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subcategories
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {organizedCategories.map((category) =>
                    renderCategoryRow(category)
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
