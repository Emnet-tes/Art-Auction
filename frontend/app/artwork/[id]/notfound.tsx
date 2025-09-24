import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@mui/material";
import { Header } from "@/components/header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-8">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-serif text-3xl font-bold mb-2">
              Artwork Not Found
            </h1>
            <p className="text-muted-foreground">
              The artwork you're looking for doesn't exist or may have been
              removed from the auction.
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/">
              <Button fullWidth>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Gallery
              </Button>
            </Link>

            <p className="text-sm text-muted-foreground">
              Browse our current auctions to discover other exceptional
              artworks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
