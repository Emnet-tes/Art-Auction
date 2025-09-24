import { Header } from "@/components/header"
import { ArtworkGallery } from "@/components/artwork-gallery"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance mb-6">
            Discover Exceptional
            <span className="block text-primary">Artworks</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty mb-8">
            Bid on curated collections from renowned artists worldwide. Experience the thrill of live auctions from the
            comfort of your home.
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="container mx-auto">
          <ArtworkGallery />
        </div>
      </section>
    </div>
  )
}
