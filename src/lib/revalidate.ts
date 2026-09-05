import { revalidatePath } from "next/cache";

export function revalidateStudioData() {
  revalidatePath("/", "layout");
  revalidatePath("/studio");
  revalidatePath("/journal");
  revalidatePath("/credits");
}
