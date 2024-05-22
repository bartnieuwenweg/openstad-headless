export default function useComments(props) {
  let self = this;
  const projectId = props.projectId;
  const resourceId = props.resourceId;
  const sentiment = props.sentiment || null;
  const type = props.type || 'resource';

  let dataToReturn = [];
  let errorToReturn = undefined;
  let isLoadingToReturn = false;

  if (resourceId && resourceId !== '0') {
    const { data, error, isLoading } = self.useSWR(
      { projectId, resourceId, sentiment, type },
      'comments.fetch'
    );

    dataToReturn = data;
    errorToReturn = error;
    isLoadingToReturn = isLoading;
  }

  // add functionality
  let comments = dataToReturn || [];
  comments.create = function (newData) {
    return self.mutate(
      { projectId, resourceId, sentiment, type },
      'comments.create',
      newData,
      { action: 'create' }
    );
  };
  comments.map(async (comment) => {
    comment.update = function (newData) {
      return self.mutate(
        { projectId, resourceId, sentiment, type },
        'comments.update',
        newData,
        { action: 'update' }
      );
    };
    comment.delete = function (newData) {
      return self.mutate(
        { projectId, resourceId, sentiment, type },
        'comments.delete',
        comment,
        { action: 'delete' }
      );
    };
    comment.submitLike = function () {
      return self.mutate(
        { projectId, resourceId, sentiment, type },
        'comments.submitLike',
        comment,
        { action: 'update' }
      );
    };
    comment.replies?.map(async (reply) => {
      reply.update = function (newData) {
        return self.mutate(
          { projectId, resourceId, sentiment, type },
          'comments.update',
          newData,
          { action: 'update' }
        );
      };
      reply.delete = function (newData) {
        return self.mutate(
          { projectId, resourceId, sentiment, type },
          'comments.delete',
          reply,
          { action: 'delete' }
        );
      };
      reply.submitLike = function () {
        return self.mutate(
          { projectId, resourceId, sentiment, type },
          'comments.submitLike',
          reply,
          { action: 'update' }
        );
      };
    });
  });

  return {
    data: comments,
    error: errorToReturn,
    isLoading: isLoadingToReturn,
  };
}
