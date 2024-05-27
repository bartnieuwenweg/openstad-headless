import React, { useState, useEffect } from 'react';
import { PageLayout } from '../../components/ui/page-layout';
import { ListHeading, Paragraph } from '../../components/ui/typography';
import Link from 'next/link';
import { useUsers, type userType } from '@/hooks/use-users';
import { Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sortTable, searchTable } from '@/components/ui/sortTable';

type mergedType = {
  [key: string]: userType & { key?: string };
}

export default function Users() {

  const { data } = useUsers();
  const [ users, setUsers ] = useState<userType[]>([]);

  useEffect(() => {
    // merge users
    if (!data) return;
    let merged:mergedType = {};
    data.map((user:userType) => {
      let key = user.idpUser?.identifier && user.idpUser?.provider ? `${user.idpUser.provider}-*-${user.idpUser.identifier}` : ( user.id?.toString() || 'unknown' );
      merged[key] = user;
    })
    setUsers( Object.keys(merged).map(key => ({ ...merged[key], key })) );
  }, [data]);

  const [filterData, setFilterData] = useState(data);
  const [filterSearchType, setFilterSearchType] = useState<string>('');
  const debouncedSearchTable = searchTable(setFilterData, filterSearchType);

  useEffect(() => {
    setFilterData(users);
  }, [users])

  if (!data) return null;

  const exportData = (data: BlobPart, fileName: string, type: string) => {
    // Create a link and download the file
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  function transform() {
    const jsonData = JSON.stringify(data);
    exportData(jsonData, `users.json`, "application/json");
  }

  return (
    <div>
      <PageLayout
        pageHeader="Gebruikers"
        breadcrumbs={[
          {
            name: 'Gebruikers',
            url: '/users',
          },
        ]}
        action={
          <div className='flex flex-row w-full md:w-auto my-auto'>
            <Link href="/users/create">
              <Button variant="default" className="flex w-fit">
                <Plus size="20" className="hidden lg:flex" />
                Gebruiker toevoegen
              </Button>
            </Link>
            <Button className="text-xs p-2 w-fit" type="submit" onClick={transform}>
              Exporteer gebruikers
            </Button>
          </div>
        }>
        <div className="container py-6">

          <div className="float-right mb-4 flex gap-4">
            <p className="text-xs font-medium text-muted-foreground self-center">Filter op:</p>
            <select
              className="p-2 rounded"
              onChange={(e) => setFilterSearchType(e.target.value)}
            >
              <option value="">Alles</option>
              <option value="email">E-mail</option>
              <option value="name">Naam</option>
              <option value="postcode">Postcode</option>
            </select>
            <input
              type="text"
              className='p-2 rounded'
              placeholder="Zoeken..."
              onChange={(e) => debouncedSearchTable(e.target.value, filterData, users)}
            />
          </div>

          <div className="p-6 bg-white rounded-md clear-right">
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('email', e, filterData))}>
                  E-mail
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('name', e, filterData))}>
                  Naam
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('postcode', e, filterData))}>
                  Postcode
                </button>
              </ListHeading>
            </div>
            <ul>
              {filterData?.map((user: any) => (
                <Link href={`/users/${btoa(user.key)}`} key={user.key}>
                  <li className="grid grid-cols-2 lg:grid-cols-4 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                    <Paragraph className="hidden lg:flex truncate">
                      {user.email}
                    </Paragraph>
                    <Paragraph className="truncate -mr-16">
                      {user.name}
                    </Paragraph>
                    <Paragraph className="truncate -mr-16">
                      {user.postcode}
                    </Paragraph>
                    <Paragraph className="flex">
                      <ChevronRight
                        strokeWidth={1.5}
                        className="w-5 h-5 my-auto ml-auto"
                      />
                    </Paragraph>
                  </li>
                </Link>
              ))}
            </ul>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
