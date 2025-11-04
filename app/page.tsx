"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

interface Link {
  id: number;
  url: string;
  title: string;
  description?: string;
}

interface LinkWithDuplicate extends Link {
  isDuplicate: boolean;
  duplicateInfo?: {
    page: number;
    position: number;
    originalId: number;
  };
}

const LINKS_PER_PAGE = 30;

export default function Home() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/sheets", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch links");
      }
      const data = await response.json();
      setLinks(data.links || []);
      setError(null);
      // Reset to page 1 when refreshing
      setCurrentPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load links");
    } finally {
      setLoading(false);
    }
  };

  // Detect duplicates and add metadata
  const { linksWithDuplicates, duplicatesList } = useMemo(() => {
    const urlMap = new Map<string, { id: number; firstOccurrence: number; link: Link }>();
    const processedLinks: LinkWithDuplicate[] = [];
    const duplicatesMap = new Map<string, {
      original: { page: number; position: number; id: number; title: string; url: string };
      duplicates: Array<{ page: number; position: number; id: number }>;
    }>();

    links.forEach((link, index) => {
      const normalizedUrl = link.url.toLowerCase().trim();
      const existing = urlMap.get(normalizedUrl);

      if (existing) {
        // This is a duplicate
        const originalPage = Math.ceil((existing.firstOccurrence + 1) / LINKS_PER_PAGE);
        const originalPosition = (existing.firstOccurrence % LINKS_PER_PAGE) + 1;
        const duplicatePage = Math.ceil((index + 1) / LINKS_PER_PAGE);
        const duplicatePosition = (index % LINKS_PER_PAGE) + 1;

        processedLinks.push({
          ...link,
          isDuplicate: true,
          duplicateInfo: {
            page: originalPage,
            position: originalPosition,
            originalId: existing.id,
          },
        });

        // Add to duplicates map
        if (!duplicatesMap.has(normalizedUrl)) {
          duplicatesMap.set(normalizedUrl, {
            original: {
              page: originalPage,
              position: originalPosition,
              id: existing.id,
              title: existing.link.title,
              url: existing.link.url,
            },
            duplicates: [],
          });
        }
        duplicatesMap.get(normalizedUrl)!.duplicates.push({
          page: duplicatePage,
          position: duplicatePosition,
          id: link.id,
        });
      } else {
        // First occurrence
        urlMap.set(normalizedUrl, {
          id: link.id,
          firstOccurrence: index,
          link: link,
        });
        processedLinks.push({
          ...link,
          isDuplicate: false,
        });
      }
    });

    const duplicatesList = Array.from(duplicatesMap.values());

    return { linksWithDuplicates: processedLinks, duplicatesList };
  }, [links]);

  const totalPages = Math.ceil(links.length / LINKS_PER_PAGE);
  const startIndex = (currentPage - 1) * LINKS_PER_PAGE;
  const endIndex = startIndex + LINKS_PER_PAGE;
  const currentLinks = linksWithDuplicates.slice(startIndex, endIndex);
  const totalLinks = links.length;
  const duplicateCount = linksWithDuplicates.filter((link) => link.isDuplicate).length;

  return (
    <div className="min-h-screen bg-background p-2 md:p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Link Tracker</h1>
            <p className="text-sm text-muted-foreground">
              Total: <span className="font-semibold">{totalLinks}</span> | 
              Page: <span className="font-semibold">{currentPage}</span>/{totalPages || 1} | 
              This page: <span className="font-semibold">{currentLinks.length}</span>
              {duplicateCount > 0 && (
                <> | Duplicates: <span className="font-semibold text-destructive">{duplicateCount}</span></>
              )}
            </p>
          </div>
          <Button
            onClick={fetchLinks}
            disabled={loading}
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading links...</p>
          </div>
        )}

        {error && (
          <Card className="mb-6 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        )}

        {!loading && !error && (
          <>
            {duplicatesList.length > 0 && (
              <Card className="mb-6 border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    Duplicate Links Found ({duplicatesList.length})
                  </CardTitle>
                  <CardDescription>
                    Below is a list of all duplicate links and their locations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {duplicatesList.map((duplicate, idx) => (
                      <div key={idx} className="border rounded-md p-4 bg-destructive/5">
                        <div className="mb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">Original:</span>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Page {duplicate.original.page}, Position {duplicate.original.position}
                            </Badge>
                          </div>
                          <a
                            href={duplicate.original.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium hover:underline break-all block mt-1"
                          >
                            {duplicate.original.title}
                          </a>
                          <span className="text-xs text-muted-foreground block mt-1 break-all">
                            {duplicate.original.url}
                          </span>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <span className="font-semibold text-sm text-destructive">Duplicates found at:</span>
                          <div className="mt-2 space-y-2">
                            {duplicate.duplicates.map((dup, dupIdx) => (
                              <div key={dupIdx} className="flex items-center gap-2">
                                <Badge variant="destructive" className="text-xs">
                                  Page {dup.page}, Position {dup.position}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  (Link #{((dup.page - 1) * LINKS_PER_PAGE) + dup.position})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="border rounded-lg divide-y">
              {currentLinks.map((link, index) => {
                const globalIndex = startIndex + index;
                const positionNumber = globalIndex + 1;
                
                return (
                  <div
                    key={link.id}
                    className="px-2 py-1 hover:bg-accent/50 transition-colors flex items-center gap-2"
                  >
                    <span className="text-xs font-mono text-muted-foreground shrink-0 w-8">
                      {positionNumber}
                    </span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline break-all flex-1"
                    >
                      {link.url}
                    </a>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
