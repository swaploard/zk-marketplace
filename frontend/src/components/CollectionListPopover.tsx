import { useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function CollectionListPopover({
  PopoverTriggerElement,
  collections,
  setValue,
}) {
  const [open, setOpen] = useState(false);

  const handleCollectionClick = (collectionId) => {
    setValue("collection", collectionId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{PopoverTriggerElement}</PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-full bg-zinc-900 border-zinc-800 text-white p-0 max-h-96 overflow-y-auto">
        <Link
          href="create/collection"
          className="flex items-center gap-2 py-3 px-3 hover:bg-zinc-950"
          onClick={() => setOpen(false)}
        >
          <div className="h-7 w-7 bg-zinc-800 flex items-center justify-center">
            <Plus className="h-4 w-4" />
          </div>
          <span>Create a new collection</span>
        </Link>
        {collections?.map((collection) => (
          <div
            key={collection._id}
            className="flex items-center gap-4 hover:bg-zinc-950 min-w-full py-3 px-3 cursor-pointer"
            onClick={() => handleCollectionClick(collection.groupId)}
          >
            <div className="h-14 w-14 flex items-center justify-center">
              <Image src={collection.logoUrl} alt="" className="rounded-xl" />
            </div>
            <span>{collection.contractName}</span>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}
