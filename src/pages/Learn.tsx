import { Link, useSearchParams } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { useArticles } from "@/hooks/use-articles";
import { StoreFooter } from "@/components/store/StoreFooter";

export default function Learn() {
  const { data: allArticles = [], isLoading } = useArticles();
  const [searchParams] = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const articles = q
    ? allArticles.filter((a) =>
        [a.title, a.excerpt, a.body_markdown]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(q)),
      )
    : allArticles;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Mount Kailash Learn",
    url: "https://mountkailashslu.com/learn",
    description:
      "Articles on Caribbean clinical wellness medicine, herbal formulations and traditional wellness practice from Mount Kailash Rejuvenation Centre.",
    publisher: {
      "@type": "Organization",
      name: "Mount Kailash Rejuvenation Centre",
      url: "https://mountkailashslu.com",
    },
    blogPost: articles.map((a) => ({
      "@type": "BlogPosting",
      headline: a.title,
      url: `https://mountkailashslu.com/learn/${a.slug}`,
      datePublished: a.published_date || undefined,
      author: { "@type": "Person", name: a.author },
    })),
  };

  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        title="Learn — Articles on Caribbean Wellness Medicine | Mount Kailash"
        description="Plain-language articles on Caribbean clinical wellness medicine, herbal formulations, and traditional wellness practice from Mount Kailash Rejuvenation Centre."
        path="/learn"
        breadcrumbs={[{ name: "Learn", path: "/learn" }]}
        schema={collectionSchema}
      />
      <section className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <header className="mb-12 text-center">
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              fontWeight: 500,
              color: "var(--site-text-primary, #1b1b1b)",
              marginBottom: "0.75rem",
            }}
          >
            Learn
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "1rem",
              color: "var(--site-text-muted, #555)",
              maxWidth: "640px",
              margin: "0 auto",
            }}
          >
            Plain-language articles on Caribbean clinical wellness medicine, herbal formulations
            and traditional wellness practice, from the team at Mount Kailash.
          </p>
        </header>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-12">Loading articles…</p>
        ) : articles.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            {q ? `No articles matched “${searchParams.get("q")}”.` : "No articles published yet. Check back soon."}
          </p>
        ) : (
          <ul className="grid gap-8">
            {articles.map((article) => (
              <li
                key={article.id}
                className="border-b pb-8 last:border-b-0"
                style={{ borderColor: "var(--site-card-hover-border, rgba(0,0,0,0.08))" }}
              >
                <article>
                  <Link to={`/learn/${article.slug}`} className="block group">
                    {article.cover_image && (
                      <img
                        src={article.cover_image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="w-full rounded-lg mb-4"
                        style={{ maxHeight: "320px", objectFit: "cover" }}
                      />
                    )}
                    <h2
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "clamp(1.4rem, 2.5vw, 1.85rem)",
                        fontWeight: 500,
                        color: "var(--site-text-primary, #1b1b1b)",
                        marginBottom: "0.5rem",
                      }}
                      className="group-hover:underline"
                    >
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "0.97rem",
                          color: "var(--site-text-muted, #555)",
                          lineHeight: 1.55,
                          marginBottom: "0.75rem",
                        }}
                      >
                        {article.excerpt}
                      </p>
                    )}
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.82rem",
                        color: "var(--site-text-muted, #777)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {article.author}
                      {article.published_date && (
                        <>
                          {" · "}
                          <time dateTime={article.published_date}>
                            {new Date(article.published_date).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </time>
                        </>
                      )}
                    </p>
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
      <StoreFooter />
    </main>
  );
}