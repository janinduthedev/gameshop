import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActionButton } from "@/components/admin/action-button";
import { CategoryForm } from "@/components/admin/category-form";
import { createCategoryAction, deleteCategoryAction } from "@/actions/category";
import { getCategories } from "@/lib/queries";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="text-2xl font-bold">Categories</h1>
      <p className="text-muted-foreground">Organise your products.</p>

      <div className="mt-6">
        <CategoryForm action={createCategoryAction} />
      </div>

      <div className="mt-6 rounded-lg border bg-card">
        {categories.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No categories yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {category.slug}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {category.description || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/categories/${category.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <ActionButton
                        action={deleteCategoryAction.bind(null, category.id)}
                        confirmMessage={`Delete category "${category.name}"?`}
                        successMessage="Category deleted"
                        className="flex h-10 w-10 items-center justify-center rounded-md text-destructive transition-colors hover:bg-accent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </ActionButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
