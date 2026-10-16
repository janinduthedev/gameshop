import Link from "next/link";
import Image from "next/image";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActionButton } from "@/components/admin/action-button";
import { deleteProductAction } from "@/actions/product";
import { getAllProducts } from "@/lib/queries";
import { LOW_STOCK_THRESHOLD } from "@/constants";
import { cn, formatCurrency } from "@/lib/utils";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            {products.length} product(s) in your store.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New product
          </Button>
        </Link>
      </div>

      <div className="mt-6 rounded-lg border bg-card">
        {products.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            No products yet. Create your first product.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                        {product.images[0]?.url ? (
                          <Image
                            src={product.images[0].url}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{product.category?.name ?? "—"}</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-medium",
                          product.stock <= 0
                            ? "text-destructive"
                            : product.stock <= LOW_STOCK_THRESHOLD &&
                                "text-amber-600",
                        )}
                      >
                        {product.stock}
                      </span>
                      {product.stock <= 0 ? (
                        <Badge variant="destructive">Out of stock</Badge>
                      ) : product.stock <= LOW_STOCK_THRESHOLD ? (
                        <Badge className="bg-amber-500 text-white">
                          Low stock
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.featured ? (
                      <Badge>Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <ActionButton
                        action={deleteProductAction.bind(null, product.id)}
                        confirmMessage={`Delete "${product.name}"? This cannot be undone.`}
                        successMessage="Product deleted"
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
