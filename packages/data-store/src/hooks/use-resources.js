export default function useResources({ 
  projectId,
  page = 0,
  pageSize = 20,
  search = '',
  tags = [],
  sort = 'createdAt_desc'
}) {
  let self = this;

  // If you add a prop here, the also do it for filter
  const { data, error, isLoading } = self.useSWR(
    { projectId, page, pageSize, search, tags, sort },
    'resources.fetch',
  );

  // add functionality
  let resources = data || [];

  // Resource where probably called without page and itemsPerPage
  if (Array.isArray(resources)) {
    resources = {
      metadata: {
        page: 0,
        pageSize: resources.length,
        pageCount: 1,
        totalCount: resources.length
      },
      records: resources,
    };
  }


  resources.records.create = function (newData) {
    return self.mutate({ projectId }, 'resources.create', newData, {
      action: 'create',
    });
  };

  resources.records.forEach(async (resource) => {
    resource.update = function (newData) {
      return self.mutate({ projectId }, 'resources.update', newData, {
        action: 'update',
      });
    };
    resource.delete = function () {
      return self.mutate({ projectId }, 'resources.delete', resource, {
        action: 'delete',
      });
    };
    resource.submitLike = function () {
      return self.mutate({ projectId }, 'resources.submitLike', resource, {
        action: 'update',
      });
    };
  });

  return [resources, error, isLoading];
}
