export default {
  fetch: async function (
    { projectId, page, pageSize, search, tags, sort },
    data,
    options
  ) {
    const params = new URLSearchParams();
    
    if(Array.isArray(tags) && tags.length > 0) {
      tags.forEach((tag) => params.append('tags', tag));
    }

    if (search) {
      params.append('search[text]', search);
    }

    if (sort) {
      if (!Array.isArray(sort)) sort = [sort];
      sort.map((criterium) => params.append('sort', criterium));
    }

    if (page >= 0 && pageSize) {
      params.append('page', page);
      params.append('pageSize', pageSize);
    } else if (pageSize >= 0) {
      params.append('page', 0);
      params.append('pageSize', pageSize);
    }

    let url = `/api/project/${projectId}/resource?includeUser=1&includeUserVote=1&includeVoteCount=1&includeTags=1&${params.toString()}`;
    return this.fetch(url);
  },

  delete: async function ({ projectId, resourceId }, data) {
    let url = `/api/project/${projectId}/resource/${data.id}`;
    let method = 'delete';
    let newData = await this.fetch(url, { method });
    return { id: data.id };
  },
};
