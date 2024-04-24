import { PageLayout } from '@/components/ui/page-layout'
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import { CSVLink } from 'react-csv';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import useUniqueCodes from '@/hooks/use-unique-codes';
import { searchTable, sortTable } from '@/components/ui/sortTable';

const headers = [
  { label: "ID", key: "id" },
  { label: "Code", key: "code" }
]

export default function ProjectCodes() {
  const router = useRouter();
  const { project } = router.query;
  const { data: uniquecodes, resetUniqueCode } = useUniqueCodes(project as string);


  const [filterData, setFilterData] = useState(uniquecodes?.data);
  const debouncedSearchTable = searchTable(setFilterData);

  useEffect(() => {
    setFilterData(uniquecodes?.data);
  }, [uniquecodes])
  
  if (!uniquecodes?.data) return null;

  return (
    <div>
      <PageLayout
        pageHeader="Projecten"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects'
          },
          {
            name: 'Stemcodes',
            url: `/projects/${project}/unique-codes`,
          },
        ]}
        action={
          <div className="flex flex-row w-full md:w-auto my-auto">
            <Link href={`/projects/${project}/unique-codes/create`}>
              <Button variant="default" className="text-xs p-2 w-fit">
                <Plus size="20" className="hidden md:flex" />
                Stemcodes toevoegen
              </Button>
            </Link>
            <Button variant="default" className="text-xs p-2 w-fit">
              <CSVLink data={uniquecodes.data} headers={headers}>
                Exporteer stemcodes
              </CSVLink>
            </Button>
          </div>
        }>
        <div className="container py-6">
        <input
            type="text"
            className='mb-4 p-2 rounded float-right'
            placeholder="Zoeken..."
            onChange={(e) => debouncedSearchTable(e.target.value, filterData, uniquecodes?.data)}
          />

          <div className="p-6 bg-white rounded-md clear-right">
            <div className="grid grid-cols-1 lg:grid-cols-4 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex truncate">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('id', e, filterData))}>
                  ID
                </button>
              </ListHeading>
              <ListHeading className="flex truncate">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('code', e, filterData))}>
                  Code
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex truncate">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('userId', e, filterData))}>
                  Gebruikt
                </button>
              </ListHeading>
            </div>
            <ul>
              {filterData?.map((code: any) => (
                <li key={code.id} className="grid grid-cols-2 lg:grid-cols-4 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                  <Paragraph className="hidden lg:flex truncate">{code.id || null}</Paragraph>
                  <Paragraph className="hidden lg:flex truncate">{code.code || null}</Paragraph>
                  <Paragraph className="flex truncate -mr-16">{!!code.userId ? `Gebruikt (userId=${code.userId})` : ''}</Paragraph>
                  {!!code.userId ? (
                    <div
                      className="hidden lg:flex ml-auto"
                      onClick={(e) => e.preventDefault()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="focus:outline-none">
                          <MoreHorizontal className="h-5 w-5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              resetUniqueCode(code.id)
                                .then(() =>
                                  toast.success('Stemcode successvol gereset')
                                )
                                .catch(() =>
                                  toast.error('Stemcode kon niet worden gereset')
                                )
                            }
                            }
                            className="text-xs">
                            Reset
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageLayout>
    </div>
  )
}
