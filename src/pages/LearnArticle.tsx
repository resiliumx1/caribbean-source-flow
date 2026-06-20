import { useParams, Link, Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { SEOHead } from "@/components/SEOHead";
import { useArticle } from "@/hooks/use-articles";
import { StoreFooter } from "@/components/store/StoreFooter";
import { Skeleton } from "@/components/ui/skeleton";

export default function LearnArticle() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useArticle(slug);

  if (isLoading) {
    return (
      <main className="min-h-screen container mx-auto px-4 pt-24 pb-12 max-w-3xl">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/3 mb-8" />
        <Skeleton className="h-64 w-full" />
      </main>
    );
  }

  if (!article) {
    return <Navigate to="/learn" replace />;
  }

  const canonical = `https://mountkailashslu.com/learn/${article.slug}`;
  const publishedISO = article.published_date
    ? new Date(article.published_date).toISOString()
    : undefined;
  const updatedISO = article.updated_date
    ? new Date(article.updated_date).toISOString()
    : publishedISO;

  const articleSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.meta_description || article.excerpt || undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    url: canonical,
    ...(article.cover_image ? { image: article.cover_image } : {}),
    ...(publishedISO ? { datePublished: publishedISO } : {}),
    ...(updatedISO ? { dateModified: updatedISO } : {}),
    author: { "@type": "Person", name: article.author },
    publisher: {
      "@type": "Organization",
      name: "Mount Kailash Rejuvenation Centre",
      url: "https://mountkailashslu.com",
      logo: {
        "@type": "ImageObject",
        url: "https://mountkailashslu.com/star-seal.png",
      },
    },
  };

  const seoTitle = `${article.title} | Mount Kailash Learn`.slice(0, 70);
  const seoDesc =
    article.meta_description ||
    article.excerpt ||
    `${article.title} — an article from Mount Kailash on Caribbean bush medicine and traditional wellness.`;

  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        title={seoTitle}
        description={seoDesc.slice(0, 158)}
        path={`/learn/${article.slug}`}
        ogImage={article.cover_image || undefined}
        breadcrumbs={[
          { name: "Learn", path: "/learn" },
          { name: article.title, path: `/learn/${article.slug}` },
        ]}
        schema={articleSchema}
      />
      <article className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        <nav className="mb-6 text-sm">
          <Link
            to="/learn"
            className="hover:underline"
            style={{ color: "var(--site-text-muted, #555)", fontFamily: "'DM Sans', sans-serif" }}
          >
            ← All articles
          </Link>
        </nav>

        <header className="mb-8">
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 4.5vw, 3rem)",
              fontWeight: 500,
              lineHeight: 1.15,
              color: "var(--site-text-primary, #1b1b1b)",
              marginBottom: "1rem",
            }}
          >
            {article.title}
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.9rem",
              color: "var(--site-text-muted, #666)",
            }}
          >
            <span>By {article.author}</span>
            {article.published_date && (
              <>
                {" · "}
                <span>
                  Published{" "}
                  <time dateTime={article.published_date}>
                    {new Date(article.published_date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </span>
              </>
            )}
            {article.updated_date &&
              article.updated_date !== article.published_date && (
                <>
                  {" · "}
                  <span>
                    Updated{" "}
                    <time dateTime={article.updated_date}>
                      {new Date(article.updated_date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </span>
                </>
              )}
          </p>
        </header>

        {article.cover_image && (
          <img
            src={article.cover_image}
            alt=""
            className="w-full rounded-lg mb-8"
            style={{ maxHeight: "440px", objectFit: "cover" }}
          />
        )}

        <div
          className="article-body prose prose-neutral max-w-none"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "1.05rem",
            lineHeight: 1.7,
            color: "var(--site-text-primary, #1b1b1b)",
          }}
        >
          <ReactMarkdown>{article.body_markdown || ""}</ReactMarkdown>
        </div>
      </article>
      <StoreFooter />
    </main>
  );
}