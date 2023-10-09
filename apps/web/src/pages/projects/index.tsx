import useSWR from "swr";
import { PageLayout } from "@/components/ui/page-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import React from "react";
import { ListHeading, Paragraph } from "@/components/ui/typography";
import usePagination from "@/hooks/pagination";
import { cn } from "@/lib/utils";

export default function Projects() {
  const { data, isLoading } = useSWR("/api/openstad/api/project?includeConfig=1");

  if (!data) return null;

  const {
    page,
    next,
    previous,
    goToPage,
    hasNext,
    hasPrevious,
    pages,
    goToFirst,
    goToLast,
  } = usePagination();

  const meta = {
    total: 3,
    size: 4,
    page: 2,
    results: 3,
  };

  return (
    <div>
          <PageLayout
          pageHeader="Projects"
          breadcrumbs={[
            {
              name: 'Projects',
              url: '/projects',
            },
          ]}
          action={
            <Link href="/projects/create">
              <Button variant="default">
                <Plus size="20" />
                Project toevoegen
              </Button>
            </Link>
          }
          >
            <div className="container mx-auto py-10">
              <div className="mt-4 grid grid-cols-2 md:grid-cols-12 items-center py-2 px-2 border-b border-border overflow-x-scroll">
                <ListHeading className="hidden md:flex">
                  Projectnaam
                </ListHeading>
                <ListHeading className="hidden md:flex">
                  Data
                </ListHeading>
                <ListHeading className="hidden md:flex">
                  Issues
                </ListHeading>
                <ListHeading className="hidden md:flex">
                  Status
                </ListHeading>
                <ListHeading className="hidden md:flex">
                  Reacties
                </ListHeading>
                <ListHeading className="hidden md:flex">
                  Likes
                </ListHeading>
                <ListHeading className="hidden md:flex">
                  Indiener
                </ListHeading>
                <ListHeading className="hidden md:flex">
                  Resources
                </ListHeading>
                <ListHeading className="hidden md:flex">
                  Stemmen
                </ListHeading>
                <ListHeading className="hidden md:flex">
                  Einddatum
                </ListHeading>
              </div>
              <ul>
                {data.map((project: any) => {
                  return (
                    <li className='grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 h-16 hover:bg-secondary-background hover:cursor-pointer border-b border-border gap-2'>
                      <Paragraph className='hidden md:flex'>
                        {project.name}
                      </Paragraph>
                      <Paragraph className='hidden md:flex'>
                        Data
                      </Paragraph>
                      <Paragraph className='hidden md:flex'>
                        Issues
                      </Paragraph>
                      <Paragraph className='hidden md:flex'>
                        Status
                      </Paragraph>
                      <Paragraph className='hidden md:flex'>
                        Reacties
                      </Paragraph>
                      <Paragraph className='hidden md:flex'>
                        Likes
                      </Paragraph>
                      <Paragraph className='hidden md:flex'>
                        Indiener
                      </Paragraph>
                      <Paragraph className='hidden md:flex'>
                        Resources
                      </Paragraph>
                      <Paragraph className='hidden md:flex'>
                        Stemmen
                      </Paragraph>
                      <Paragraph className='hidden md:flex'>
                        {project.config.project.endDate}
                      </Paragraph>
                    </li>
                  )
                })}
              </ul>
              <div className='flex flex-col md:flex-row-reverse items-center justify-between mt-4'>
                <div className='flex flex-row items-center'>
                  {hasPrevious(meta) && (
                    <>
                      <Button variant="default" size="sm" onClick={goToFirst}>
                        First page
                      </Button>
                      <Button variant="default" size="sm" onClick={previous}>
                        Previous
                      </Button>
                    </>
                  )}
                  {pages(meta).map(({number, isActive}) => (
                    <Button
                    key={number}
                    className={cn(
                      isActive &&
                      'bg-primary text-primary-foreground hover: bg/primary/90'
                    )}
                    variant="ghost"
                    size="sm"
                    onClick={() => goToPage(number)}>
                      {number}
                    </Button>
                  ))}
                  {hasNext(meta) && (
                    <>
                      <Button variant="default" size="sm" onClick={next}>
                        Next                     
                      </Button>
                      <Button variant="default" size="sm" onClick={() => goToLast(meta)}>
                        Last Page
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </PageLayout>
        </div>
  );
}