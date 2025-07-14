"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/AdminGuard";
import { apiClient, Category, Subcategory } from "@/lib/api";
import Link from "next/link";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] =
    useState<Subcategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
  });
  const [subcategoryFormData, setSubcategoryFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesRes] = await Promise.all([apiClient.getCategories()]);
      setCategories(categoriesRes);
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: categoryFormData.name,
        description: categoryFormData.description || undefined,
      };

      if (editingCategory) {
        await apiClient.adminUpdateCategory(editingCategory.id, data);
      } else {
        await apiClient.adminCreateCategory(data);
      }

      setShowCategoryForm(false);
      setEditingCategory(null);
      resetCategoryForm();
      loadData();
    } catch (err) {
      setError("Failed to save category");
      console.error(err);
    }
  };

  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: subcategoryFormData.name,
        description: subcategoryFormData.description || undefined,
        categoryId: parseInt(subcategoryFormData.categoryId),
      };

      if (editingSubcategory) {
        await apiClient.adminUpdateSubcategory(editingSubcategory.id, data);
      } else {
        await apiClient.adminCreateSubcategory(data);
      }

      setShowSubcategoryForm(false);
      setEditingSubcategory(null);
      resetSubcategoryForm();
      loadData();
    } catch (err) {
      setError("Failed to save subcategory");
      console.error(err);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || "",
    });
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id: number) => {
    if (
      confirm(
        "Are you sure you want to delete this category? This will also delete all associated subcategories and products."
      )
    ) {
      try {
        await apiClient.adminDeleteCategory(id);
        loadData();
      } catch (err) {
        setError("Failed to delete category");
        console.error(err);
      }
    }
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: "",
      description: "",
    });
  };

  const resetSubcategoryForm = () => {
    setSubcategoryFormData({
      name: "",
      description: "",
      categoryId: "",
    });
  };

  const handleCancelCategory = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    resetCategoryForm();
  };

  const handleCancelSubcategory = () => {
    setShowSubcategoryForm(false);
    setEditingSubcategory(null);
    resetSubcategoryForm();
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
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCategoryForm(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                >
                  Add Category
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Category Form */}
            {showCategoryForm && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h2>
                <form
                  onSubmit={handleCategorySubmit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={categoryFormData.name}
                      onChange={(e) =>
                        setCategoryFormData({
                          ...categoryFormData,
                          name: e.target.value,
                        })
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
                      value={categoryFormData.description}
                      onChange={(e) =>
                        setCategoryFormData({
                          ...categoryFormData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="md:col-span-2 flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                    >
                      {editingCategory ? "Update" : "Create"} Category
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelCategory}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Subcategory Form */}
            {showSubcategoryForm && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">
                  {editingSubcategory
                    ? "Edit Subcategory"
                    : "Add New Subcategory"}
                </h2>
                <form
                  onSubmit={handleSubcategorySubmit}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={subcategoryFormData.name}
                      onChange={(e) =>
                        setSubcategoryFormData({
                          ...subcategoryFormData,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={subcategoryFormData.categoryId}
                      onChange={(e) =>
                        setSubcategoryFormData({
                          ...subcategoryFormData,
                          categoryId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={subcategoryFormData.description}
                      onChange={(e) =>
                        setSubcategoryFormData({
                          ...subcategoryFormData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-3 flex gap-2">
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                      {editingSubcategory ? "Update" : "Create"} Subcategory
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelSubcategory}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Categories Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Categories
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
                      Subcategories
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {category.description || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
