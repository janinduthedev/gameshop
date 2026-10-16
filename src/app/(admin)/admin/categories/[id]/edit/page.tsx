import { notFound } from "next/navigation";
import Link from "next/link";
import { CategoryForm } from "@/components/admin/category-form";
import { updateCategoryAction } from "@/actions/category";
import { getCategoryById } from "@/lib/queries";

export const metadata = { title: "Edit category" };

type EditCategoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = await params;
  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/categories"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to categories
      </Link>
      <h1 className="mt-4 mb-6 text-2xl font-bold">Edit category</h1>

      <div className="max-w-2xl">
        <CategoryForm
          action={updateCategoryAction.bind(null, id)}
          initial={{
            name: category.name,
            description: category.description,
            image: category.image
              ? { url: category.image, publicId: category.imagePublicId }
              : null,
          }}
        />
      </div>
    </div>
  );
}
