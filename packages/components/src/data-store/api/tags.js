export default {

  fetch: async function({ projectId, type }) {

    let url = `/api/project/${projectId}/tag?type=${type}`;
    return this.fetch(url);

  },

  create: async function({ projectId, type }, data) {

    let url = `/api/project/${projectId}/tag`;
    let method = 'post';
    delete data.id;
    let body = JSON.stringify(data);

    let newData = await this.fetch(url, { method, body })
    return newData;

  },

  update: async function({ projectId, type }, data) {

    let url = `/api/project/${projectId}/tag/${data.id}`;
    let method = 'put';
    let body = JSON.stringify(data);
      
    let newData = await this.fetch(url, { method, body })
    return newData;

  },

  delete: async function({ projectId, type }, data) {


    let url = `/api/project/${projectId}/tag/${data.id}`;
    let method = 'delete';

    let newData = await this.fetch(url, { method })
    return { id: data.id };

    
  },

}
